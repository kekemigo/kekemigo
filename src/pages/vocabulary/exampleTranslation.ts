const CACHE_KEY = 'vocabulary_example_translations_v3'
const NO_TRANSLATION = '\u6682\u65e0\u8bd1\u6587'
const UNAVAILABLE = '\u81ea\u52a8\u7ffb\u8bd1\u6682\u65f6\u4e0d\u53ef\u7528'
const TRANSLATING = '\u7ffb\u8bd1\u4e2d...'
const LOADING = '\u8bd1\u6587\u52a0\u8f7d\u4e2d...'

export const exampleTranslations = reactive<Record<string, string>>({})
export const translatingExamples = reactive<Record<string, boolean>>({})

let cacheLoaded = false
let activeRun = 0

function loadCache() {
  if (cacheLoaded)
    return

  cacheLoaded = true
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached)
      Object.assign(exampleTranslations, JSON.parse(cached))
  }
  catch {
    localStorage.removeItem(CACHE_KEY)
  }
}

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(exampleTranslations))
  }
  catch {
    // Storage can fail in private mode or when quota is full.
  }
}

function hasExample(text?: string) {
  return Boolean(text && text.trim() && text.trim() !== '-')
}

async function translateWithMyMemory(text: string) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`MyMemory failed: ${response.status}`)

  const data = await response.json()
  return data?.responseData?.translatedText?.trim() || ''
}

async function translateWithGoogle(text: string) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Google translate failed: ${response.status}`)

  const data = await response.json()
  return data?.[0]?.map((part: string[]) => part?.[0] || '').join('').trim() || ''
}

async function translateText(text: string) {
  try {
    return await translateWithMyMemory(text)
  }
  catch {
    return await translateWithGoogle(text)
  }
}

export async function ensureExampleTranslation(text?: string) {
  loadCache()

  if (!hasExample(text))
    return

  const example = text!.trim()
  if (exampleTranslations[example] || translatingExamples[example])
    return

  translatingExamples[example] = true
  try {
    const translated = await translateText(example)
    exampleTranslations[example] = translated || NO_TRANSLATION
    saveCache()
  }
  catch {
    exampleTranslations[example] = UNAVAILABLE
  }
  finally {
    translatingExamples[example] = false
  }
}

export async function translateExamplesForItems(items: Array<{ example?: string }>) {
  const run = ++activeRun
  const examples = Array.from(new Set(items.map(item => item.example?.trim()).filter(hasExample)))

  for (let i = 0; i < examples.length; i += 4) {
    if (run !== activeRun)
      return

    await Promise.all(examples.slice(i, i + 4).map(example => ensureExampleTranslation(example)))
  }
}

export function getExampleTranslationStatus(text?: string) {
  loadCache()

  if (!hasExample(text))
    return ''

  const example = text!.trim()
  if (exampleTranslations[example])
    return exampleTranslations[example]

  return translatingExamples[example] ? TRANSLATING : LOADING
}
