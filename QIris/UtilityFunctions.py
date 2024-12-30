import re
import hashlib
import inspect
import random
import ReductionFunctions as functions

random.seed(44)
permuation_16bit = list(range(65535))
random.shuffle(permuation_16bit)

def is_valid_md5(hash_str):
    return re.match(r'^[a-f0-9]{32}$', hash_str) is not None

def hash16bit(txt):
    h = len(txt) % 65535
    for i in txt:
        h = permuation_16bit[(h + ord(i)) % 65535]
    return h

def md5_hash(plaintext):
    """Return the MD5 hash of the given plaintext."""
    return hashlib.md5(plaintext.encode()).hexdigest()

def get_reduction_function():
    """Return the reduction function for the rainbow table."""
    functionlist = [func for name, func in inspect.getmembers(functions, inspect.isfunction)]
    return functionlist

def create_chain(plaintext):
    """Create a chain of hashes and reductions starting from a given plaintext."""
    chain = []
    funcs = get_reduction_function()
    current_text = plaintext
    for i in range(len(funcs)):
        current_hash = md5_hash(current_text)
        current_text = funcs[i](current_hash)
    chain.append((plaintext, current_text))
    return chain

# Generate a rainbow table with the given list, return 2 list of start and end of the chain
def generate_rainbow_table(list):
    chains = []

    for plaintext in list:
        chain = create_chain(plaintext)
        chains.append(chain)

    # Create the rainbow table
    rainbow_table_start = []
    rainbow_table_end = []
    rainbow_table_end_hashed = []
    buckets = {}
    for chain in chains:
        for start, end in chain:
            end_hashed = hash16bit(end)

            # Skip if the hash is already in the rainbow table to avoid duplicates
            if end_hashed in rainbow_table_end_hashed:
                continue

            # Add the start, end and hash to the rainbow table
            rainbow_table_start.append(start)
            rainbow_table_end.append(end)
            rainbow_table_end_hashed.append(end_hashed)

            # Find the bucket key and add the hash to the bucket
            bucket_key = end_hashed // 16
            if bucket_key not in buckets:
                buckets[bucket_key] = []
            buckets[bucket_key].append(end_hashed % 16)

    return rainbow_table_start, rainbow_table_end, rainbow_table_end_hashed, buckets

