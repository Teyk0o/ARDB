# Translation Files

This directory contains extracted translation files for the ARC RAIDERS database application.

## Files

- `en.json` - English (230 keys) - **Complete**
- `fr.json` - French (230 keys) - **Complete**
- `es.json` - Spanish (228 keys) - Missing 2 keys
- `de.json` - German (228 keys) - Missing 2 keys
- `zh-CN.json` - Simplified Chinese (228 keys) - Missing 2 keys

## Missing Keys

The following keys are present in English and French but missing in Spanish, German, and Chinese:

- `rarity` - Rarity selection label
- `remove` - Remove button label

## File Format

Each JSON file contains a flat object structure:

```json
{
  "key1": "value1",
  "key2": "value2",
  ...
}
```

All files use UTF-8 encoding with proper JSON escaping.

## Generation

These files were automatically extracted from `lib/translations.ts` using the extraction script located at `scripts/extract-translations.py`.

To regenerate these files:

```bash
python scripts/extract-translations.py
```

To check for missing keys:

```bash
python scripts/check-missing-keys.py
```

## Usage

These JSON files can be imported and used in your application for internationalization (i18n) purposes.

## Notes

- All JSON files have been validated for correct syntax
- Special characters (apostrophes, quotes) are properly escaped
- The structure matches the original TypeScript source
- File sizes range from 10KB to 13KB
