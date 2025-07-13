// ===============================================
// DFA MINIMIZATION ALGORITHM - FEATURE 5 CORE
// ===============================================
// This file implements the partition refinement algorithm that powers the "Minimize DFA" feature:
// - Minimizes DFAs by identifying and merging equivalent states
// - Uses Hopcroft's algorithm for efficient partition refinement
// - Shows which states can be merged and explains the reasoning
// - Identifies already minimal DFAs and provides analysis
// - Optimizes automata while preserving language recognition

// ===============================================
// FEATURE 5 IMPLEMENTATION: DFA MINIMIZATION
// ===============================================

/**
 * Minimize DFA using partition refinement algorithm - CORE ALGORITHM FOR FEATURE 5
 * This function implements the state minimization that powers the "Minimize DFA" feature:
 * 
 * Algorithm Overview:
 * 1. **Initial Partitioning**: Separate final states from non-final states
 * 2. **Partition Refinement**: Iteratively split partitions based on transition behavior
 * 3. **Equivalence Detection**: Find states that behave identically for all inputs
 * 4. **State Merging**: Combine equivalent states into single representatives
 * 5. **DFA Construction**: Build minimized DFA with reduced state set
 * 
 * The algorithm ensures that:
 * - No two distinguishable states are merged
 * - All equivalent states are identified and combined
 * - The resulting DFA recognizes the same language
 * - The state count is minimal (optimal)
 * 
 * @param {Object} dfa - Deterministic finite automaton structure
 * @returns {Object} Minimized DFA with merged equivalent states
 */
export function minimizeDFA(dfa) {
  const { states, alphabet, transitions, startState, finalStates } = dfa;
  
  // ===============================================
  // STEP 1: INITIAL PARTITIONING
  // ===============================================
  // Create initial partition: separate final and non-final states
  // This is the coarsest valid partition - states in different sets
  // are definitely not equivalent (one accepts, one rejects empty string)
  
  let P = [new Set(finalStates), new Set(states.filter(s => !finalStates.includes(s)))];
  let W = [new Set(finalStates)]; // Worklist for partition refinement
  
  // Helper function to check if two sets are equal
  const setsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
  
  // ===============================================
  // STEP 2: PARTITION REFINEMENT LOOP
  // ===============================================
  // Iteratively refine partitions until no more splits are possible
  
  while (W.length > 0) {
    const A = W.pop(); // Take a set from worklist
    
    // For each alphabet symbol, check if it can split partitions
    for (let symbol of alphabet) {
      // ===============================================
      // STEP 2A: FIND PREDECESSOR STATES
      // ===============================================
      // Find all states that transition to set A on this symbol
      const X = new Set();
      for (let { from, symbol: sym, to } of transitions) {
        if (sym === symbol && A.has(to)) X.add(from);
      }
      
      // ===============================================
      // STEP 2B: REFINE PARTITIONS
      // ===============================================
      // For each existing partition, check if it should be split
      for (let Y of P.slice()) {
        const intersection = new Set([...Y].filter(x => X.has(x)));
        const difference = new Set([...Y].filter(x => !X.has(x)));
        
        // Split partition Y if both intersection and difference are non-empty
        if (intersection.size > 0 && difference.size > 0) {
          // Remove the old partition Y
          P = P.filter(s => !setsEqual(s, Y));
          
          // Add the two new partitions
          P.push(intersection, difference);
          
          // ===============================================
          // STEP 2C: UPDATE WORKLIST
          // ===============================================
          // Update worklist to ensure all necessary refinements are processed
          if (W.some(set => setsEqual(set, Y))) {
            // If Y was in worklist, replace it with both new sets
            W = W.filter(set => !setsEqual(set, Y));
            W.push(intersection, difference);
          } else {
            // Add the smaller set to minimize future work
            if (intersection.size <= difference.size) {
              W.push(intersection);
            } else {
              W.push(difference);
            }
          }
        }
      }
    }
  }
  
  // ===============================================
  // STEP 3: BUILD MINIMIZED DFA
  // ===============================================
  // Construct the new DFA from the final partitions
  
  // Create state mapping from old states to new partition representatives
  const stateMap = new Map();
  P.forEach((set, i) => set.forEach(s => stateMap.set(s, `q${i}`)));
  
  // Generate new state names
  const newStates = P.map((_, i) => `q${i}`);
  const startStatePartition = P.findIndex(set => set.has(startState));
  const newStartState = `q0`;
  
  // ===============================================
  // STEP 3A: REMAP STATES FOR CONSISTENT NAMING
  // ===============================================
  // Ensure start state is always named q0 for consistency
  
  // Remap states so start state is always q0
  const remappedStates = newStates.map((state, index) => {
    if (index === startStatePartition) return `q0`;
    return `q${index < startStatePartition ? index + 1 : index}`;
  });
  
  // Create mapping from original states to final state names
  const remappedStateMap = new Map();
  remappedStates.forEach((state, index) => {
    stateMap.forEach((mappedState, originalState) => {
      if (mappedState === `q${index}`) {
        remappedStateMap.set(originalState, state);
      }
    });
  });
  
  // ===============================================
  // STEP 3B: IDENTIFY NEW FINAL STATES
  // ===============================================
  // A partition is final if it contains any original final state
  
  const newFinalStates = P.reduce((acc, set, i) => {
    if ([...set].some(s => finalStates.includes(s))) {
      acc.push(remappedStates[i]);
    }
    return acc;
  }, []);
  
  // ===============================================
  // STEP 3C: BUILD NEW TRANSITION FUNCTION
  // ===============================================
  // Create transitions between partition representatives
  
  const newTransitionsSet = new Set();
  P.forEach((set, i) => {
    set.forEach(s => {
      alphabet.forEach(symbol => {
        // Find transition from original state s on symbol
        const transition = transitions.find(t => t.from === s && t.symbol === symbol);
        if (transition) {
          const newFrom = remappedStateMap.get(s);
          const newTo = remappedStateMap.get(transition.to);
          if (newFrom && newTo) {
            // Add transition between partition representatives
            newTransitionsSet.add(`${newFrom},${symbol},${newTo}`);
          }
        }
      });
    });
  });
  
  // Convert transition set back to array of objects
  const newTransitions = Array.from(newTransitionsSet).map(t => {
    const [from, symbol, to] = t.split(',');
    return { from, symbol, to };
  });
  
  // ===============================================
  // STEP 4: RETURN MINIMIZED DFA
  // ===============================================
  // Return the constructed minimized DFA
  
  return {
    states: remappedStates,
    alphabet,
    transitions: newTransitions,
    startState: newStartState,
    finalStates: newFinalStates
  };
}
