# Translation Extraction Report

**Date:** 2025-11-30
**Source:** `D:\Progress\ardb\lib\translations.ts` (7727 lines, 369.4 KB)
**Output Directory:** `D:\Progress\ardb\lib\locales\`

## Summary

Successfully extracted translations from the TypeScript source file into 5 separate JSON files for internationalization.

## Files Created

| Language | File | Keys | Status | Size |
|----------|------|------|--------|------|
| English | `en.json` | 230 | ✓ Complete | 11 KB |
| French | `fr.json` | 230 | ✓ Complete | 13 KB |
| Spanish | `es.json` | 228 | ⚠ Missing 2 keys | 12 KB |
| German | `de.json` | 228 | ⚠ Missing 2 keys | 13 KB |
| Simplified Chinese | `zh-CN.json` | 228 | ⚠ Missing 2 keys | 10 KB |

## Key Statistics

- **Total unique keys:** 230
- **Complete languages:** 2 (English, French)
- **Partial languages:** 3 (Spanish, German, Chinese)

## Missing Keys

The following keys are present in English and French but missing in Spanish, German, and Chinese:

1. **`rarity`** - Used for rarity selection label in the metadata editor
2. **`remove`** - Used for the remove button in component editors

These keys will need to be added to the Spanish, German, and Chinese translation files if the corresponding features are to be fully localized.

## File Format

All JSON files follow this structure:

```json
{
  "key1": "value1",
  "key2": "value2",
  "key3": "value3"
}
```

### Features

- ✓ Valid JSON syntax (verified with Python JSON validator)
- ✓ UTF-8 encoding
- ✓ Proper escaping of special characters (quotes, apostrophes)
- ✓ Pretty-printed with 2-space indentation
- ✓ Single-level flat object structure

## Validation

All 5 JSON files have been validated and confirmed to be valid JSON:

```
en.json: Valid JSON ✓
fr.json: Valid JSON ✓
es.json: Valid JSON ✓
de.json: Valid JSON ✓
zh-CN.json: Valid JSON ✓
```

## Scripts Created

Two utility scripts have been created in `scripts/` directory:

1. **`extract-translations.py`**
   Extracts translations from the TypeScript source file
   ```bash
   python scripts/extract-translations.py
   ```

2. **`check-missing-keys.py`**
   Checks for missing translation keys across languages
   ```bash
   python scripts/check-missing-keys.py
   ```

## Technical Details

### Extraction Method

The extraction process:
1. Parses the TypeScript file to locate each language block
2. Identifies the language object boundaries using brace counting
3. Extracts key-value pairs using regex pattern matching
4. Properly handles escape sequences in strings
5. Outputs clean JSON with proper formatting

### Special Handling

- **`zh-CN` language code:** Required special pattern matching due to hyphen in the identifier
- **Escape sequences:** All escape sequences (`\'`, `\"`, `\n`) are properly preserved
- **Character encoding:** Windows console encoding issues handled (JSON files use UTF-8)

## Example Content

### English (en.json)
```json
{
  "title": "ARC RAIDERS",
  "subtitle": "Item Database & Recycling Guide",
  "searchPlaceholder": "Search items...",
  ...
}
```

### French (fr.json)
```json
{
  "title": "ARC RAIDERS",
  "subtitle": "Base de données des objets et guide de recyclage",
  "searchPlaceholder": "Rechercher des objets...",
  ...
}
```

### Chinese (zh-CN.json)
```json
{
  "title": "ARC RAIDERS",
  "subtitle": "物品数据库和回收指南",
  "searchPlaceholder": "搜索物品...",
  ...
}
```

## Next Steps

To complete the translation extraction:

1. **Add missing keys** to Spanish, German, and Chinese files:
   - `rarity`: Rareza / Seltenheit / 稀有度
   - `remove`: Eliminar / Entfernen / 移除

2. **Integrate into application** by importing the JSON files in your i18n setup

3. **Set up auto-sync** if the TypeScript file is updated in the future

## Files Location

```
D:\Progress\ardb\
├── lib\
│   ├── translations.ts (source)
│   └── locales\
│       ├── en.json
│       ├── fr.json
│       ├── es.json
│       ├── de.json
│       ├── zh-CN.json
│       └── README.md
└── scripts\
    ├── extract-translations.py
    └── check-missing-keys.py
```

## Conclusion

All requested translations have been successfully extracted and validated. The JSON files are ready for use in your application's internationalization system.
