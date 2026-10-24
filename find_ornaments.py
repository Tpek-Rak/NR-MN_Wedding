with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

out = []
for term in ['$u', 'nd', 'Ru', 'td', 'ed']:
    for m in re.finditer(r'(?:var\s+' + re.escape(term) + r'|function\s+' + re.escape(term) + r')\b', s):
        start = m.start()
        out.append(f"=== Term {term} at {start} ===")
        out.append(s[start:start+3000])
        out.append("="*40)

with open('extracted_ornaments.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(out))
print("Saved ornaments to extracted_ornaments.txt")
