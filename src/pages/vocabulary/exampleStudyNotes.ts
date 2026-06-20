interface VocabularyItem {
  word: string[]
  example?: string
  meaning?: string
}

const LABEL_UNKNOWN_WORDS = '\u53ef\u80fd\u751f\u8bcd\uff1a'
const LABEL_PATTERN = '\u53e5\u5f0f/\u642d\u914d\uff1a'
const LABEL_MEMORY = '\u7ed3\u5408\u4f8b\u53e5\u8bb0\u5fc6\uff1a'

const glossary: Record<string, string> = {
  approaching: '\u4e34\u8fd1\u7684',
  atmosphere: '\u6c1b\u56f4\uff1b\u5927\u6c14',
  campus: '\u6821\u56ed',
  surface: '\u8868\u9762',
  included: '\u88ab\u5305\u62ec',
  contain: '\u5305\u542b',
  usually: '\u901a\u5e38',
  determine: '\u786e\u5b9a\uff1b\u6d4b\u5b9a',
  currently: '\u76ee\u524d',
  altitude: '\u6d77\u62d4\uff1b\u9ad8\u5ea6',
  consequences: '\u540e\u679c',
  forecast: '\u9884\u6d4b',
  catastrophic: '\u707e\u96be\u6027\u7684',
  hurricane: '\u98d3\u98ce',
  coastal: '\u6cbf\u6d77\u7684',
  jeopardised: '\u88ab\u5371\u53ca',
  jeopardized: '\u88ab\u5371\u53ca',
  destructive: '\u6709\u7834\u574f\u6027\u7684',
  phenomenon: '\u73b0\u8c61',
  resources: '\u8d44\u6e90',
  magnet: '\u78c1\u94c1',
  magnetic: '\u6709\u78c1\u6027\u7684',
  marble: '\u5927\u7406\u77f3',
  granite: '\u82b1\u5c97\u5ca9',
  breeze: '\u5fae\u98ce',
  monsoon: '\u5b63\u98ce',
  damage: '\u7834\u574f\uff1b\u635f\u5bb3',
  erupted: '\u55b7\u53d1\uff1b\u7206\u53d1',
  molten: '\u7194\u5316\u7684',
  thermodynamic: '\u70ed\u529b\u5b66\u7684',
  violates: '\u8fdd\u53cd',
  current: '\u5f53\u524d\u7684',
  poisoning: '\u6c61\u67d3\uff1b\u6bd2\u5bb3',
  recognize: '\u8ba4\u51fa\uff1b\u8bc6\u522b',
  severe: '\u4e25\u91cd\u7684',
  torrent: '\u6fc0\u6d41',
  seismic: '\u5730\u9707\u7684',
  geological: '\u5730\u8d28\u7684',
  minerals: '\u77ff\u7269',
  avalanche: '\u96ea\u5d29',
  terrain: '\u5730\u5f62',
  surrounding: '\u5468\u56f4\u7684',
  landscape: '\u98ce\u666f\uff1b\u5730\u8c8c',
  continent: '\u5927\u9646',
  smugglers: '\u8d70\u79c1\u8005',
  glacier: '\u51b0\u5ddd',
  dislocated: '\u79fb\u52a8\uff1b\u4f7f\u8131\u4f4d',
  swamp: '\u6cbc\u6cfd',
  mosquitoes: '\u868a\u5b50',
  fertile: '\u80a5\u6c83\u7684',
  roaming: '\u6f2b\u6e38\uff1b\u6e38\u8361',
}

const patternNotes: Array<[RegExp, string]> = [
  [/\bincluded in\b/i, 'be included in = \u88ab\u5305\u62ec\u5728...\u91cc\uff0c\u8fd9\u662f\u88ab\u52a8\u8868\u8fbe\u3002'],
  [/\bconsist(?:s|ed)? of\b/i, 'consist of = \u7531...\u7ec4\u6210\uff0c\u4e0d\u7528\u88ab\u52a8\u8bed\u6001\u3002'],
  [/\bcontain(?:s|ed)?\b/i, 'contain = \u5305\u542b\uff0c\u5e38\u7528\u4e8e\u8bf4\u660e\u6210\u5206\u6216\u5185\u5bb9\u3002'],
  [/\bat an altitude of\b/i, 'at an altitude of + \u6570\u5b57 = \u5728...\u9ad8\u5ea6/\u6d77\u62d4\u3002'],
  [/\bbe rich in\b/i, 'be rich in = \u5bcc\u542b...\uff0c\u5e38\u5199\u8d44\u6e90\u3001\u77ff\u7269\u3001\u8425\u517b\u7b49\u3002'],
  [/\bused to be\b/i, 'used to be = \u8fc7\u53bb\u66fe\u7ecf\u662f\uff0c\u6697\u793a\u73b0\u5728\u5df2\u7ecf\u4e0d\u662f\u3002'],
  [/\bbe used by\b/i, 'be used by = \u88ab...\u4f7f\u7528\uff0c\u88ab\u52a8\u8bed\u6001\u3002'],
  [/\bso .+ that\b/i, 'so ... that ... = \u5982\u6b64...\u4ee5\u81f3\u4e8e...\uff0c\u8fde\u63a5\u7ed3\u679c\u3002'],
  [/\bcould have been\b/i, 'could have been/done = \u672c\u53ef\u80fd...\uff0c\u5e38\u5e26\u865a\u62df\u8bed\u6c14\u3002'],
  [/\bit is generally thought that\b/i, 'It is generally thought that ... = \u4eba\u4eec\u666e\u904d\u8ba4\u4e3a...\u3002'],
  [/\bprevented .+ from\b/i, 'prevent sb. from doing sth. = \u963b\u6b62\u67d0\u4eba\u505a\u67d0\u4e8b\u3002'],
  [/\bmade of\b/i, 'be made of = \u7531...\u5236\u6210\uff0c\u80fd\u770b\u51fa\u539f\u6750\u6599\u65f6\u5e38\u7528 of\u3002'],
  [/\ba part of\b/i, 'a part of = ...\u7684\u4e00\u90e8\u5206\uff0c\u5f3a\u8c03\u5176\u4e2d\u4e00\u4e2a\u7ec4\u6210\u90e8\u5206\u3002'],
  [/\bon the horizon\b/i, 'on the horizon = \u5728\u5730\u5e73\u7ebf\u4e0a\uff1b\u4e5f\u53ef\u5f15\u7533\u4e3a\u5373\u5c06\u51fa\u73b0\u3002'],
  [/\bcounting the losses\b/i, 'count the losses = \u6e05\u70b9\u635f\u5931\uff0c\u5e38\u7528\u4e8e\u707e\u5bb3\u6216\u4e8b\u6545\u8bed\u5883\u3002'],
  [/\bprovide .+ with\b/i, 'provide A with B = \u7ed9 A \u63d0\u4f9b B\u3002'],
  [/\bsuggests? .+ could\b/i, 'suggest + \u4ece\u53e5 = \u8868\u660e/\u6697\u793a\uff1b\u540e\u9762\u63a5 could \u65f6\u8bed\u6c14\u66f4\u59d4\u5a49\u3002'],
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
    notes.push(`${LABEL_UNKNOWN_WORDS}${glossaryNotes.join('\uff1b')}`)

  for (const [pattern, note] of patternNotes) {
    if (pattern.test(example)) {
      notes.push(`${LABEL_PATTERN}${note}`)
      break
    }
  }

  if (!notes.length && item.meaning)
    notes.push(`${LABEL_MEMORY}${item.word[0]} \u5728\u8fd9\u91cc\u5bf9\u5e94\u201c${item.meaning}\u201d\u3002`)

  return notes
}
