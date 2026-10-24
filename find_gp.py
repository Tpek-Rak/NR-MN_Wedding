with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re
for m in re.finditer(r'function\s+Gp\b', s):
    start = m.start()
    print('Found Gp at', start)
    print(s[start:start+1000])
