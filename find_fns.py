with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

out = []
for fn in ['yd', 'xd']:
    for m in re.finditer(r'function\s+' + fn + r'\b', s):
        start = m.start()
        out.append(f"=== Function {fn} at {start} ===")
        out.append(s[start:start+4000])
        out.append("="*40)

with open('extracted_fns.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(out))
print("Saved to extracted_fns.txt")
