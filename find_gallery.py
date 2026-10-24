with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for m in re.finditer(r'gallery__grid|gallery-grid', s):
    idx = m.start()
    print('Found gallery-grid at', idx)
    print(s[idx-100:idx+800])
