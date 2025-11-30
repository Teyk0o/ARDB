#!/usr/bin/env python3
"""
Clean removed languages from TypeScript files
Removes references to: pt, pl, no, da, it, ru, ja, uk, kr, tr, hr, sr, zh-TW
Keeps only: en, fr, es, de, zh-CN
"""

import re
import sys

# Languages to remove
REMOVED_LANGS = ['pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'uk', 'kr', 'tr', 'hr', 'sr', 'zh-TW']

def clean_file(filepath):
    """Remove lines containing removed language codes from a TypeScript file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    cleaned_lines = []
    for line in lines:
        # Check if line contains a removed language code as a key
        should_remove = False
        for lang in REMOVED_LANGS:
            # Match patterns like:  pt: 'text', or  'pt': 'text',
            if re.search(rf"^\s+['\"]?{re.escape(lang)}['\"]?\s*:", line):
                should_remove = True
                break

        if not should_remove:
            cleaned_lines.append(line)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)

    return len(lines) - len(cleaned_lines)

if __name__ == '__main__':
    filepath = sys.argv[1] if len(sys.argv) > 1 else '/mnt/d/Progress/ardb/lib/itemTransformer.ts'
    removed = clean_file(filepath)
    print(f"Removed {removed} lines from {filepath}")
