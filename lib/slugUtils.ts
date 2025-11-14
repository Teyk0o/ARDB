/**
 * Utility functions for URL slug generation and validation
 * Optimized for SEO with proper character handling across all languages
 */

/**
 * Generates a URL-friendly slug from a string
 * Handles special characters, accents, and multiple languages
 *
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    // Normalize unicode characters (decompose accents)
    .normalize('NFD')
    // Remove diacritical marks
    .replace(/[\u0300-\u036f]/g, '')
    // Convert to lowercase
    .toLowerCase()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^\-+|\-+$/g, '');
}

/**
 * Validates if a slug is properly formatted
 *
 * @param slug - The slug to validate
 * @returns true if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  // Slug should be lowercase, contain only alphanumeric and hyphens
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Extracts ID from a slug
 * Since we now use only the name slug (not id-slug format),
 * we need to search for the item by name/slug in the items data
 *
 * @param slug - The slug (e.g., "adrenaline-shot")
 * @returns Object with slug (no id), or null if invalid format
 */
export function parseItemSlug(
  slug: string
): { slug: string } | null {
  if (!slug) return null;

  // The slug is just the name slug
  return { slug };
}

/**
 * Gets the English name from raw item data
 * @param rawItem - The raw item object
 * @returns English name or fallback
 */
export function getEnglishName(rawItem: any): string {
  if (typeof rawItem.name === 'string') {
    return rawItem.name;
  }
  if (typeof rawItem.name === 'object' && rawItem.name.en) {
    return rawItem.name.en;
  }
  return '';
}

/**
 * Creates the slug format for URLs using English name
 *
 * @param itemId - The item ID (e.g., "adrenaline_shot")
 * @param englishName - The English item name (e.g., "Adrenaline Shot")
 * @returns Slug (e.g., "adrenaline-shot")
 */
export function createItemSlug(itemId: string, englishName: string): string {
  // Return just the name slug (simpler and cleaner URLs)
  return generateSlug(englishName);
}

/**
 * Validates if a slug matches an item's name
 *
 * @param slug - The slug to validate
 * @param itemId - The actual item ID (not used in validation)
 * @param itemName - The actual item name
 * @returns true if slug is valid for this item
 */
export function isValidItemSlug(
  slug: string,
  itemId: string,
  itemName: string
): boolean {
  const expectedSlug = createItemSlug(itemId, itemName);

  // Check if the slug matches the expected slug
  return slug === expectedSlug;
}
