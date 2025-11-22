# Public API Documentation

## Item Search API

The Item Search API allows you to retrieve detailed information about items by searching with their name in any supported language. The API supports both exact and fuzzy matching to handle misspellings and variations.

### Endpoint

```
GET /api/item/[query]
```

### Parameters

#### Path Parameters

- **query** (required): The item name to search for, in any supported language. Can be URL-encoded.

#### Query Parameters

- **lang** (optional): The language code for the response. Defaults to `en` (English).
  - Supported values: `en`, `fr`, `de`, `es`, `pt`, `pl`, `no`, `da`, `it`, `ru`, `ja`, `zh-TW`, `uk`, `zh-CN`, `kr`, `tr`, `hr`, `sr`

### Supported Languages

| Code | Language |
|------|----------|
| `en` | English |
| `fr` | French (Français) |
| `de` | German (Deutsch) |
| `es` | Spanish (Español) |
| `pt` | Portuguese (Português) |
| `pl` | Polish (Polski) |
| `no` | Norwegian (Norsk) |
| `da` | Danish (Dansk) |
| `it` | Italian (Italiano) |
| `ru` | Russian (Русский) |
| `ja` | Japanese (日本語) |
| `zh-TW` | Traditional Chinese (繁體中文) |
| `uk` | Ukrainian (Українська) |
| `zh-CN` | Simplified Chinese (简体中文) |
| `kr` | Korean (한국어) |
| `tr` | Turkish (Türkçe) |
| `hr` | Croatian (Hrvatski) |
| `sr` | Serbian (Српски) |

### Response Format

#### Success Response (200 OK)

```json
{
  "success": true,
  "query": "adrenaline",
  "matchType": "exact",
  "matchedLanguage": "en",
  "matchScore": 1.0,
  "responseLanguage": "en",
  "item": {
    "id": "adrenaline_shot",
    "name": "Adrenaline Shot",
    "nameEn": "Adrenaline Shot",
    "description": "A serum that fully restores stamina and temporarily increases stamina regeneration.",
    "item_type": "Quick Use",
    "icon": "adrenaline_shot.png",
    "rarity": "Common",
    "value": 300,
    "tag": "keep",
    "recyclesInto": {
      "chemicals": 1,
      "plastic_parts": 1
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Empty or missing query
```json
{
  "error": "Query parameter is required",
  "message": "Please provide an item name to search for"
}
```

**404 Not Found** - Item not found
```json
{
  "error": "Item not found",
  "message": "No item found matching \"unknown_item\"",
  "query": "unknown_item",
  "suggestion": "Try checking the spelling or use a different language"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Internal server error",
  "message": "An error occurred while searching for the item"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `query` | string | The original search query |
| `matchType` | string | Type of match found: `"exact"` or `"fuzzy"` |
| `matchedLanguage` | string | Language code in which the match was found |
| `matchScore` | number | Similarity score (0-1), where 1 is a perfect match |
| `responseLanguage` | string | Language code of the returned item data |
| `item` | object | Complete item data in the requested language |

### Item Object Fields

The `item` object contains:

- **id**: Unique item identifier
- **name**: Item name in the response language
- **nameEn**: Item name in English (for reference)
- **description**: Item description in the response language
- **item_type**: Item category (e.g., "Weapon", "Quick Use", "Resource")
- **icon**: Icon filename
- **rarity**: Item rarity (e.g., "Common", "Rare", "Epic")
- **value**: In-game value/price
- **tag**: Recommended action: `"keep"`, `"sell"`, or `"recycle"`
- **workbench**: Crafting workbench required (if applicable)
- **crafting_components**: Items needed to craft this item
- **used_in**: Items that use this item as a component
- **recycle_from**: Items that recycle into this item
- **stat_block**: Item statistics (for weapons, armor, etc.)
- **loot_area**: Where the item can be found
- **sold_by**: Vendors selling this item

### Examples

#### Example 1: Search by English name
```bash
GET /api/item/adrenaline
```

Response:
```json
{
  "success": true,
  "query": "adrenaline",
  "matchType": "exact",
  "matchedLanguage": "en",
  "matchScore": 0.84,
  "responseLanguage": "en",
  "item": { ... }
}
```

#### Example 2: Search by French name with French response
```bash
GET /api/item/dose%20d%27adr%C3%A9naline?lang=fr
```

Response:
```json
{
  "success": true,
  "query": "dose d'adrénaline",
  "matchType": "exact",
  "matchedLanguage": "fr",
  "matchScore": 1.0,
  "responseLanguage": "fr",
  "item": {
    "id": "adrenaline_shot",
    "name": "Dose d'adrénaline",
    "description": "Un sérum qui restaure intégralement l'endurance...",
    ...
  }
}
```

#### Example 3: Fuzzy search with typo
```bash
GET /api/item/adrenalin
```

Response:
```json
{
  "success": true,
  "query": "adrenalin",
  "matchType": "fuzzy",
  "matchedLanguage": "en",
  "matchScore": 0.95,
  "responseLanguage": "en",
  "item": { ... }
}
```

#### Example 4: Search in Spanish, get German response
```bash
GET /api/item/inyecci%C3%B3n%20de%20adrenalina?lang=de
```

Response:
```json
{
  "success": true,
  "query": "inyección de adrenalina",
  "matchType": "exact",
  "matchedLanguage": "es",
  "matchScore": 1.0,
  "responseLanguage": "de",
  "item": {
    "id": "adrenaline_shot",
    "name": "Adrenalin-Spritze",
    "description": "Ein Serum, das die Ausdauer vollständig wiederherstellt...",
    ...
  }
}
```

### Features

1. **Multi-language Support**: Search in any of 18 supported languages
2. **Fuzzy Matching**: Handles typos and spelling variations using Levenshtein distance algorithm
3. **Accent Insensitive**: Automatically normalizes accents (e.g., "é" matches "e")
4. **Case Insensitive**: Searches are case-insensitive
5. **Flexible Response**: Get results in any supported language regardless of search language
6. **Match Metadata**: Know how the item was matched and with what confidence

### Rate Limiting

Currently, there are no rate limits enforced. This may change in the future.

### Best Practices

1. **URL Encode**: Always URL-encode special characters in the query
2. **Match Score**: Check the `matchScore` field - scores below 0.7 may be less reliable
3. **Match Type**: `"exact"` matches are more reliable than `"fuzzy"` matches
4. **Error Handling**: Always handle 404 responses for items not found
5. **Language Validation**: Invalid language codes fall back to English

### CORS

This API supports CORS and can be called from any origin.

### License

This is a fan-made project. Arc Raiders is a trademark of Embark Studios and Nexon. All game content and materials are property of their respective owners.
