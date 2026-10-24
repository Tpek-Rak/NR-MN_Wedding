with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for term in ['Ku', 'qu', 'Ju', 'Yu', 'Xu', 'Ru']:
    found = [m.start() for m in re.finditer(r'[\b,;]' + term + r'=', s)]
    print(f"{term} assignments:", found)
    if found:
        idx = found[0]
        print(f"Sample for {term}:", s[idx-20:idx+200])
