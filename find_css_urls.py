with open('ref_i18n.css', 'r', encoding='utf-8') as f:
    s = f.read()

import re

matches = re.findall(r'url\([^\)]+\)', s)
print("CSS url references:")
for u in set(matches):
    print(u)
