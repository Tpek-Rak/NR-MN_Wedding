with open('ref_i18n.css', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for selector in ['.gate', '.e2', '.lockup', '.cover', '.hud', '.foil']:
    m = re.search(r'(' + re.escape(selector) + r'[^\{]*\{[^\}]+\})', s)
    if m:
        print(f"=== {selector} ===")
        print(m.group(1)[:400])
