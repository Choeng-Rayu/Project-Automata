// Utility functions for finite automata operations

/**
 * Parse DFA input from user text
 * @param {string} text - Input text
 * @returns {Object} Parsed automaton
 */
export function parseDFAInput(text) {
  // Expected format:
  // States: q0,q1,q2\nAlphabet: 0,1\nTransitions: q0,0,q1\nq0,1,q2\n...\nStart: q0\nFinal: q2
  const lines = text.split('\n');
  let states = [], alphabet = [], transitions = [], startState = '', finalStates = [];
  
  for (let line of lines) {
    if (line.startsWith('States:')) {
      states = line.replace('States:', '').split(',').map(s => s.trim());
    } else if (line.startsWith('Alphabet:')) {
      alphabet = line.replace('Alphabet:', '').split(',').map(s => s.trim());
    } else if (line.startsWith('Transitions:')) {
      // transitions start from next lines
      const idx = lines.indexOf(line);
      for (let t of lines.slice(idx + 1)) {
        if (t.startsWith('Start:') || t.startsWith('Final:')) break;
        const [from, symbol, to] = t.split(',').map(s => s.trim());
        if (from && symbol && to) transitions.push({ from, symbol, to });
      }
    } else if (line.startsWith('Start:')) {
      startState = line.replace('Start:', '').trim();
    } else if (line.startsWith('Final:')) {
      finalStates = line.replace('Final:', '').split(',').map(s => s.trim());
    }
  }
  
  return { states, alphabet, transitions, startState, finalStates };
}

/**
 * Check if FA is DFA or NFA
 * @param {Object} fa - Finite automaton
 * @returns {string} 'DFA' or 'NFA'
 */
export function checkFAType(fa) {
  // DFA: exactly one transition for each symbol from each state
  // NFA: may have multiple or missing transitions for a symbol from a state
  const { states, alphabet, transitions } = fa;
  const transitionMap = {};
  
  for (const state of states) {
    transitionMap[state] = {};
  }
  
  for (const t of transitions) {
    if (!transitionMap[t.from][t.symbol]) {
      transitionMap[t.from][t.symbol] = [];
    }
    transitionMap[t.from][t.symbol].push(t.to);
  }
  
  for (const state of states) {
    for (const symbol of alphabet) {
      const targets = transitionMap[state][symbol] || [];
      if (targets.length !== 1) return 'NFA';
    }
  }
  return 'DFA';
}

/**
 * Simulate input string on FA (works for DFA and NFA)
 * @param {Object} fa - Finite automaton
 * @param {string} input - Input string
 * @returns {boolean} True if accepted, false if rejected
 */
export function simulateFA(fa, input) {
  const { transitions, startState, finalStates } = fa;
  let currentStates = new Set([startState]);
  
  for (const symbol of input) {
    const nextStates = new Set();
    for (const state of currentStates) {
      for (const t of transitions) {
        if (t.from === state && t.symbol === symbol) {
          nextStates.add(t.to);
        }
      }
    }
    currentStates = nextStates;
    if (currentStates.size === 0) break;
  }
  
  for (const state of currentStates) {
    if (finalStates.includes(state)) return true;
  }
  return false;
}

/**
 * Convert NFA to DFA using subset construction
 * @param {Object} nfa - Nondeterministic finite automaton
 * @returns {Object} Deterministic finite automaton
 */
export function nfaToDfa(nfa) {
  const { alphabet, transitions, startState, finalStates } = nfa;
  
  const getTargets = (stateSet, symbol) => {
    const targets = new Set();
    for (const state of stateSet) {
      for (const t of transitions) {
        if (t.from === state && t.symbol === symbol) {
          targets.add(t.to);
        }
      }
    }
    return Array.from(targets);
  };
  
  const dfaStates = [];
  const dfaTransitions = [];
  const dfaFinalStates = [];
  const stateMap = {};
  let queue = [];
  
  const startSet = [startState];
  queue.push(startSet);
  stateMap[startSet.join(',')] = 'Q0';
  dfaStates.push('Q0');
  if (startSet.some(s => finalStates.includes(s))) dfaFinalStates.push('Q0');
  
  let stateCount = 1;
  while (queue.length > 0) {
    const currentSet = queue.shift();
    const currentName = stateMap[currentSet.join(',')];
    
    for (const symbol of alphabet) {
      const targetSet = getTargets(currentSet, symbol);
      if (targetSet.length === 0) continue;
      
      const key = targetSet.sort().join(',');
      if (!stateMap[key]) {
        stateMap[key] = `Q${stateCount++}`;
        dfaStates.push(stateMap[key]);
        if (targetSet.some(s => finalStates.includes(s))) dfaFinalStates.push(stateMap[key]);
        queue.push(targetSet);
      }
      dfaTransitions.push({ from: currentName, symbol, to: stateMap[key] });
    }
  }
  
  return {
    states: dfaStates,
    alphabet,
    transitions: dfaTransitions,
    startState: 'Q0',
    finalStates: dfaFinalStates
  };
}
