import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const ROOT = process.cwd()
const VOCABULARY_FILE = path.join(ROOT, 'src/pages/vocabulary/vocabulary.js')
const OUTPUT_FILE = path.join(ROOT, 'src/pages/vocabulary/wordPhonetics.generated.ts')
const CACHE_FILE = path.join(ROOT, '.word-phonetic-cache.json')
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890'
const execFileAsync = promisify(execFile)

function decodeJsonString(value) {
  return JSON.parse(`"${value}"`)
}

function normalizeWord(word) {
  return word.trim().toLowerCase()
}

function collectWords(source) {
  const words = []
  const pattern = /"word":\s*\[((?:"(?:\\.|[^"\\])*"\s*,?\s*)+)\]/g
  for (const match of source.matchAll(pattern)) {
    const itemPattern = /"((?:\\.|[^"\\])*)"/g
    for (const item of match[1].matchAll(itemPattern)) {
      const word = decodeJsonString(item[1]).trim()
      if (word && !words.includes(word))
        words.push(word)
    }
  }
  return words
}

async function readCache() {
  try {
    return JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'))
  }
  catch {
    return {}
  }
}

async function writeCache(cache) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8')
}

async function fetchJson(url) {
  const args = ['--silent', '--show-error', '--fail', '--max-time', '20']
  if (PROXY_URL)
    args.push('--proxy', PROXY_URL)
  args.push(url)

  const { stdout } = await execFileAsync('curl.exe', args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  })
  return JSON.parse(stdout)
}

function pickPhonetic(entries) {
  const phonetics = entries.flatMap(entry => entry.phonetics || [])
  const withAudio = phonetics.find(item => item.text && item.audio)
  const first = withAudio || phonetics.find(item => item.text)
  return first?.text || entries.find(entry => entry.phonetic)?.phonetic || ''
}

async function fetchSingleWordPhonetic(word) {
  const normalized = normalizeWord(word).replace(/[^a-z'-]/g, '')
  if (!normalized || normalized.length < 2)
    return ''

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`
    return pickPhonetic(await fetchJson(url))
  }
  catch {
    return ''
  }
}

async function fetchWordPhonetic(word, cache) {
  const cacheKey = normalizeWord(word)
  if (cacheKey in cache)
    return cache[cacheKey]

  let phonetic = await fetchSingleWordPhonetic(word)
  if (!phonetic && /[\s-]/.test(word)) {
    const parts = word.split(/[\s-]+/).filter(Boolean)
    const partPhonetics = []
    for (const part of parts)
      partPhonetics.push(await fetchSingleWordPhonetic(part))
    phonetic = partPhonetics.filter(Boolean).join(' ')
  }

  cache[cacheKey] = phonetic
  return phonetic
}

function makeOutput(phonetics) {
  return `const wordPhonetics: Record<string, string> = ${JSON.stringify(phonetics, null, 2)}

export default wordPhonetics
`
}

const source = await fs.readFile(VOCABULARY_FILE, 'utf8')
const words = collectWords(source)
console.log(`Found ${words.length} words`)

const cache = await readCache()
for (let i = 0; i < words.length; i++) {
  const word = words[i]
  await fetchWordPhonetic(word, cache)
  if ((i + 1) % 50 === 0 || i === words.length - 1) {
    await writeCache(cache)
    console.log(`Fetched ${i + 1}/${words.length}`)
  }
}

const phonetics = Object.fromEntries(words.map(word => [word, cache[normalizeWord(word)] || '']))
await fs.writeFile(OUTPUT_FILE, makeOutput(phonetics), 'utf8')
console.log(`Wrote ${OUTPUT_FILE}`)
