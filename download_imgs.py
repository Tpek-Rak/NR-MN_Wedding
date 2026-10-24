import urllib.request
import os

images = [
    'img/words-640.webp',
    'img/words-1280.webp',
    'img/cozy-640.webp',
    'img/cozy-1280.webp',
    'img/hero-m-640.webp',
    'img/hero-m-1280.webp',
    'img/hero-1280.webp',
    'img/pond-640.webp',
    'img/pond-1280.webp'
]

base_url = 'https://raksmey-pheakdey.vercel.app/'

for img in images:
    out_path = os.path.join('public', img)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
        continue
    try:
        url = base_url + img
        urllib.request.urlretrieve(url, out_path)
        print(f"Downloaded {img}: {os.path.getsize(out_path)} bytes")
    except Exception as e:
        print(f"Error {img}: {e}")
print("Image download complete")
