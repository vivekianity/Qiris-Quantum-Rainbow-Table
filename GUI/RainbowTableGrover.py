import hashlib
import inspect
import math
import random

import numpy as np

import ReductionFunctions as functions
from QuantumFunctions import GroverAlgo, initial_state, oracle_generate


def md5_hash(plaintext):
    """Return the MD5 hash of the given plaintext."""
    return hashlib.md5(plaintext.encode()).hexdigest()


def get_reduction_function():
    """Return the reduction function for the rainbow table."""
    functionlist = [func for name, func in inspect.getmembers(functions, inspect.isfunction)]
    return functionlist


random.seed(44)
permuation_16bit = list(range(65535))
random.shuffle(permuation_16bit)


def peason_hash_16bit(txt):
    h = len(txt) % 65535
    for i in txt:
        h = permuation_16bit[(h + ord(i)) % 65535]
    return h


def get_bucket_binary_search(key, list):
    left = 0
    right = len(list) - 1
    while left <= right:
        mid = (left + right) // 2
        if list[mid].key == key:
            return list[mid].values
        elif list[mid].key < key:
            left = mid + 1
        else:
            right = mid - 1
    return None


def get_chain_binary_search(list, end_hashed):
    left = 0
    right = len(list) - 1
    while left <= right:
        mid = (left + right) // 2
        if list[mid].end_hashed == end_hashed:
            return list[mid]
        elif list[mid].end_hashed < end_hashed:
            left = mid + 1
        else:
            right = mid - 1
    return None


def search(rainbow_table, buckets, search_hash):
    funcs = get_reduction_function()

    for i in range(len(funcs)):
        i += 1
        # Load the reductions to check if it is in the rainbow table
        funcs_to_use = funcs[-i:]
        # Load the remaining functions to check if it is in the rainbow table
        remaining_funcs = funcs[:-i]
        current_hash = search_hash
        # Apply the reductions
        for j in range(len(funcs_to_use)):
            current_text = funcs_to_use[j](current_hash)
            if j != len(funcs_to_use) - 1:
                # Don't hash the last reduction
                current_hash = md5_hash(current_text)

        current_map = peason_hash_16bit(current_text)
        bucket_key = current_map // 16
        # Check if the bucket is in the rainbow table and if it is get the good states
        good_states = get_bucket_binary_search(bucket_key, buckets)
        print(good_states)
        if good_states is None:
            continue
        lookup = current_map % 16

        if len(good_states) <= 2:
            if lookup in good_states:
                grover_result = True
            else:
                grover_result = False
        else:
            init_state = initial_state(good_states, 4)
            oracle = oracle_generate(lookup)
            # Calculate number of iterations
            iterations = int(np.floor((np.pi / 4) * np.sqrt(len(good_states))))
            grover_result = GroverAlgo(init_state, oracle, iterations, 4)
            # Get max count
            max_count = max(grover_result.values())
            if max_count > 512:
                grover_result = True
            else:
                grover_result = False
        # Use grover's algorithm to find if in the list
        if grover_result is True:
            chain = get_chain_binary_search(rainbow_table, current_map)
            # Check if it's the correct end or if it's a hash collision
            # If it's a hash collision, continue to next loop
            print(current_text)
            print(chain.end)
            if current_text != chain.end:
                continue
            # Find the plaintext
            current_text = chain.start
            current_hash = md5_hash(current_text)
            for k in range(len(remaining_funcs)):
                current_text = remaining_funcs[k](current_hash)
                current_hash = md5_hash(current_text)
            if current_hash == search_hash:
                return current_text
    return None
