with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for m in re.finditer(r'function\s+(?:Hp|Lm)\b', s):
    start = m.start()
    print('Found function at', start)
    print(s[start:start+1200])
