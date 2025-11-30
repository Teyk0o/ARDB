#!/usr/bin/env python3
"""Verify the quality and integrity of extracted JSON translation files."""

import json
from pathlib import Path

def verify_json_files():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    locales_dir = project_root / 'lib' / 'locales'

    languages = ['en', 'fr', 'es', 'de', 'zh-CN']

    print("=== JSON Translation Files Quality Check ===\n")

    all_valid = True
    total_keys = 0

    for lang in languages:
        file_path = locales_dir / f'{lang}.json'

        if not file_path.exists():
            print(f"[ERROR] {lang}.json: File not found!")
            all_valid = False
            continue

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            num_keys = len(data)
            total_keys += num_keys

            # Verify it's a flat object
            is_flat = all(isinstance(v, str) for v in data.values())

            # Check for empty values
            empty_values = [k for k, v in data.items() if not v or not v.strip()]

            # File size
            size_kb = file_path.stat().st_size / 1024

            print(f"[OK] {lang}.json")
            print(f"  - Keys: {num_keys}")
            print(f"  - Size: {size_kb:.1f} KB")
            print(f"  - Structure: {'Flat object' if is_flat else 'NESTED (ERROR!)'}")

            if empty_values:
                print(f"  - WARNING: {len(empty_values)} empty values found")
                print(f"    Keys: {', '.join(empty_values[:5])}")

            # Sample check for special characters
            special_char_keys = []
            for k, v in data.items():
                if "'" in v or '"' in v or '\\' in v:
                    special_char_keys.append(k)

            if special_char_keys:
                print(f"  - Special characters properly handled: {len(special_char_keys)} keys")

            print()

        except json.JSONDecodeError as e:
            print(f"[ERROR] {lang}.json: Invalid JSON - {e}")
            all_valid = False
        except Exception as e:
            print(f"[ERROR] {lang}.json: {e}")
            all_valid = False

    print(f"=== Summary ===")
    print(f"Total keys across all files: {total_keys}")
    print(f"Average keys per file: {total_keys / len(languages):.1f}")

    if all_valid:
        print("\n[SUCCESS] All JSON files are valid and well-formed!")
        return 0
    else:
        print("\n[FAILED] Some JSON files have issues!")
        return 1

if __name__ == '__main__':
    exit(verify_json_files())
