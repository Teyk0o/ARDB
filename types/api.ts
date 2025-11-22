import { Item } from './item';

/**
 * Response type for the /api/item/[query] endpoint when successful
 */
export interface ItemSearchSuccessResponse {
  success: true;
  query: string;
  matchType: 'exact' | 'fuzzy';
  matchedLanguage: string;
  matchScore: number;
  responseLanguage: string;
  item: Item;
}

/**
 * Response type for the /api/item/[query] endpoint when item is not found
 */
export interface ItemSearchNotFoundResponse {
  error: 'Item not found';
  message: string;
  query: string;
  suggestion: string;
}

/**
 * Response type for the /api/item/[query] endpoint when query is invalid
 */
export interface ItemSearchBadRequestResponse {
  error: 'Query parameter is required';
  message: string;
}

/**
 * Response type for the /api/item/[query] endpoint when server error occurs
 */
export interface ItemSearchErrorResponse {
  error: 'Internal server error';
  message: string;
}

/**
 * Union type for all possible /api/item/[query] responses
 */
export type ItemSearchResponse =
  | ItemSearchSuccessResponse
  | ItemSearchNotFoundResponse
  | ItemSearchBadRequestResponse
  | ItemSearchErrorResponse;
