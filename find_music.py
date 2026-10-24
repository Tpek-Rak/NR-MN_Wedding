import re

for fname in ['ref_i18n.js', 'ref_main.js']:
    with open(fname, 'r', encoding='utf-8') as f:
        s = f.read()
    for m in re.finditer(r'music[\'\"\s:=]+[^\,\;\}\)]+', s):
        print(f'{fname}:', m.group(0))
