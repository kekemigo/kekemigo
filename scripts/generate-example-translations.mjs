import fs from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const ROOT = process.cwd()
const VOCABULARY_FILE = path.join(ROOT, 'src/pages/vocabulary/vocabulary.js')
const OUTPUT_FILE = path.join(ROOT, 'src/pages/vocabulary/exampleTranslations.generated.ts')
const CACHE_FILE = path.join(ROOT, '.example-translation-cache.json')
const BATCH_SIZE = 20
const DELIMITER = '\n[[[IELTS_EXAMPLE_SPLIT_834729]]]\n'
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890'
const execFileAsync = promisify(execFile)

function decodeJsonString(value) {
  return JSON.parse(`"${value}"`)
}

function collectExamples(source) {
  const examples = []
  const pattern = /"example":\s*"((?:\\.|[^"\\])*)"/g
  for (const match of source.matchAll(pattern)) {
    const example = decodeJsonString(match[1]).trim()
    if (example && example !== '-' && !examples.includes(example))
      examples.push(example)
  }
  return examples
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
  const args = ['--silent', '--show-error', '--fail', '--max-time', '30']
  if (PROXY_URL)
    args.push('--proxy', PROXY_URL)
  args.push(url)

  const { stdout } = await execFileAsync('curl.exe', args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  })
  return JSON.parse(stdout)
}

async function translateText(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`
  const data = await fetchJson(url)
  return data?.[0]?.map(part => part?.[0] || '').join('').trim() || ''
}

async function translateBatch(examples) {
  if (examples.length === 1)
    return [await translateText(examples[0])]

  const translated = await translateText(examples.join(DELIMITER))
  const parts = translated
    .split('[[[IELTS_EXAMPLE_SPLIT_834729]]]')
    .map(part => part.trim())

  if (parts.length === examples.length)
    return parts

  console.warn(`Batch split mismatch: expected ${examples.length}, got ${parts.length}. Falling back to single requests.`)
  return await Promise.all(examples.map(example => translateText(example)))
}

function makeOutput(translations) {
  return `const exampleTranslations: Record<string, string> = ${JSON.stringify(translations, null, 2)}

export default exampleTranslations
`
}

const source = await fs.readFile(VOCABULARY_FILE, 'utf8')
const examples = collectExamples(source)
console.log(`Found ${examples.length} examples`)
const cache = await readCache()

let completed = 0
for (let i = 0; i < examples.length; i += BATCH_SIZE) {
  const batch = examples.slice(i, i + BATCH_SIZE).filter(example => !cache[example])
  if (!batch.length) {
    completed += examples.slice(i, i + BATCH_SIZE).length
    continue
  }

  const translated = await translateBatch(batch)
  for (let j = 0; j < batch.length; j++)
    cache[batch[j]] = translated[j]

  completed += examples.slice(i, i + BATCH_SIZE).length
  await writeCache(cache)
  console.log(`Translated ${completed}/${examples.length}`)
}

const translations = Object.fromEntries(examples.map(example => [example, cache[example] || '']))
await fs.writeFile(OUTPUT_FILE, makeOutput(translations), 'utf8')
console.log(`Wrote ${OUTPUT_FILE}`)
