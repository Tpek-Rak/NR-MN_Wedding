with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

out = []
helpers = ['hd', 'pd', 'gd', 'sd', 'cd', 'ad', 'rd', 'vd', 'td']
for fn in helpers:
    for m in re.finditer(r'function\s+' + fn + r'\b', s):
        start = m.start()
        # Find closing brace approximately or grab 2000 chars
        out.append(f"=== Function {fn} at {start} ===")
        out.append(s[start:start+2500])
        out.append("="*40)

with open('extracted_helpers.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(out))
print("Saved helpers to extracted_helpers.txt")
