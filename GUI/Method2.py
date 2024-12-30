import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import PhaseOracle, GroverOperator
from qiskit.quantum_info import Statevector
from qiskit.transpiler import PassManager
from qiskit.transpiler.passes import RemoveResetInZeroState
from qiskit_aer import Aer

from RainbowTableGen import create_chain, get_reduction_function, md5_hash


# Rainbow table generation
def rainbow_table_generation(plaintexts):
    rainbow_table = {}
    for plaintext in plaintexts:
        chain = create_chain(plaintext)
        start, end = chain[0]
        rainbow_table[end] = start
    return rainbow_table

# Split into 16 buckets
def split_into_buckets(rainbow_table):
    keys = list(rainbow_table.keys())
    buckets = {}
    data = np.zeros(16)
    for key in keys:
        # Calculate sum of ASCII values of characters in the plaintext
        sum_number = ASCII_sum(key)
        # Calculate the bucket key
        bucket_key = sum_number % 16
        if bucket_key not in buckets.keys():
            buckets[bucket_key] = []
        buckets[bucket_key].append(key)
        data[bucket_key] = 1
    return buckets, data

# State preparation for Grover's algorithm
def init_state(data):
    norm = np.linalg.norm(data)
    data = data / norm
    state = Statevector(data)
    qc = QuantumCircuit(4)
    qc.initialize(state)
    pass_manager = PassManager()
    pass_manager.append(RemoveResetInZeroState())
    qc = pass_manager.run(qc.decompose().decompose().decompose())
    return qc

# Oracle generation for Grover's algorithm
def oracle_gen(target_state):
    binary_string = format(target_state, '04b')[::-1]
    boolean_expression = ""
    for x in range(len(binary_string)):
        if binary_string[x] == "0":
            boolean_expression += f"~x{x} & "
        else:
            boolean_expression += f"x{x} & "
    boolean_string = boolean_expression[:-3]
    return PhaseOracle(boolean_string)

def ASCII_sum(plaintext):
    sum_number = 0
    for char in plaintext:
        sum_number += ord(char)
    return sum_number

# Grover's algorithm
def grover_alogrithm(init_state, oracle, iterations):
    grover = GroverOperator(oracle, state_preparation=init_state)
    for _ in range(iterations):
        init_state.append(grover, range(4))
    init_state.measure_all()

    backend = Aer.get_backend('qasm_simulator')
    compiled_circuit = transpile(init_state, backend)
    job = backend.run(compiled_circuit)
    counts = job.result().get_counts()
    return counts

# Search for the hash in the rainbow table
def search_method2(rainbow_table, search_hash):
    funcs = get_reduction_function()
    # Split the rainbow table into 16 buckets
    buckets, data = split_into_buckets(rainbow_table)
    iterations = int(np.floor((np.pi / 4) * np.sqrt(len(buckets.keys()))))
    # Generate the initial state for Grover's algorithm, reused
    for i in range(len(funcs)):
        state = init_state(data)
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
        lookup = ASCII_sum(current_text) % 16
        if len(buckets.keys()) <= 2:
            if lookup in buckets.keys() and current_text in buckets[lookup]:
                grover_result = True
            else:
                grover_result = False
        else:
            oracle = oracle_gen(lookup)
            counts = grover_alogrithm(state, oracle, iterations)
            max_count = max(counts.values())
            if max_count > 512 and current_text in buckets[lookup]:
                grover_result = True
            else:
                grover_result = False
        if grover_result is True:
            current_text = rainbow_table[current_text]
            # Find the plaintext
            current_hash = md5_hash(current_text)
            for k in range(len(remaining_funcs)):
                current_text = remaining_funcs[k](current_hash)
                current_hash = md5_hash(current_text)
            if current_hash == search_hash:
                return current_text
    return None




