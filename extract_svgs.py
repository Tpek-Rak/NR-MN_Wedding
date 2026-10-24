with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

def extract_between(text, start_pattern, end_pattern):
    m_start = re.search(start_pattern, text)
    if not m_start:
        return None
    start = m_start.end()
    m_end = re.search(end_pattern, text[start:])
    if not m_end:
        return None
    return text[start:start+m_end.start()]

# Let's extract Ku, qu, Ju, Yu, Xu, Lu
ornaments = {}
for term in ['Ku', 'qu', 'Ju', 'Yu', 'Xu']:
    m = re.search(r'(?:^|[\,\;\s])' + term + r'\s*=\s*`([^`]+)`', s)
    if m:
        ornaments[term] = m.group(1)
        print(f"Extracted {term}: {len(m.group(1))} chars")
    else:
        print(f"Could not find backtick string for {term}")

# Let's extract Lu
m_lu = re.search(r'(?:^|[\,\;\s])Lu\s*=\s*`([^`]+)`', s)
if m_lu:
    ornaments['Lu'] = m_lu.group(1)
    print(f"Extracted Lu: {len(m_lu.group(1))} chars")
else:
    print("Could not find backtick string for Lu")

import json
with open('ornaments_raw.json', 'w', encoding='utf-8') as f_out:
    json.dump(ornaments, f_out, ensure_ascii=False, indent=2)
print("Saved ornaments_raw.json")
