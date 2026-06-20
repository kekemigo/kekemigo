interface VocabularyItem {
  word: string[]
  example?: string
  meaning?: string
}

const glossary: Record<string, string> = {
  approaching: '临近的',
  atmosphere: '氛围；大气',
  campus: '校园',
  surface: '表面',
  included: '被包括',
  contain: '包含',
  usually: '通常',
  determine: '确定；测定',
  currently: '目前',
  altitude: '海拔；高度',
  consequences: '后果',
  forecast: '预测',
  catastrophic: '灾难性的',
  hurricane: '飓风',
  coastal: '沿海的',
  jeopardised: '被危及',
  jeopardized: '被危及',
  destructive: '有破坏性的',
  equation: '局面；等式',
  phenomenon: '现象',
  resources: '资源',
  magnet: '磁铁',
  magnetic: '有磁性的',
  marble: '大理石',
  granite: '花岗岩',
  breeze: '微风',
  monsoon: '季风',
  damage: '破坏；损害',
  erupted: '喷发；爆发',
  molten: '熔化的',
  thermodynamic: '热力学的',
  violates: '违反',
  current: '当前的',
  poisoning: '污染；毒害',
  recognize: '认出；识别',
  severe: '严重的',
  torrent: '激流',
  seismic: '地震的',
  geological: '地质的',
  minerals: '矿物',
  avalanche: '雪崩',
  terrain: '地形',
  surrounding: '周围的',
  landscape: '风景；地貌',
  continent: '大陆',
  smugglers: '走私者',
  glacier: '冰川',
  dislocated: '移动；使脱位',
  swamp: '沼泽',
  mosquitoes: '蚊子',
  fertile: '肥沃的',
  roaming: '漫游；游荡',
}

const patternNotes: Array<[RegExp, string]> = [
  [/\bincluded in\b/i, 'be included in 表示“被包括在……里面”，注意这是被动表达。'],
  [/\bconsist(?:s|ed)? of\b/i, 'consist of 表示“由……组成”，不用被动语态。'],
  [/\bcontain(?:s|ed)?\b/i, 'contain 表示“包含”，常用于说明成分或内容。'],
  [/\bat an altitude of\b/i, 'at an altitude of + 数字 表示“在……高度/海拔”。'],
  [/\bbe rich in\b/i, 'be rich in 表示“富含……”，常写资源、矿物、营养等。'],
  [/\bused to be\b/i, 'used to be 表示“过去曾经是”，暗示现在已经不是。'],
  [/\bbe used by\b/i, 'be used by 是被动语态，表示“被……使用”。'],
  [/\bso .+ that\b/i, 'so ... that ... 表示“如此……以至于……”，连接结果。'],
  [/\bcould have been\b/i, 'could have been/done 是虚拟语气，表示“本可能……但实际未必发生”。'],
  [/\bit is generally thought that\b/i, 'It is generally thought that ... 表示“人们普遍认为……”，适合写作中引出观点。'],
  [/\bprevented .+ from\b/i, 'prevent sb. from doing sth. 表示“阻止某人做某事”。'],
  [/\bmade of\b/i, 'be made of 表示“由……制成”，能看出原材料时常用 of。'],
  [/\ba part of\b/i, 'a part of 表示“……的一部分”，比 part of 更强调其中一个组成部分。'],
  [/\bon the horizon\b/i, 'on the horizon 可表示“在地平线上”，也可引申为“即将出现”。'],
  [/\bcounting the losses\b/i, 'count the losses 表示“清点损失”，常用于灾害或事故语境。'],
  [/\bprovide .+ with\b/i, 'provide A with B 表示“给 A 提供 B”。'],
  [/\bsuggests? .+ could\b/i, 'suggest + 从句表示“表明/暗示”，后面接 could 时语气更委婉。'],
]

const commonWords = new Set([
  'about', 'after', 'again', 'almost', 'also', 'because', 'before', 'being', 'between', 'could',
  'every', 'first', 'from', 'have', 'into', 'last', 'made', 'many', 'more', 'most', 'much',
  'often', 'only', 'other', 'some', 'than', 'that', 'their', 'there', 'these', 'they', 'this',
  'those', 'through', 'under', 'upon', 'usually', 'water', 'were', 'when', 'where', 'which',
  'while', 'with', 'without', 'would',
])

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '')
}

function getGlossaryNotes(example: string, currentWords: string[]) {
  const current = new Set(currentWords.flatMap(word => word.split(/\s+/).map(normalizeWord)))
  const words = Array.from(new Set(example.split(/\s+/).map(normalizeWord)))

  return words
    .filter(word => word.length > 5 && !commonWords.has(word) && !current.has(word) && glossary[word])
    .slice(0, 3)
    .map(word => `${word}: ${glossary[word]}`)
}

export function getExampleStudyNotes(item: VocabularyItem) {
  const example = item.example?.trim()
  if (!example || example === '-')
    return []

  const notes: string[] = []
  const glossaryNotes = getGlossaryNotes(example, item.word)
  if (glossaryNotes.length)
    notes.push(`可能生词：${glossaryNotes.join('；')}`)

  for (const [pattern, note] of patternNotes) {
    if (pattern.test(example)) {
      notes.push(`句式/搭配：${note}`)
      break
    }
  }

  if (!notes.length && item.meaning)
    notes.push(`结合例句记忆：${item.word[0]} 在这里对应“${item.meaning}”。`)

  return notes
}
