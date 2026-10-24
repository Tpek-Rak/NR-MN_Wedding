with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for fn in ['Zu', 'Qu']:
    for m in re.finditer(r'function\s+' + fn + r'\b', s):
        start = m.start()
        print(f"Function {fn} at {start}:")
        print(s[start:start+400])
