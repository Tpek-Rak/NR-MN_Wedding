with open('ref_i18n.css', 'r', encoding='utf-8') as f:
    s = f.read()

import re

matches = re.findall(r'(\.e2[^\;\{]*\{[^\}]+\})', s)
print(f"Found {len(matches)} e2 rules:")
with open('e2_rules.txt', 'w', encoding='utf-8') as f_out:
    for m in matches:
        f_out.write(m + "\n")
print("Saved e2_rules.txt")
