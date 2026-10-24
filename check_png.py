import struct

def get_png_dimensions(file_path):
    with open(file_path, 'rb') as f:
        header = f.read(8)
        if header != b'\x89PNG\r\n\x1a\n':
            return None
        chunk_len, chunk_type = struct.unpack('>I4s', f.read(8))
        if chunk_type == b'IHDR':
            w, h = struct.unpack('>II', f.read(8))
            return w, h
    return None

for path in [r'D:\Project\1.png', r'D:\Project\2.png']:
    print(path, get_png_dimensions(path))
