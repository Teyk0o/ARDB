#!/usr/bin/env python3
"""
Fix itemTransformer.ts by removing orphaned translation entries
Keeps only: en, fr, es, de, zh-CN
"""

import re

# Read the file
with open('/mnt/d/Progress/ardb/lib/itemTransformer.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Process the file
output_lines = []
i = 0
inside_translation_object = False
current_key = None
valid_langs = {'en', 'fr', 'es', 'de', 'zh-CN'}

while i < len(lines):
    line = lines[i]

    # Detect start of translation object (e.g., 'Heavy Ammo': {)
    if re.match(r"^\s+'[^']+'\s*:\s*\{", line):
        inside_translation_object = True
        output_lines.append(line)
        i += 1

        # Collect valid translations for this entry
        valid_translations = []
        while i < len(lines):
            trans_line = lines[i]

            # Check if it's a closing brace for the translation object
            if re.match(r'^\s*},?\s*$', trans_line):
                # Write collected valid translations
                for idx, trans in enumerate(valid_translations):
                    if idx == len(valid_translations) - 1:
                        # Last item - no comma
                        output_lines.append(trans.rstrip().rstrip(',') + '\n')
                    else:
                        output_lines.append(trans)
                output_lines.append(trans_line)
                inside_translation_object = False
                i += 1
                break

            # Check if it's a valid language translation
            lang_match = re.match(r"^\s+['\"]?([^'\":]+)['\"]?\s*:", trans_line)
            if lang_match:
                lang = lang_match.group(1)
                if lang in valid_langs:
                    valid_translations.append(trans_line)

            i += 1
    else:
        output_lines.append(line)
        i += 1

# Write the cleaned file
with open('/mnt/d/Progress/ardb/lib/itemTransformer.ts', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print("Fixed itemTransformer.ts")
