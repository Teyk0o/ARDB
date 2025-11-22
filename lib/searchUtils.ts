/**
 * Normalizes text for search by:
 * - Converting to lowercase
 * - Removing accents
 * - Removing extra whitespace
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    // Remove accents: é, è, ê, ë -> e, etc.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Generates common plural forms for a word
 * Handles basic English and French plurals
 */
export function generatePluralVariations(word: string): string[] {
  const variations = [word];
  const normalized = normalizeSearchText(word);

  // English plurals
  if (!word.endsWith('s')) {
    variations.push(word + 's');
  }
  if (word.endsWith('y') && word.length > 1) {
    variations.push(word.slice(0, -1) + 'ies');
  }

  // French plurals
  if (!word.endsWith('s') && !word.endsWith('x')) {
    variations.push(word + 's');
  }

  // Remove duplicates
  return Array.from(new Set(variations.map(v => normalizeSearchText(v))));
}

/**
 * Checks if a text matches a search query
 * Handles accents, case-insensitivity, and basic plural forms
 * Also matches individual words (e.g., "composant mecanique" matches "Composants mécaniques avancés")
 */
export function matchesSearch(text: string, query: string): boolean {
  if (!text || !query) return !query;

  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);

  // Exact match of full query
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }

  // Split query into individual words and check if all words are found in text
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter(word => word.length > 0);

  // Check if ALL query words are present in the text (not necessarily consecutive)
  const allWordsMatch = queryWords.every(queryWord => {
    // Try exact word match
    if (normalizedText.includes(queryWord)) {
      return true;
    }

    // Try plural variations of each word
    const variations = generatePluralVariations(queryWord);
    return variations.some(variation => normalizedText.includes(variation));
  });

  return allWordsMatch;
}

/**
 * Checks if an item matches a search query across all available languages
 * Allows users to search in any language regardless of the current UI language
 * @param nameObject - Object containing translations (e.g., { en: "Battery", fr: "Batterie", ... })
 * @param descriptionObject - Optional object containing description translations
 * @param query - Search query string
 * @returns true if the query matches any language version of the name or description
 */
export function matchesSearchMultiLang(
  nameObject: string | { [key: string]: string },
  descriptionObject: string | { [key: string]: string } | null | undefined,
  query: string
): boolean {
  if (!query) return true;

  // If name is a string (old format), use regular search
  if (typeof nameObject === 'string') {
    const descStr = typeof descriptionObject === 'string' ? descriptionObject : '';
    return matchesSearch(nameObject, query) || matchesSearch(descStr, query);
  }

  // Search across all language versions of the name
  const nameMatches = Object.values(nameObject).some(translatedName => {
    if (translatedName && typeof translatedName === 'string') {
      return matchesSearch(translatedName, query);
    }
    return false;
  });

  if (nameMatches) return true;

  // Search across all language versions of the description if it exists
  if (descriptionObject && typeof descriptionObject === 'object') {
    const descriptionMatches = Object.values(descriptionObject).some(translatedDesc => {
      if (translatedDesc && typeof translatedDesc === 'string') {
        return matchesSearch(translatedDesc, query);
      }
      return false;
    });

    if (descriptionMatches) return true;
  }

  return false;
}
