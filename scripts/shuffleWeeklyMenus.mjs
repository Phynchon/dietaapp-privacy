import fs from 'node:fs'
import path from 'node:path'

const ALL_FILES = [
  'src/data/menus1400.json',
  'src/data/menus1600.json',
  'src/data/menus1800.json',
  'src/data/menus2000.json',
]

function parseArgs(argv) {
  const args = {
    seed: null,
    kcal: null,
  }

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i]

    if (token === '--seed') {
      const value = argv[i + 1]
      if (!value) {
        throw new Error('Falta valor para --seed')
      }
      args.seed = value
      i += 1
      continue
    }

    if (token === '--kcal') {
      const value = argv[i + 1]
      if (!value || Number.isNaN(Number(value))) {
        throw new Error('El valor de --kcal debe ser numérico (1400, 1600, 1800, 2000)')
      }
      args.kcal = Number(value)
      i += 1
      continue
    }

    throw new Error(`Argumento no reconocido: ${token}`)
  }

  return args
}

function stringToSeed(input) {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function createMulberry32(seed) {
  let t = seed >>> 0
  return function rand() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), t | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleArray(items, rand) {
  const copy = items.slice()
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function sameOrder(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function getFilesToProcess(kcal) {
  if (!kcal) return ALL_FILES
  const target = `src/data/menus${kcal}.json`
  if (!ALL_FILES.includes(target)) {
    throw new Error(`kcal no soportado: ${kcal}. Usa 1400, 1600, 1800 o 2000.`)
  }
  return [target]
}

function processFile(filePath, rand) {
  const absolutePath = path.resolve(filePath)
  const raw = fs.readFileSync(absolutePath, 'utf8')
  const data = JSON.parse(raw)

  if (!Array.isArray(data.weeks)) {
    throw new Error(`${filePath}: no contiene weeks[]`)
  }

  data.weeks.forEach((week, weekIndex) => {
    if (!Array.isArray(week.days) || week.days.length !== 7) {
      throw new Error(`${filePath}: la semana ${weekIndex + 1} no tiene 7 menús`)
    }

    const original = week.days.slice()
    let shuffled = shuffleArray(original, rand)

    let attempts = 0
    while (sameOrder(original, shuffled) && attempts < 10) {
      shuffled = shuffleArray(original, rand)
      attempts += 1
    }

    week.days = shuffled.map((day, index) => ({
      ...day,
      menuNumber: index + 1,
    }))
  })

  fs.writeFileSync(absolutePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function main() {
  const args = parseArgs(process.argv)
  const activeSeed = args.seed ?? `${Date.now()}`
  const numericSeed = stringToSeed(activeSeed)
  const rand = createMulberry32(numericSeed)

  const files = getFilesToProcess(args.kcal)
  files.forEach((filePath) => processFile(filePath, rand))

  console.log(`Menús barajados correctamente en ${files.length} archivo(s).`) 
  console.log(`Semilla usada: ${activeSeed}`)
}

try {
  main()
} catch (error) {
  console.error(`Error: ${error.message}`)
  console.error('Uso: node scripts/shuffleWeeklyMenus.mjs [--seed valor] [--kcal 1400|1600|1800|2000]')
  process.exit(1)
}
