import urllib.request
import os

files = [
    'tex/paper-cream.webp',
    'tex/paper-olive.webp',
    'tex/paper-lining.webp',
    'orn/pattern.svg',
    'favicon.svg',
    'og.jpg'
]

base_url = 'https://raksmey-pheakdey.vercel.app/'

for f in files:
    out_path = os.path.join('public', f)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    try:
        url = base_url + f
        urllib.request.urlretrieve(url, out_path)
        print(f"Downloaded {f}: {os.path.getsize(out_path)} bytes")
    except Exception as e:
        print(f"Error {f}: {e}")
