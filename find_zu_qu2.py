with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for fn in ['Zu', 'Qu']:
    for m in re.finditer(r'(?:var|let|const|,)\s*' + fn + r'\s*=\s*', s):
        start = m.start()
        print(f"Var {fn} at {start}:")
        print(s[start:start+400])
