from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import PhaseOracle, GroverOperator
from qiskit.quantum_info import Statevector
from qiskit.transpiler import PassManager
from qiskit.transpiler.passes import RemoveResetInZeroState
import numpy as np
from qiskit_aer import Aer
from UtilityFunctions import md5_hash, get_reduction_function, hash16bit
import math

def initial_state(good_states, bits):
    data = np.zeros(2**bits)
    for x in good_states:
        data[x] = 1
    norm = np.linalg.norm(data)
    data = data / norm
    state = Statevector(data)
    qc = QuantumCircuit(bits)
    qc.initialize(state)
    pass_manager = PassManager()
    pass_manager.append(RemoveResetInZeroState())
    qc = pass_manager.run(qc.decompose().decompose().decompose())
    return qc

def oracle_generate(target_state):
    binary_string = format(target_state, '04b')[::-1]
    boolean_expression = ""
    for x in range(len(binary_string)):
        if binary_string[x] == "0":
            boolean_expression += f"~x{x} & "
        else:
            boolean_expression += f"x{x} & "
    boolean_string = boolean_expression[:-3]
    return PhaseOracle(boolean_string)

def GroverAlgo(init_state, oracle, iter, bits):
    grover = GroverOperator(oracle, state_preparation=init_state)
    for _ in range(iter):
        init_state.append(grover, range(bits))
    init_state.measure_all()
    backend = Aer.get_backend('qasm_simulator')
    compiled_circuit = transpile(init_state, backend)
    job = backend.run(compiled_circuit)
    counts = job.result().get_counts()
    return counts

def search(rainbow_table_start, rainbow_table_end, rainbow_table_end_hashed, buckets, search_hash):
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

        current_map = hash16bit(current_text)
        bucket_key = current_map // 16
        # Check if the bucket is in the rainbow table and if it is get the good states
        if bucket_key not in buckets:
            continue
        good_states = buckets[bucket_key]
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
            # Get max count and 2nd max count
            max_count = max(grover_result.values())
            if max_count > 512:
                grover_result = True
            else:
                grover_result = False
        # Use grover's algorithm to find if in the list
        if grover_result is True:
            index = rainbow_table_end_hashed.index(current_map)
            # Check if it's the correct end or if it's a hash collision
            # If it's a hash collision, continue to next loop
            if current_text != rainbow_table_end[index]:
                continue
            # Find the plaintext
            current_text = rainbow_table_start[index]
            current_hash = md5_hash(current_text)
            for k in range(len(remaining_funcs)):
                current_text = remaining_funcs[k](current_hash)
                current_hash = md5_hash(current_text)
            if current_hash == search_hash:
                return current_text
    return None


