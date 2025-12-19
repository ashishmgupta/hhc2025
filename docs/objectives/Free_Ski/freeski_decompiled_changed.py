import random
import binascii

# Constants
MOUNTAIN_WIDTH = 1000

# Data: Mountain names, heights, and their encoded flags
MOUNTAINS = [
    ("Mount Snow", 3586, b'\x90\x00\x1d\xbc\x17b\xed6S"\xb0<Y\xd6\xce\x169\xae\xe9|\xe2Gs\xb7\xfdy\xcf5\x98'),
    ("Aspen", 11211, b'U\xd7%x\xbfvj!\xfe\x9d\xb9\xc2\xd1k\x02y\x17\x9dK\x98\xf1\x92\x0f!\xf1\\\xa0\x1b\x0f'),
    ("Whistler", 7156, b'\x1cN\x13\x1a\x97\xd4\xb2!\xf9\xf6\xd4#\xee\xebh\xecs.\x08M!hr9?\xde\x0c\x86\x02'),
    ("Mount Baker", 10781, b'\xac\xf9#\xf4T\xf1%h\xbe3FI+h\r\x01V\xee\xc2C\x13\xf3\x97ef\xac\xe3z\x96'),
    ("Mount Norquay", 6998, b'\x0c\x1c\xad!\xc6,\xec0\x0b+"\x9f@.\xc8\x13\xadb\x86\xea{\xfeS\xe0S\x85\x90\x03q'),
    ("Mount Erciyes", 12848, b'n\xad\xb4l^I\xdb\xe1\xd0\x7f\x92\x92\x96\x1bq\xca`PvWg\x85\xb21^\x93F\x1a\xee'),
    ("Dragonmount", 16282, b'Z\xf9\xdf\x7f_\x02\xd8\x89\x12\xd2\x11p\xb6\x96\x19\x05x))v\xc3\xecv\xf4\xe2\\\x9a\xbe\xb5'),
]

def GetTreasureLocations(name, height):
    """
    Recreates the treasure locations using the mountain's name and height.
    """
    random.seed(binascii.crc32(name.encode('utf-8')))
    locations = {}
    prev_height = height
    prev_horiz = 0

    for i in range(0, 5):
            e_delta = random.randint(200, 800)
            h_delta = random.randint(int(0 - e_delta / 4), int(e_delta / 4))
            locations[prev_height - e_delta] = prev_horiz + h_delta
            prev_height = prev_height - e_delta
            prev_horiz = prev_horiz + h_delta
    return locations

def DecodeFlag(encoded, treasure_list):
    """
    Decodes the flag by seeding the random generator with the treasure list and XORing the encoded flag.
    """
    product = 0
    for t in treasure_list:
        product = (product << 8) ^ t

    random.seed(product)
    decoded = []
    for i in range(0, len(encoded)):
        r = random.randint(0, 255)
        decoded.append(chr(encoded[i] ^ r))

    return decoded

def main():
    print("\n=== FreeSki Flag Decoder ===\n")

    best_overall = None

    for name, height, encoded_flag in MOUNTAINS:
        print(f"[*] Processing mountain: {name}")

        # Recreate the treasure locations for this mountain
        locs = GetTreasureLocations(name, height)

        # Convert the treasure locations into integer values
        treasure_values = [row * MOUNTAIN_WIDTH + horiz for row, horiz in locs.items()]

        # Decode the flag using the treasure values
        decoded = DecodeFlag(encoded_flag, treasure_values)
        print(f"    Decoded text: {''.join((decoded))}\n")

if __name__ == "__main__":
    main()