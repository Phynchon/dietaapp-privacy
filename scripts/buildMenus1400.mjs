import fs from 'node:fs'
import path from 'node:path'

const sourcePath = path.resolve('Dieta1400/1400 completo.txt')
const outputPath = path.resolve('src/data/menus1400.json')

const WEEK_IDS = [
  'primera',
  'segunda',
  'tercera',
  'cuarta',
  'quinta',
  'sexta',
  'séptima',
  'octava',
]

function cleanText(value) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[\t\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
}

function normalizeLine(line) {
  return line.replace(/^[\s•·]+/, '').replace(/\s+/g, ' ').trim()
}

function parseBulletLines(section) {
  const lines = section
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const items = []
  let current = ''

  for (const raw of lines) {
    const line = normalizeLine(raw)
    if (!line) continue
    if (/^(Ingredientes|Receta|Aceite de oliva)/i.test(line)) break

    const chunks = line
      .split(/\s+-\s+/)
      .map((part) => part.trim())
      .filter(Boolean)

    for (const chunk of chunks) {
      if (/^-\s*/.test(chunk)) {
        if (current) items.push(cleanText(current))
        current = chunk.replace(/^-\s*/, '').trim()
      } else if (/^[-–]/.test(chunk)) {
        if (current) items.push(cleanText(current))
        current = chunk.replace(/^[-–]\s*/, '').trim()
      } else if (raw.trim().startsWith('-') || raw.trim().startsWith('–')) {
        if (current) items.push(cleanText(current))
        current = chunk
      } else if (!current) {
        current = chunk
      } else {
        current += ` ${chunk}`
      }
    }
  }

  if (current) items.push(cleanText(current))
  return items.filter(Boolean)
}

function extractField(section, startKey, endKeyPattern) {
  const start = section.search(startKey)
  if (start === -1) return ''
  const from = section.slice(start)
  const startMatch = from.match(startKey)
  if (!startMatch) return ''
  const body = from.slice(startMatch[0].length)
  const endMatch = body.match(endKeyPattern)
  const value = endMatch ? body.slice(0, endMatch.index) : body
  return cleanText(value)
}

function parseMeal(section) {
  const itemsPart = section.split(/Ingredientes\s*:/i)[0] ?? section
  const items = parseBulletLines(itemsPart)

  const ingredients = extractField(
    section,
    /Ingredientes\s*:/i,
    /(Receta\s*:|Aceite de oliva\s*:|$)/i,
  )

  const recipe = extractField(
    section,
    /Receta\s*:/i,
    /(Aceite de oliva\s*:|$)/i,
  )

  const notes = []
  const noteRegex = /Aceite de oliva\s*:[^\n]*/gi
  let noteMatch
  while ((noteMatch = noteRegex.exec(section)) !== null) {
    const note = cleanText(noteMatch[0])
    if (note) notes.push(note)
  }

  return {
    items,
    ingredients,
    recipe,
    notes,
  }
}

function parseOptions(fullText) {
  const breakfastMatch = fullText.match(/DESAYUNO\s*Elegir entre\s*:\s*([\s\S]*?)MEDIA MAÑANA/i)
  const midMatch = fullText.match(/MEDIA MAÑANA\s*Elegir entre\s*:\s*([\s\S]*?)MERIENDA/i)
  const snackMatch = fullText.match(/MERIENDA\s*Elegir entre\s*:\s*([\s\S]*?)MENÚ\s*1\s*\(1400\)/i)

  return {
    breakfastOptions: breakfastMatch ? parseBulletLines(breakfastMatch[1]) : [],
    midmorningOptions: midMatch ? parseBulletLines(midMatch[1]) : [],
    snackOptions: snackMatch ? parseBulletLines(snackMatch[1]) : [],
  }
}

const rawText = fs.readFileSync(sourcePath, 'latin1')
const normalizedText = rawText.replace(/\r/g, '')

const sharedOptions = parseOptions(normalizedText)

const weekRegex = /MENÚ\s+([A-ZÁÉÍÓÚÑ]+)\s+SEMANA\s*\(1400\s*Kcal\.\)/gi
const weekMatches = [...normalizedText.matchAll(weekRegex)]

const weeks = weekMatches.map((match, index) => {
  const weekStart = match.index ?? 0
  const weekEnd =
    index < weekMatches.length - 1
      ? weekMatches[index + 1].index
      : normalizedText.length
  const weekText = normalizedText.slice(weekStart, weekEnd)

  const menuRegex = /MENÚ\s*(\d+)\s*\(1400\)\s*([\s\S]*?)(?=MENÚ\s*\d+\s*\(1400\)|$)/gi
  const days = []
  let menuMatch
  const detectedMenus = []

  while ((menuMatch = menuRegex.exec(weekText)) !== null) {
    const menuNumber = Number(menuMatch[1])
    const menuBody = menuMatch[2] ?? ''
    detectedMenus.push({ menuNumber, menuBody, index: menuMatch.index ?? 0 })

    const comidaSplit = menuBody.split(/COMIDA/i)
    const fromComida = comidaSplit[1] ?? menuBody
    const [lunchSection = '', dinnerSection = ''] = fromComida.split(/CENA/i)

    const lunch = parseMeal(lunchSection)
    const dinner = parseMeal(dinnerSection)

    days.push({
      menuNumber,
      lunch,
      dinner,
    })
  }

  const firstDetected = detectedMenus[0]
  if (firstDetected && firstDetected.menuNumber > 1) {
    const preface = weekText.slice(0, firstDetected.index)
    if (/COMIDA/i.test(preface) && /CENA/i.test(preface)) {
      const comidaSplit = preface.split(/COMIDA/i)
      const fromComida = comidaSplit[1] ?? preface
      const [lunchSection = '', dinnerSection = ''] = fromComida.split(/CENA/i)

      const lunch = parseMeal(lunchSection)
      const dinner = parseMeal(dinnerSection)

      days.push({
        menuNumber: 1,
        lunch,
        dinner,
      })
    }
  }

  days.sort((a, b) => a.menuNumber - b.menuNumber)

  const weekId = WEEK_IDS[index] ?? `semana-${index + 1}`
  const weekLabel = `${weekId.charAt(0).toUpperCase()}${weekId.slice(1)} semana`

  return {
    id: weekId,
    label: weekLabel,
    breakfastOptions: sharedOptions.breakfastOptions,
    midmorningOptions: sharedOptions.midmorningOptions,
    snackOptions: sharedOptions.snackOptions,
    days,
  }
})

const result = { weeks }

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8')

const weekCount = weeks.length
const menuCount = weeks.reduce((acc, week) => acc + week.days.length, 0)
console.log(`Generated ${outputPath}`)
console.log(`Weeks: ${weekCount}, Menus: ${menuCount}`)
if (weekCount !== 8 || menuCount !== 56) {
  console.log('WARNING: Expected 8 weeks and 56 menus.')
}
