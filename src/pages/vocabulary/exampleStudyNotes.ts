interface VocabularyItem {
  word: string[]
  example?: string
  meaning?: string
}

const LABEL_UNKNOWN_WORDS = '\u53ef\u80fd\u751f\u8bcd\uff1a'
const LABEL_PATTERN = '\u53e5\u5f0f/\u642d\u914d\uff1a'
const LABEL_SIMILAR = '\u540c\u7ec4\u8fa8\u6790\uff1a'
const LABEL_MEMORY = '\u7ed3\u5408\u4f8b\u53e5\u8bb0\u5fc6\uff1a'

const contrastNotes: Record<string, string> = {
  disaster: 'disaster \u662f\u6700\u901a\u7528\u7684\u201c\u707e\u96be\u201d\uff1bcalamity \u8bed\u6c14\u66f4\u4e66\u9762\uff0c\u5f3a\u8c03\u91cd\u5927\u4e0d\u5e78\uff1bmishap \u504f\u5c0f\u610f\u5916/\u5c0f\u6545\u969c\uff1bcatastrophic \u662f\u5f62\u5bb9\u8bcd\uff0c\u8868\u793a\u201c\u707e\u96be\u6027\u7684\u201d\u3002',
  mishap: 'mishap \u504f\u201c\u5c0f\u610f\u5916/\u5c0f\u6545\u969c\u201d\uff1bdisaster \u662f\u5927\u707e\u6216\u4e25\u91cd\u5931\u8d25\uff1bcalamity \u66f4\u4e66\u9762\uff0c\u5f3a\u8c03\u91cd\u5927\u4e0d\u5e78\u3002',
  catastrophic: 'catastrophic \u662f\u5f62\u5bb9\u8bcd\uff0c\u4fee\u9970 consequences/damage/effect\uff1bdisaster/calamity \u662f\u540d\u8bcd\uff0c\u8868\u793a\u707e\u96be\u672c\u8eab\u3002',
  calamity: 'calamity \u8bed\u6c14\u6bd4 disaster \u66f4\u4e66\u9762\u3001\u66f4\u5f3a\u8c03\u4e0d\u5e78\uff1bdisaster \u6700\u901a\u7528\uff1bmishap \u901a\u5e38\u6bd4\u8f83\u8f7b\u3002',
  endanger: 'endanger \u5f3a\u8c03\u201c\u4f7f...\u5904\u4e8e\u5371\u9669\u201d\uff1bjeopardise/jeopardize \u5f3a\u8c03\u201c\u5371\u53ca\u673a\u4f1a\u3001\u8ba1\u5212\u3001\u524d\u9014\u201d\uff1bdestructive \u662f\u5f62\u5bb9\u8bcd\uff0c\u6307\u6709\u7834\u574f\u6027\u3002',
  jeopardise: 'jeopardise/jeopardize \u5e38\u63a5 chances/career/plan/success\uff0c\u8868\u793a\u201c\u5371\u53ca\u201d\uff1bendanger \u66f4\u5e38\u63a5 life/health/species\uff0c\u8868\u793a\u4f7f\u5176\u5904\u4e8e\u5371\u9669\u3002',
  jeopardize: 'jeopardize = jeopardise\uff1b\u5e38\u63a5 chances/career/plan/success\uff1bendanger \u66f4\u5e38\u63a5 life/health/species\u3002',
  destructive: 'destructive \u662f\u5f62\u5bb9\u8bcd\uff0c\u8868\u793a\u201c\u6709\u7834\u574f\u6027\u7684\u201d\uff1bendanger/jeopardise \u662f\u52a8\u8bcd\uff0c\u8868\u793a\u4f7f\u67d0\u4e8b\u53d8\u5f97\u5371\u9669\u3002',
  gust: 'gust \u662f\u4e00\u9635\u98ce\uff0c\u77ed\u800c\u731b\uff1bbreeze \u662f\u5fae\u98ce\uff0c\u8f7b\u67d4\uff1bgale \u662f\u5927\u98ce\uff0c\u5f3a\u5ea6\u9ad8\uff1bmonsoon \u662f\u5b63\u98ce/\u96e8\u5b63\uff0c\u6307\u5b63\u8282\u6027\u98ce\u7cfb\u3002',
  breeze: 'breeze \u662f\u5fae\u98ce\uff0c\u8f7b\u67d4\u8212\u670d\uff1bgust \u662f\u4e00\u9635\u731b\u98ce\uff1bgale \u662f\u5927\u98ce\uff1bmonsoon \u662f\u5b63\u98ce/\u96e8\u5b63\u3002',
  monsoon: 'monsoon \u6307\u5b63\u98ce\u6216\u96e8\u5b63\uff0c\u662f\u6c14\u5019\u73b0\u8c61\uff1bgust/breeze/gale \u90fd\u662f\u5177\u4f53\u98ce\u529b\u6216\u98ce\u7684\u72b6\u6001\u3002',
  gale: 'gale \u662f\u5927\u98ce/\u5f3a\u98ce\uff1bbreeze \u662f\u5fae\u98ce\uff1bgust \u662f\u4e00\u9635\u731b\u98ce\uff1bmonsoon \u662f\u5b63\u98ce\u3002',
  hurricane: 'hurricane/typhoon \u672c\u8d28\u90fd\u662f\u70ed\u5e26\u6c14\u65cb\uff0c\u53ea\u662f\u5730\u533a\u53eb\u6cd5\u4e0d\u540c\uff1btornado \u662f\u9646\u5730\u4e0a\u5c3a\u5ea6\u66f4\u5c0f\u3001\u65cb\u8f6c\u66f4\u5267\u70c8\u7684\u9f99\u5377\u98ce\u3002',
  tornado: 'tornado \u662f\u9f99\u5377\u98ce\uff0c\u5c3a\u5ea6\u8f83\u5c0f\u4f46\u7834\u574f\u529b\u5f3a\uff1bhurricane/typhoon \u662f\u5927\u8303\u56f4\u70ed\u5e26\u6c14\u65cb\u3002',
  typhoon: 'typhoon \u591a\u7528\u4e8e\u897f\u5317\u592a\u5e73\u6d0b\u7684\u53f0\u98ce\uff1bhurricane \u591a\u7528\u4e8e\u5927\u897f\u6d0b/\u4e1c\u5317\u592a\u5e73\u6d0b\uff1btornado \u662f\u9f99\u5377\u98ce\u3002',
  terrain: 'terrain \u5f3a\u8c03\u5730\u5f62\u6761\u4ef6\uff0c\u5982\u5c71\u5730/\u5e73\u539f/\u96be\u8d70\uff1blandscape \u5f3a\u8c03\u770b\u5230\u7684\u98ce\u666f\u6216\u5730\u8c8c\u753b\u9762\u3002',
  landscape: 'landscape \u504f\u201c\u98ce\u666f/\u5730\u8c8c\u666f\u89c2\u201d\uff1bterrain \u504f\u201c\u5730\u5f62\u6761\u4ef6\u201d\uff0c\u5e38\u548c climb/cross/rough \u642d\u914d\u3002',
  plain: 'plain \u662f\u5e73\u539f\uff1bplateau \u662f\u9ad8\u539f\uff1bdelta \u662f\u6cb3\u53e3\u4e09\u89d2\u6d32\uff1boasis \u662f\u6c99\u6f20\u4e2d\u7eff\u6d32\u3002',
  plateau: 'plateau \u662f\u9ad8\u539f\uff0c\u5173\u952e\u662f\u201c\u9ad8\u800c\u5e73\u201d\uff1bplain \u662f\u5e73\u539f\uff0c\u4e0d\u5f3a\u8c03\u6d77\u62d4\uff1bdelta \u662f\u6cb3\u53e3\u6c89\u79ef\u5730\u5f62\u3002',
  delta: 'delta \u662f\u6cb3\u53e3\u4e09\u89d2\u6d32\uff1bplain \u662f\u5e73\u539f\uff1bplateau \u662f\u9ad8\u539f\uff1boasis \u662f\u7eff\u6d32\u3002',
  oasis: 'oasis \u662f\u6c99\u6f20\u4e2d\u7684\u7eff\u6d32\uff1bplain/plateau/delta \u90fd\u662f\u5730\u5f62\u7c7b\u540d\u8bcd\uff0c\u4e0d\u5e26\u201c\u6c99\u6f20\u6c34\u6e90\u201d\u542b\u4e49\u3002',
  deteriorate: 'deteriorate \u662f\u201c\u53d8\u574f\u201d\uff0c\u53ef\u4e0d\u53ca\u7269\uff1baggravate \u662f\u201c\u4f7f\u66f4\u7cdf\u201d\uff0c\u5e38\u53ca\u7269\uff1bdegrade \u504f\u201c\u964d\u4f4e\u8d28\u91cf/\u5730\u4f4d\u201d\uff1bupgrade \u662f\u53cd\u5411\uff0c\u201c\u5347\u7ea7\u201d\u3002',
  aggravate: 'aggravate \u5f3a\u8c03\u628a\u539f\u672c\u7684\u95ee\u9898\u52a0\u91cd\uff1bdeteriorate \u662f\u60c5\u51b5\u81ea\u5df1\u53d8\u574f\uff1bdegrade \u504f\u964d\u4f4e\u8d28\u91cf/\u8eab\u4efd\u3002',
  degrade: 'degrade \u504f\u201c\u964d\u4f4e\u8d28\u91cf/\u964d\u7ea7/\u4f7f\u9000\u5316\u201d\uff1bdeteriorate \u662f\u53d8\u574f\uff1baggravate \u662f\u4f7f\u66f4\u574f\uff1bupgrade \u662f\u5347\u7ea7\u3002',
  upgrade: 'upgrade \u662f\u201c\u5347\u7ea7/\u63d0\u5347\u201d\uff0c\u548c degrade \u76f8\u53cd\uff1bdeteriorate/aggravate \u90fd\u548c\u53d8\u574f\u6709\u5173\u3002',
  doubt: 'doubt \u662f\u4e00\u822c\u7684\u6000\u7591\uff1bsuspicion \u5e38\u5e26\u201c\u731c\u7591/\u5acc\u7591\u201d\uff0c\u89c9\u5f97\u6709\u95ee\u9898\uff1bskeptical/sceptical \u662f\u5f62\u5bb9\u8bcd\uff0c\u8868\u793a\u6301\u6000\u7591\u6001\u5ea6\u3002',
  suspicion: 'suspicion \u6bd4 doubt \u66f4\u50cf\u201c\u731c\u7591/\u5acc\u7591\u201d\uff1bskeptical/sceptical \u662f\u5f62\u5bb9\u8bcd\uff0c\u8868\u793a\u4e0d\u8f7b\u6613\u76f8\u4fe1\u3002',
  skeptical: 'skeptical/sceptical \u662f\u5f62\u5bb9\u8bcd\uff0c\u8868\u793a\u6000\u7591\u7684\u6001\u5ea6\uff1bdoubt/suspicion \u662f\u540d\u8bcd\u6216\u52a8\u8bcd\u3002',
  sceptical: 'sceptical = skeptical\uff0c\u82f1\u5f0f\u62fc\u5199\uff1b\u662f\u5f62\u5bb9\u8bcd\uff0c\u8868\u793a\u6000\u7591\u7684\u6001\u5ea6\u3002',
}

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

function getContrastNote(item: VocabularyItem, wordGroup?: VocabularyItem[]) {
  if (!wordGroup || wordGroup.length < 2)
    return ''

  for (const word of item.word) {
    const key = normalizeWord(word)
    if (contrastNotes[key])
      return contrastNotes[key]
  }

  const neighbors = wordGroup
    .filter(candidate => candidate !== item)
    .flatMap(candidate => candidate.word)
    .filter(Boolean)
    .slice(0, 4)

  if (neighbors.length && item.meaning) {
    return `${item.word[0]} \u8981\u548c\u540c\u7ec4\u7684 ${neighbors.join(' / ')} \u4e00\u8d77\u8bb0\uff1b\u5b83\u5728\u672c\u7ec4\u91cc\u504f\u5411\u201c${item.meaning}\u201d\uff0c\u80cc\u8bf5\u65f6\u4e3b\u8981\u770b\u4f7f\u7528\u573a\u666f\u548c\u642d\u914d\u533a\u5206\u3002`
  }

  return ''
}

export function getExampleStudyNotes(item: VocabularyItem, wordGroup?: VocabularyItem[]) {
  const example = item.example?.trim()

  const notes: string[] = []
  const contrastNote = getContrastNote(item, wordGroup)
  if (contrastNote)
    notes.push(`${LABEL_SIMILAR}${contrastNote}`)

  if (example && example !== '-') {
    const glossaryNotes = getGlossaryNotes(example, item.word)
    if (glossaryNotes.length)
      notes.push(`${LABEL_UNKNOWN_WORDS}${glossaryNotes.join('\uff1b')}`)

    for (const [pattern, note] of patternNotes) {
      if (pattern.test(example)) {
        notes.push(`${LABEL_PATTERN}${note}`)
        break
      }
    }
  }

  if (!notes.length && item.meaning)
    notes.push(`${LABEL_MEMORY}${item.word[0]} \u5728\u8fd9\u91cc\u5bf9\u5e94\u201c${item.meaning}\u201d\u3002`)

  return notes
}
