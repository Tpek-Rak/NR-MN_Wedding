with open('ref_main.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for m in re.finditer(r'[$]u\s*=\s*', s):
    start = m.start()
    print(f"Found $u at {start}:")
    with open('u_var.txt', 'w', encoding='utf-8') as f_out:
        f_out.write(s[start:start+10000])
    break
print("Done")
