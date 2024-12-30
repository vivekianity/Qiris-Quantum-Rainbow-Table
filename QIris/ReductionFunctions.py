characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
char_len = len(characters)

def reduction_function1(md5_hash):
    """Reduce an MD5 hash to a 6-character alphanumeric string."""
    hash_int = int(md5_hash[:8], 16) + 2
    plaintext = ""
    for _ in range(6):  # Desired plaintext length
        plaintext += characters[hash_int % char_len]
        hash_int //= char_len
    return plaintext

def reduction_function2(md5_hash):
    """Reduce an MD5 hash to a 4-character alphanumeric string."""
    hash_int = int(md5_hash[:8], 16) + 3
    plaintext = ""
    for _ in range(4):  # Desired plaintext length
        plaintext += characters[hash_int % char_len]
        hash_int //= char_len
    return plaintext

def reduction_function3(md5_hash):
    """Reduce an MD5 hash to a 5-character alphanumeric string."""
    hash_int = int(md5_hash[:8], 16) + 4
    plaintext = ""
    for _ in range(5):  # Desired plaintext length
        plaintext += characters[hash_int % char_len]
        hash_int //= char_len
    return plaintext

def reduction_function4(md5_hash):
    """Reduce an MD5 hash to a 3-character alphanumeric string."""
    hash_int = int(md5_hash[:8], 16) + 1
    plaintext = ""
    for _ in range(3):  # Desired plaintext length
        plaintext += characters[hash_int % char_len]
        hash_int //= char_len
    return plaintext