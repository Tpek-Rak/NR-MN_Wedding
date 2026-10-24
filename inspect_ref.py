import re

with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

print('File size:', len(s))
pos = s.find('env-mount')
if pos != -1:
    print('--- env-mount context ---')
    print(s[max(0, pos-100):min(len(s), pos+800)])

pos2 = s.find('gate__stage')
if pos2 != -1:
    print('--- gate__stage context ---')
    print(s[max(0, pos2-100):min(len(s), pos2+800)])

# Look for envelope SVG elements or envelope DOM creation
for token in ['envelope', 'flap', 'seal', 'wax', 'liner', 'scallop']:
    found = [m.start() for m in re.finditer(token, s, re.I)]
    print(f'Token {token}: {len(found)} occurrences')
