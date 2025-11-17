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
