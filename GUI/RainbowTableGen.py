import hashlib
import inspect
import random
import ReductionFunctions as functions

random.seed(44)
permuation_16bit = list(range(65535))
random.shuffle(permuation_16bit)


class Method1_Chain:
    def __init__(self, start, end, end_hashed):
        self.start = start
        self.end = end
        self.end_hashed = end_hashed


class Bucket:
    def __init__(self, key, values):
        self.key = key
        self.values = values


def peason_hash_16bit(txt):
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


def add_chain(start, end, end_hashed, list):
    for i in range(len(list)):
        if list[i].end_hashed == end_hashed:
            return False
    list.append(Method1_Chain(start, end, end_hashed))
    return True


def add_bucket(key, value, list):
    for i in range(len(list)):
        if list[i].key == key:
            list[i].values.append(value)
            return
    list.append(Bucket(key, [value]))


# Generate a rainbow table with the given list, return 2 list of start and end of the chain
def generate_rainbow_table(list):
    chains = []

    for plaintext in list:
        chain = create_chain(plaintext)
        chains.append(chain)

    # Create the rainbow table
    rainbow_table = []
    buckets = []
    for chain in chains:
        for start, end in chain:
            end_hashed = peason_hash_16bit(end)

            # Add the start, end and hash to the rainbow table
            # Skip if the hash is already in the rainbow table to avoid duplicates
            if add_chain(start, end, end_hashed, rainbow_table) == False:
                continue

            # Find the bucket key and add the hash to the bucket
            bucket_key = end_hashed // 16
            add_bucket(bucket_key, end_hashed % 16, buckets)

    # Sort the buckets and the rainbow table
    buckets.sort(key=lambda x: x.key)
    rainbow_table.sort(key=lambda x: x.end_hashed)

    return rainbow_table, buckets
