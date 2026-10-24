import re

for fname in ['raksmey_ref.html', 'ref_i18n.js']:
    with open(fname, 'r', encoding='utf-8') as f:
        s = f.read()
    matches = re.findall(r'[\'\"\/]img\/[^\'\"\s,>]+', s)
    print(f"Images in {fname}:")
    for img in sorted(list(set(matches))):
        print(' ', img)
