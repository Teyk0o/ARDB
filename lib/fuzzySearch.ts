import { normalizeSearchText } from './searchUtils';

/**
 * Calculates the Levenshtein distance between two strings
 * This measures the minimum number of single-character edits needed to change one string into another
 * @param str1 First string to compare
 * @param str2 Second string to compare
 * @returns The Levenshtein distance (number of edits required)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create a 2D array for dynamic programming
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first column and row
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculates a similarity score between two strings (0-1, where 1 is identical)
 * @param str1 First string to compare
 * @param str2 Second string to compare
 * @returns Similarity score between 0 and 1
 */
export function similarityScore(str1: string, str2: string): number {
  const normalized1 = normalizeSearchText(str1);
  const normalized2 = normalizeSearchText(str2);

  if (normalized1 === normalized2) return 1;
  if (!normalized1 || !normalized2) return 0;

  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);

  return 1 - distance / maxLength;
}

/**
 * Checks if a query matches a target string with fuzzy matching
 * @param target The target string to match against
 * @param query The search query
 * @param threshold Minimum similarity score to consider a match (0-1, default 0.6)
 * @returns true if the query matches the target with sufficient similarity
 */
export function fuzzyMatch(target: string, query: string, threshold: number = 0.6): boolean {
  const normalizedTarget = normalizeSearchText(target);
  const normalizedQuery = normalizeSearchText(query);

  // Exact match
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Check similarity score
  const score = similarityScore(target, query);
  return score >= threshold;
}

/**
 * Finds the best fuzzy match from a list of candidates
 * @param query The search query
 * @param candidates Array of candidate strings to match against
 * @param threshold Minimum similarity score (0-1, default 0.6)
 * @returns Object with the best match and its score, or null if no match found
 */
export function findBestMatch(
  query: string,
  candidates: string[],
  threshold: number = 0.6
): { match: string; score: number } | null {
  let bestMatch: string | null = null;
  let bestScore = threshold;

  for (const candidate of candidates) {
    const score = similarityScore(candidate, query);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return bestMatch ? { match: bestMatch, score: bestScore } : null;
}
