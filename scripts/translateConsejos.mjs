import fs from 'node:fs'
import path from 'node:path'
import { consejos } from '../src/data/consejos.js'

const langs = ['en', 'fr', 'de']
const outDir = path.resolve('src/data/i18n')
const cachePath = path.resolve('scripts/.translate-cache.json')
const cache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  : {}

const SEP = '|||SEP123|||'

function getKey(lang, text) {
  return `${lang}::${text}`
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
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  const translated = (json?.[0] ?? []).map((part) => part[0]).join('')
  const chunks = translated.split(SEP)
  if (chunks.length !== texts.length) throw new Error('split mismatch')
  return chunks
}

async function translateMany(lang, texts) {
  const pending = texts.filter((t) => !cache[getKey(lang, t)])
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
        const translated = await translateBatch(lang, [text])
        cache[getKey(lang, text)] = translated[0]
      }
    }

    if ((i / chunkSize + 1) % 10 === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8')
      console.log(`[${lang}] ${Math.min(i + chunkSize, pending.length)}/${pending.length}`)
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8')
}

for (const lang of langs) {
  const pieces = []
  for (const consejo of consejos) {
    pieces.push(consejo.title)
    pieces.push(consejo.text)
  }

  await translateMany(lang, pieces)

  const translated = consejos.map((consejo) => ({
    ...consejo,
    title: cache[getKey(lang, consejo.title)] ?? consejo.title,
    text: cache[getKey(lang, consejo.text)] ?? consejo.text,
  }))

  const outPath = path.join(outDir, `consejos.${lang}.json`)
  fs.writeFileSync(outPath, JSON.stringify(translated, null, 2), 'utf8')
  console.log(`Generated ${outPath}`)
}
