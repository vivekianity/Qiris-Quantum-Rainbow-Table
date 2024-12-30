from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import PhaseOracle, GroverOperator
from qiskit.quantum_info import Statevector
from qiskit.transpiler import PassManager
from qiskit.transpiler.passes import RemoveResetInZeroState
import numpy as np
from qiskit_aer import Aer


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
    print("Binary String:", binary_string)
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


