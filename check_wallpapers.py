from PIL import Image
import os

folder = r'D:\Wallpaper'
for f in os.listdir(folder):
    if f.endswith(('.jpg', '.png', '.webp')):
        p = os.path.join(folder, f)
        try:
            im = Image.open(p)
            print(f, im.size, im.format)
        except Exception as e:
            print(f, e)
