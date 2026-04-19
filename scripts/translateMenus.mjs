import fs from 'node:fs'
import path from 'node:path'

const langs = ['en', 'fr', 'de']
const baseFiles = ['menus1400.json', 'menus1600.json', 'menus1800.json', 'menus2000.json']
const srcDir = path.resolve('src/data')
const outDir = path.resolve('src/data/i18n')
const cachePath = path.resolve('scripts/.translate-cache.json')

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const cache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  : {}

const SEP = '|||SEP123|||'

function getKey(lang, text) {
  return `${lang}::${text}`
}

function collectStrings(node, out = new Set()) {
  if (node == null) return out
  if (typeof node === 'string') {
    const trimmed = node.trim()
    if (trimmed) out.add(node)
    return out
  }
  if (Array.isArray(node)) {
    for (const item of node) collectStrings(item, out)
    return out
  }
  if (typeof node === 'object') {
    for (const value of Object.values(node)) collectStrings(value, out)
  }
  return out
}

function replaceStrings(node, dict) {
  if (node == null) return node
  if (typeof node === 'string') {
    return dict.get(node) ?? node
  }
  if (Array.isArray(node)) {
    return node.map((item) => replaceStrings(item, dict))
  }
  if (typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, replaceStrings(value, dict)]),
    )
  }
  return node
}

async function translateBatch(lang, texts) {
  const text = texts.join(SEP)
  const u = new URL('https://translate.googleapis.com/translate_a/single')
  u.searchParams.set('client', 'gtx')
  u.searchParams.set('sl', 'es')
  u.searchParams.set('tl', lang)
  u.searchParams.set('dt', 't')
  u.searchParams.set('q', text)

  const res = await fetch(u)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const json = await res.json()
  const translated = (json?.[0] ?? []).map((part) => part[0]).join('')
  const chunks = translated.split(SEP)
  if (chunks.length !== texts.length) {
    throw new Error(`Split mismatch ${chunks.length} != ${texts.length}`)
  }
  return chunks
}

async function translateText(lang, text) {
  const key = getKey(lang, text)
  if (cache[key]) return cache[key]
  const [translated] = await translateBatch(lang, [text])
  cache[key] = translated
  return translated
}

async function translateMany(lang, texts) {
  const pending = texts.filter((text) => !cache[getKey(lang, text)])
  const chunkSize = 8

  for (let i = 0; i < pending.length; i += chunkSize) {
    const chunk = pending.slice(i, i + chunkSize)
    try {
      const translated = await translateBatch(lang, chunk)
      translated.forEach((value, idx) => {
        cache[getKey(lang, chunk[idx])] = value
      })
    } catch {
      for (const text of chunk) {
        const value = await translateText(lang, text)
        cache[getKey(lang, text)] = value
      }
    }

    if ((i / chunkSize + 1) % 10 === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8')
      console.log(`[${lang}] progress ${Math.min(i + chunkSize, pending.length)}/${pending.length}`)
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8')

  const dict = new Map()
  for (const text of texts) {
    dict.set(text, cache[getKey(lang, text)] ?? text)
  }
  return dict
}

for (const file of baseFiles) {
  const fullPath = path.join(srcDir, file)
  if (!fs.existsSync(fullPath)) {
    console.log(`Skip missing ${file}`)
    continue
  }

  const source = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  const strings = [...collectStrings(source)]

  console.log(`\n${file}: ${strings.length} strings`)

  for (const lang of langs) {
    console.log(`Translating ${file} -> ${lang}`)
    const dict = await translateMany(lang, strings)
    const translated = replaceStrings(source, dict)

    const outName = file.replace('.json', `.${lang}.json`)
    const outPath = path.join(outDir, outName)
    fs.writeFileSync(outPath, JSON.stringify(translated, null, 2), 'utf8')
    console.log(`Generated ${outPath}`)
  }
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8')
console.log('\nDone')
