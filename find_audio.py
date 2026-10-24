with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for m in re.finditer(r'[\'\"\/][^\'\"\s]+\.(?:mp3|wav|ogg|m4a)', s):
    print('Audio file found:', m.group(0))
