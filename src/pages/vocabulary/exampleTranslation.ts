const CACHE_KEY = 'vocabulary_example_translations_v1'

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
    // Ignore quota or private-mode storage failures; translations still show for this session.
  }
}

function hasExample(text?: string) {
  return Boolean(text && text.trim() && text.trim() !== '-')
}

async function translateText(text: string) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Translation request failed: ${response.status}`)

  const data = await response.json()
  return data?.responseData?.translatedText?.trim() || ''
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
    exampleTranslations[example] = translated || '暂无译文'
    saveCache()
  }
  catch {
    exampleTranslations[example] = '自动翻译暂时不可用'
  }
  finally {
    translatingExamples[example] = false
  }
}

export async function translateExamplesForItems(items: Array<{ example?: string }>) {
  const run = ++activeRun
  const examples = Array.from(new Set(items.map(item => item.example?.trim()).filter(hasExample)))

  for (const example of examples) {
    if (run !== activeRun)
      return
    await ensureExampleTranslation(example)
  }
}

export function getExampleTranslationStatus(text?: string) {
  loadCache()

  if (!hasExample(text))
    return ''

  const example = text!.trim()
  if (exampleTranslations[example])
    return exampleTranslations[example]

  return translatingExamples[example] ? '翻译中...' : '译文加载中...'
}
