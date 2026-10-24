with open('ref_i18n.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

m = re.search(r'music:\s*[`\'"]([^`\'"]+)[`\'"]', s)
if m:
    print('Music url:', m.group(1))
