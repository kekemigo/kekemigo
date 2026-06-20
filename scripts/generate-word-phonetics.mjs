import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { dictionary as cmuDictionary } from 'cmu-pronouncing-dictionary'

const ROOT = process.cwd()
const VOCABULARY_FILE = path.join(ROOT, 'src/pages/vocabulary/vocabulary.js')
const OUTPUT_FILE = path.join(ROOT, 'src/pages/vocabulary/wordPhonetics.generated.ts')
const CACHE_FILE = path.join(ROOT, '.word-phonetic-cache.json')
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890'
const ENABLE_ONLINE_LOOKUP = process.env.PHONETICS_ONLINE === 'true'
const execFileAsync = promisify(execFile)

const ARPABET_TO_IPA = {
  AA: 'ɑ',
  AE: 'æ',
  AH: 'ʌ',
  AO: 'ɔ',
  AW: 'aʊ',
  AY: 'aɪ',
  B: 'b',
  CH: 'tʃ',
  D: 'd',
  DH: 'ð',
  EH: 'ɛ',
  ER: 'ɚ',
  EY: 'eɪ',
  F: 'f',
  G: 'ɡ',
  HH: 'h',
  IH: 'ɪ',
  IY: 'i',
  JH: 'dʒ',
  K: 'k',
  L: 'l',
  M: 'm',
  N: 'n',
  NG: 'ŋ',
  OW: 'oʊ',
  OY: 'ɔɪ',
  P: 'p',
  R: 'r',
  S: 's',
  SH: 'ʃ',
  T: 't',
  TH: 'θ',
  UH: 'ʊ',
  UW: 'u',
  V: 'v',
  W: 'w',
  Y: 'j',
  Z: 'z',
  ZH: 'ʒ',
}

const PHONETIC_OVERRIDES = {
  hydrosphere: '/ˈhaɪdrəˌsfɪr/',
  lithosphere: '/ˈlɪθəˌsfɪr/',
  respire: '/rɪˈspaɪr/',
  interbreed: '/ˌɪntərˈbrid/',
  refraction: '/rɪˈfrækʃən/',
  matriculation: '/məˌtrɪkjəˈleɪʃən/',
  maths: '/mæθs/',
  pictograph: '/ˈpɪktəˌɡræf/',
  antonym: '/ˈæntənɪm/',
  preposition: '/ˌprɛpəˈzɪʃən/',
  refectory: '/rɪˈfɛktəri/',
  brickwork: '/ˈbrɪkˌwɝk/',
  swop: '/swɑp/',
  résumé: '/ˈrɛzəmeɪ/',
  biorhythm: '/ˈbaɪoʊˌrɪðəm/',
  influenze: '/ˌɪnfluˈɛnzə/',
  slothful: '/ˈsloʊθfəl/',
}

function decodeJsonString(value) {
  return JSON.parse(`"${value}"`)
}

function normalizeWord(word) {
  return word.trim().toLowerCase()
}

function normalizeDictionaryKey(word) {
  return normalizeWord(word)
    .replace(/[’]/g, '\'')
    .replace(/[^a-z'.-]/g, '')
}

function arpabetToIpa(pronunciation) {
  const converted = pronunciation.split(/\s+/).map((token) => {
    const match = token.match(/^([A-Z]+)([012])?$/)
    if (!match)
      return ''

    const [, sound, stress] = match
    const ipa = ARPABET_TO_IPA[sound]
    if (!ipa)
      return ''

    if (stress === '1')
      return `ˈ${ipa}`
    if (stress === '2')
      return `ˌ${ipa}`
    return ipa
  }).join('')

  return converted ? `/${converted}/` : ''
}

function findCmuPronunciation(word) {
  const key = normalizeDictionaryKey(word)
  if (!key)
    return ''

  const variants = [
    key,
    key.replace(/[.-]/g, ''),
    key.replace(/ise$/, 'ize'),
    key.replace(/yse$/, 'yze'),
    key.replace(/isation$/, 'ization'),
    key.replace(/our$/, 'or'),
    key.replace(/our([a-z])/, 'or$1'),
    key.replace(/re$/, 'er'),
    key.replace(/ogue$/, 'og'),
    key.replace(/^enrol$/, 'enroll'),
    key.replace(/^artefact$/, 'artifact'),
    key.replace(/^appetiser$/, 'appetizer'),
    key.replace(/^instalment$/, 'installment'),
    key.replace(/^manoeuvre$/, 'maneuver'),
    key.replace(/^sceptical$/, 'skeptical'),
    key.normalize('NFD').replace(/[\u0300-\u036F]/g, ''),
  ]

  for (const variant of variants) {
    if (cmuDictionary[variant])
      return cmuDictionary[variant]
  }

  return ''
}

function getCmuPhonetic(word) {
  const override = PHONETIC_OVERRIDES[normalizeWord(word)]
  if (override)
    return override

  const pronunciation = findCmuPronunciation(word)
  if (pronunciation)
    return arpabetToIpa(pronunciation)

  if (/[\s-]/.test(word)) {
    const parts = word.split(/[\s-]+/).filter(Boolean)
    const partPhonetics = parts.map(getCmuPhonetic).filter(Boolean)
    if (partPhonetics.length === parts.length)
      return partPhonetics.join(' ')
  }

  return ''
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
  if (cache[cacheKey])
    return cache[cacheKey]

  let phonetic = getCmuPhonetic(word)
  if (phonetic) {
    cache[cacheKey] = phonetic
    return phonetic
  }

  if (!ENABLE_ONLINE_LOOKUP) {
    cache[cacheKey] = ''
    return ''
  }

  phonetic = await fetchSingleWordPhonetic(word)
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
