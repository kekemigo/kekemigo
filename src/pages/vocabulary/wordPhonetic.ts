import wordPhonetics from './wordPhonetics.generated'

const phonetics = wordPhonetics as Record<string, string>

export function getWordPhonetic(word?: string) {
  if (!word)
    return ''

  return phonetics[word] || phonetics[word.toLowerCase()] || ''
}

export function getWordPhoneticDisplay(word?: string) {
  return getWordPhonetic(word) || '\u6682\u65e0'
}
