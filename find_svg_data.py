with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for term in ['Ku', 'qu', 'Ju', 'Yu', 'Xu', 'Ru']:
    m = re.search(r'(?:var|const|let)\s+' + term + r'\s*=', s)
    if m:
        start = m.start()
        print(f"Found {term} at {start}")
        with open(f'{term}_def.txt', 'w', encoding='utf-8') as f_out:
            f_out.write(s[start:start+4000])
    else:
        print(f"Not found direct definition of {term}")
