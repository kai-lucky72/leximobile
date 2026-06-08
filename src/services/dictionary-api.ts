import { create, isAxiosError } from 'axios';

import type {
  AudioOption,
  DictionaryApiEntry,
  DictionaryApiPhonetic,
  WordEntry,
  WordMeaning,
  WordSummary,
} from '@/types/dictionary';

export class DictionaryApiError extends Error {
  constructor(
    public kind: 'not-found' | 'network' | 'unexpected',
    message: string,
    public status?: number
  ) {
    super(message);
  }
}

const dictionaryClient = create({
  baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
  timeout: 15000,
});

function normalizeKey(word: string) {
  return word.trim().toLowerCase();
}

function uniqueStrings(values: (string | undefined)[]) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function buildAudioLabel(phonetic: DictionaryApiPhonetic, index: number) {
  const audioUrl = phonetic.audio?.toLowerCase() ?? '';
  if (audioUrl.includes('-uk')) {
    return 'UK';
  }
  if (audioUrl.includes('-us')) {
    return 'US';
  }
  if (phonetic.text) {
    return phonetic.text;
  }

  return `Audio ${index + 1}`;
}

function buildAudioOptions(phonetics: DictionaryApiPhonetic[] = []): AudioOption[] {
  const seen = new Set<string>();

  return phonetics
    .map((phonetic, index) => {
      const url = phonetic.audio?.trim();
      if (!url || seen.has(url)) {
        return null;
      }

      seen.add(url);
      return {
        id: `${index}-${url}`,
        label: buildAudioLabel(phonetic, index),
        url,
      } satisfies AudioOption;
    })
    .filter(Boolean) as AudioOption[];
}

function buildMeanings(meanings: DictionaryApiEntry['meanings'] = []): WordMeaning[] {
  return meanings.map((meaning, meaningIndex) => ({
    id: `${meaning.partOfSpeech}-${meaningIndex}`,
    partOfSpeech: meaning.partOfSpeech || 'Meaning',
    definitions: (meaning.definitions ?? []).map((definition, definitionIndex) => ({
      id: `${meaningIndex}-${definitionIndex}`,
      definition: definition.definition,
      example: definition.example,
      synonyms: uniqueStrings(definition.synonyms ?? []),
      antonyms: uniqueStrings(definition.antonyms ?? []),
    })),
    synonyms: uniqueStrings([...(meaning.synonyms ?? []), ...(meaning.definitions ?? []).flatMap((item) => item.synonyms ?? [])]),
    antonyms: uniqueStrings([...(meaning.antonyms ?? []), ...(meaning.definitions ?? []).flatMap((item) => item.antonyms ?? [])]),
  }));
}

function pickPhonetic(entry: DictionaryApiEntry) {
  const phoneticText = entry.phonetic?.trim();
  if (phoneticText) {
    return phoneticText;
  }

  return entry.phonetics?.find((phonetic) => phonetic.text?.trim())?.text?.trim();
}

function buildExcerpt(meanings: WordMeaning[]) {
  const firstDefinition = meanings.flatMap((meaning) => meaning.definitions)[0]?.definition;
  if (!firstDefinition) {
    return 'Meaning details are available in the full entry.';
  }

  if (firstDefinition.length <= 120) {
    return firstDefinition;
  }

  return `${firstDefinition.slice(0, 117).trimEnd()}...`;
}

export function toWordSummary(entry: WordEntry): WordSummary {
  return {
    key: entry.key,
    word: entry.word,
    phonetic: entry.phonetic,
    excerpt: entry.excerpt,
  };
}

export async function fetchWordEntry(rawWord: string): Promise<WordEntry> {
  const word = normalizeKey(rawWord);

  try {
    const response = await dictionaryClient.get<DictionaryApiEntry[]>(encodeURIComponent(word));
    const primaryEntry = response.data[0];
    if (!primaryEntry) {
      throw new DictionaryApiError(
        'unexpected',
        'The dictionary returned an empty response. Please try another word.'
      );
    }

    const meanings = buildMeanings(primaryEntry.meanings);
    const usageExamples = uniqueStrings(
      meanings.flatMap((meaning) => meaning.definitions.map((definition) => definition.example))
    ).slice(0, 3);
    const synonyms = uniqueStrings(meanings.flatMap((meaning) => meaning.synonyms)).slice(0, 8);

    return {
      key: normalizeKey(primaryEntry.word || word),
      word: primaryEntry.word || rawWord.trim(),
      phonetic: pickPhonetic(primaryEntry),
      audioOptions: buildAudioOptions(primaryEntry.phonetics),
      meanings,
      sourceUrls: primaryEntry.sourceUrls ?? [],
      licenseName: primaryEntry.license?.name,
      excerpt: buildExcerpt(meanings),
      usageExamples,
      synonyms,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new DictionaryApiError(
          'not-found',
          `We couldn't find "${rawWord.trim()}". Check the spelling and try again.`,
          404
        );
      }

      if (!error.response) {
        throw new DictionaryApiError(
          'network',
          'We could not reach the dictionary service. Check your connection and try again.'
        );
      }

      throw new DictionaryApiError(
        'unexpected',
        'The dictionary service returned an unexpected response. Please try again.',
        error.response.status
      );
    }

    if (error instanceof DictionaryApiError) {
      throw error;
    }

    throw new DictionaryApiError(
      'unexpected',
      'Something went wrong while loading this word. Please try again.'
    );
  }
}
