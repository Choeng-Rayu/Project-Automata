// DFA Minimization Algorithm

/**
 * Minimize DFA using partition refinement algorithm
 * @param {Object} dfa - Deterministic finite automaton
 * @returns {Object} Minimized DFA
 */
export function minimizeDFA(dfa) {
  const { states, alphabet, transitions, startState, finalStates } = dfa;
  
  // Initial partition: final states and non-final states
  let P = [new Set(finalStates), new Set(states.filter(s => !finalStates.includes(s)))];
  let W = [new Set(finalStates)];
  
  const setsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
  
  while (W.length > 0) {
    const A = W.pop();
    
    for (let symbol of alphabet) {
      // Find all states that transition to A on symbol
      const X = new Set();
      for (let { from, symbol: sym, to } of transitions) {
        if (sym === symbol && A.has(to)) X.add(from);
      }
      
      // Refine partitions
      for (let Y of P.slice()) {
        const intersection = new Set([...Y].filter(x => X.has(x)));
        const difference = new Set([...Y].filter(x => !X.has(x)));
        
        if (intersection.size > 0 && difference.size > 0) {
          // Split partition Y
          P = P.filter(s => !setsEqual(s, Y));
          P.push(intersection, difference);
          
          // Update worklist W
          if (W.some(set => setsEqual(set, Y))) {
            W = W.filter(set => !setsEqual(set, Y));
            W.push(intersection, difference);
          } else {
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
  
  // Build minimized DFA
  const stateMap = new Map();
  P.forEach((set, i) => set.forEach(s => stateMap.set(s, `q${i}`)));
  
  const newStates = P.map((_, i) => `q${i}`);
  const startStatePartition = P.findIndex(set => set.has(startState));
  const newStartState = `q0`;
  
  // Remap states so start state is always q0
  const remappedStates = newStates.map((state, index) => {
    if (index === startStatePartition) return `q0`;
    return `q${index < startStatePartition ? index + 1 : index}`;
  });
  
  const remappedStateMap = new Map();
  remappedStates.forEach((state, index) => {
    stateMap.forEach((mappedState, originalState) => {
      if (mappedState === `q${index}`) {
        remappedStateMap.set(originalState, state);
      }
    });
  });
  
  // Find new final states
  const newFinalStates = P.reduce((acc, set, i) => {
    if ([...set].some(s => finalStates.includes(s))) {
      acc.push(remappedStates[i]);
    }
    return acc;
  }, []);
  
  // Build new transitions
  const newTransitionsSet = new Set();
  P.forEach((set, i) => {
    set.forEach(s => {
      alphabet.forEach(symbol => {
        const transition = transitions.find(t => t.from === s && t.symbol === symbol);
        if (transition) {
          const newFrom = remappedStateMap.get(s);
          const newTo = remappedStateMap.get(transition.to);
          if (newFrom && newTo) {
            newTransitionsSet.add(`${newFrom},${symbol},${newTo}`);
          }
        }
      });
    });
  });
  
  const newTransitions = Array.from(newTransitionsSet).map(t => {
    const [from, symbol, to] = t.split(',');
    return { from, symbol, to };
  });
  
  return {
    states: remappedStates,
    alphabet,
    transitions: newTransitions,
    startState: newStartState,
    finalStates: newFinalStates
  };
}
