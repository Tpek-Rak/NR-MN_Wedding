with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for m in re.finditer(r'/audio/[a-zA-Z0-9_\-\.]+', s):
    print('Audio path:', m.group(0))
