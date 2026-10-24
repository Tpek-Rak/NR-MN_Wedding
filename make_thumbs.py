from PIL import Image

for name, path in [('p1', r'D:\Project\1.png'), ('p2', r'D:\Project\2.png')]:
    im = Image.open(path)
    thumb = im.resize((100, 100))
    thumb.save(f'{name}_thumb.jpg', 'JPEG')
    print(f'Saved {name}_thumb.jpg, size:', im.size)
