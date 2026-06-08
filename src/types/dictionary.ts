export type DictionaryApiDefinition = {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
};

export type DictionaryApiMeaning = {
  partOfSpeech: string;
  definitions: DictionaryApiDefinition[];
  synonyms?: string[];
  antonyms?: string[];
};

export type DictionaryApiPhonetic = {
  text?: string;
  audio?: string;
};

export type DictionaryApiEntry = {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryApiPhonetic[];
  meanings?: DictionaryApiMeaning[];
  sourceUrls?: string[];
  license?: {
    name?: string;
    url?: string;
  };
};

export type AudioOption = {
  id: string;
  label: string;
  url: string;
};

export type WordDefinition = {
  id: string;
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
};

export type WordMeaning = {
  id: string;
  partOfSpeech: string;
  definitions: WordDefinition[];
  synonyms: string[];
  antonyms: string[];
};

export type WordEntry = {
  key: string;
  word: string;
  phonetic?: string;
  audioOptions: AudioOption[];
  meanings: WordMeaning[];
  sourceUrls: string[];
  licenseName?: string;
  excerpt: string;
  usageExamples: string[];
  synonyms: string[];
};

export type WordSummary = {
  key: string;
  word: string;
  phonetic?: string;
  excerpt: string;
};

export type SearchHistoryItem = WordSummary & {
  searchedAt: string;
};

export type SavedWordItem = WordSummary & {
  savedAt: string;
};

export type DictionaryErrorKind = 'validation' | 'not-found' | 'network' | 'unexpected';

export type DictionaryScreenError = {
  kind: DictionaryErrorKind;
  message: string;
};
