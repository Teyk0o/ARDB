#!/usr/bin/env python3
"""Check which keys are missing in each language."""

import json
from pathlib import Path

LANGUAGES = ['en', 'fr', 'es', 'de', 'zh-CN']

def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    locales_dir = project_root / 'lib' / 'locales'

    # Load all translations
    translations = {}
    for lang in LANGUAGES:
        file_path = locales_dir / f'{lang}.json'
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                translations[lang] = json.load(f)

    # Get all keys
    all_keys = set()
    for lang_data in translations.values():
        all_keys.update(lang_data.keys())

    # Find missing keys per language
    print("=== Missing Keys by Language ===\n")
    for lang in LANGUAGES:
        if lang in translations:
            missing = all_keys - set(translations[lang].keys())
            if missing:
                print(f"{lang} is missing {len(missing)} key(s):")
                for key in sorted(missing):
                    print(f"  - {key}")
                print()
            else:
                print(f"{lang}: Complete (all {len(translations[lang])} keys present)\n")

if __name__ == '__main__':
    main()
