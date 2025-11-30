#!/usr/bin/env python3
"""
Extract translations from lib/translations.ts into separate JSON files for each language.
"""

import json
import re
import os
from pathlib import Path

# Languages to extract
LANGUAGES = ['en', 'fr', 'es', 'de', 'zh-CN']

def parse_ts_object(content, start_pos):
    """Parse a TypeScript object literal and return it as a Python dict."""
    translations = {}
    brace_count = 0
    in_object = False
    current_key = None
    current_value = ''
    in_string = False
    string_char = None
    escape_next = False
    i = start_pos

    while i < len(content):
        char = content[i]

        # Handle escape sequences
        if escape_next:
            if in_string:
                current_value += char
            escape_next = False
            i += 1
            continue

        if char == '\\':
            if in_string:
                current_value += char
            escape_next = True
            i += 1
            continue

        # Handle string delimiters
        if char in ['"', "'", '`'] and not in_string:
            in_string = True
            string_char = char
            i += 1
            continue
        elif in_string and char == string_char:
            in_string = False
            string_char = None
            i += 1
            continue

        # If we're in a string, just accumulate the value
        if in_string:
            current_value += char
            i += 1
            continue

        # Track braces when not in string
        if char == '{':
            if not in_object:
                in_object = True
            else:
                brace_count += 1
            i += 1
            continue
        elif char == '}':
            if brace_count == 0:
                # End of this object
                break
            brace_count -= 1
            i += 1
            continue

        # Look for key: value patterns
        if char == ':' and current_key is None and current_value:
            current_key = current_value.strip()
            current_value = ''
            i += 1
            continue

        # Look for end of value (comma or newline before next key)
        if char in [',', '\n'] and current_key is not None:
            # Save the key-value pair
            value = current_value.strip()
            if value:
                translations[current_key] = value
            current_key = None
            current_value = ''
            i += 1
            continue

        # Accumulate characters for key or value
        if not in_string and char not in [' ', '\t', '\n', '\r']:
            current_value += char
        elif in_string:
            current_value += char

        i += 1

    return translations

def extract_translations_simple(file_path):
    """Extract translations using regex-based approach."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    results = {}

    for lang in LANGUAGES:
        results[lang] = {}

        # Special handling for zh-CN (need to escape the hyphen)
        if lang == 'zh-CN':
            pattern = rf"'zh-CN':\s*\{{"
        else:
            # Find the language block: lang: {
            pattern = rf'\b{re.escape(lang)}:\s*\{{'
        match = re.search(pattern, content)

        if not match:
            print(f"Warning: Could not find language block for '{lang}'")
            continue

        # Find all key-value pairs in this language block
        start = match.end() - 1  # Position of the opening brace

        # Count braces to find the end of this language block
        brace_count = 0
        pos = start
        in_string = False
        string_char = None
        escape_next = False

        while pos < len(content):
            char = content[pos]

            if escape_next:
                escape_next = False
                pos += 1
                continue

            if char == '\\':
                escape_next = True
                pos += 1
                continue

            if char in ['"', "'", '`'] and not in_string:
                in_string = True
                string_char = char
            elif in_string and char == string_char:
                in_string = False
                string_char = None
            elif not in_string:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        break

            pos += 1

        # Extract the block content
        block_content = content[start:pos+1]

        # Extract key-value pairs using a more robust approach
        # We need to handle both single and double quotes, and nested strings
        lines = block_content.split('\n')
        current_key = None

        for line in lines:
            line = line.strip()
            if not line or line.startswith('//'):
                continue

            # Try to match key: 'value' or key: "value"
            # Handle single quotes
            match = re.match(r"(\w+):\s*'((?:[^'\\]|\\.)*)'", line)
            if match:
                key = match.group(1)
                value = match.group(2)
                # Unescape single quotes
                value = value.replace("\\'", "'").replace('\\n', '\n').replace('\\\\', '\\')
                results[lang][key] = value
                continue

            # Handle double quotes
            match = re.match(r'(\w+):\s*"((?:[^"\\]|\\.)*)"', line)
            if match:
                key = match.group(1)
                value = match.group(2)
                # Unescape double quotes
                value = value.replace('\\"', '"').replace('\\n', '\n').replace('\\\\', '\\')
                results[lang][key] = value
                continue

    return results

def main():
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    translations_file = project_root / 'lib' / 'translations.ts'
    output_dir = project_root / 'lib' / 'locales'

    print(f"Reading translations from: {translations_file}")

    if not translations_file.exists():
        print(f"Error: File not found: {translations_file}")
        return 1

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {output_dir}")

    # Extract translations
    print("\nExtracting translations...")
    translations = extract_translations_simple(translations_file)

    # Write JSON files
    stats = {}
    for lang in LANGUAGES:
        output_file = output_dir / f'{lang}.json'

        if lang not in translations or not translations[lang]:
            print(f"Warning: No translations found for '{lang}'")
            stats[lang] = 0
            continue

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(translations[lang], f, ensure_ascii=False, indent=2)

        count = len(translations[lang])
        stats[lang] = count
        print(f"[OK] Created {output_file} ({count} keys)")

    # Print summary
    print("\n=== Summary ===")
    for lang in LANGUAGES:
        count = stats.get(lang, 0)
        print(f"{lang}: {count} keys")

    # Check for key differences
    if stats:
        all_keys = set()
        lang_keys = {}
        for lang in LANGUAGES:
            if lang in translations:
                keys = set(translations[lang].keys())
                lang_keys[lang] = keys
                all_keys.update(keys)

        print(f"\nTotal unique keys across all languages: {len(all_keys)}")

        # Find missing keys
        print("\n=== Key Differences ===")
        for lang in LANGUAGES:
            if lang in lang_keys:
                missing = all_keys - lang_keys[lang]
                if missing:
                    print(f"{lang} is missing {len(missing)} keys")
                else:
                    print(f"{lang}: No missing keys")

    print("\n[OK] Extraction complete!")
    return 0

if __name__ == '__main__':
    exit(main())
