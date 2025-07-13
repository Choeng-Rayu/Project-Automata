// ===============================================
// CORE AUTOMATA UTILITY FUNCTIONS
// ===============================================
// This file implements the fundamental algorithms that power the six main features:
// 1. 🔧 parseDFAInput - Parse structured automaton definitions (Feature 1)
// 2. 🔍 checkFAType - Determine DFA vs NFA classification (Feature 3)
// 3. 🧪 simulateFA - String simulation on automata (Feature 2)
// 4. 🔄 nfaToDfa - Subset construction algorithm (Feature 4)
// These functions provide the core computational engine for all automata operations.

// ===============================================
// FEATURE 1 CORE: AUTOMATON PARSING
// ===============================================

/**
 * Parse DFA input from user text - CORE ALGORITHM FOR FEATURE 1
 * This function implements the structured input parsing that enables the "Design FA" feature:
 * - Parses user-friendly text format into internal automaton structure
 * - Validates input format and extracts components
 * - Supports both DFA and NFA definitions
 * - Creates standardized automaton representation for all operations
 * 
 * Expected input format:
 * States: q0,q1,q2
 * Alphabet: 0,1
 * Transitions:
 * q0,0,q1
 * q0,1,q2
 * Start: q0
 * Final: q2
 * 
 * @param {string} text - Input text from user
 * @returns {Object} Parsed automaton with {states, alphabet, transitions, startState, finalStates}
 */
export function parseDFAInput(text) {
  // Initialize automaton components
  const lines = text.split('\n');
  let states = [], alphabet = [], transitions = [], startState = '', finalStates = [];
  
  // Parse each line of the input
  for (let line of lines) {
    if (line.startsWith('States:')) {
      // Extract and clean state names
      states = line.replace('States:', '').split(',').map(s => s.trim());
    } else if (line.startsWith('Alphabet:')) {
      // Extract alphabet symbols
      alphabet = line.replace('Alphabet:', '').split(',').map(s => s.trim());
    } else if (line.startsWith('Transitions:')) {
      // Parse transition definitions from following lines
      const idx = lines.indexOf(line);
      for (let t of lines.slice(idx + 1)) {
        if (t.startsWith('Start:') || t.startsWith('Final:')) break;
        const [from, symbol, to] = t.split(',').map(s => s.trim());
        if (from && symbol && to) transitions.push({ from, symbol, to });
      }
    } else if (line.startsWith('Start:')) {
      // Extract start state
      startState = line.replace('Start:', '').trim();
    } else if (line.startsWith('Final:')) {
      // Extract final states
      finalStates = line.replace('Final:', '').split(',').map(s => s.trim());
    }
  }
  
  return { states, alphabet, transitions, startState, finalStates };
}

// ===============================================
// FEATURE 3 CORE: DFA/NFA TYPE CHECKING
// ===============================================

/**
 * Check if FA is DFA or NFA - CORE ALGORITHM FOR FEATURE 3
 * This function implements the determinism analysis that powers the "Check FA Type" feature:
 * - Analyzes transition function for determinism properties
 * - Checks if each state has exactly one transition per symbol (DFA requirement)
 * - Identifies nondeterministic characteristics (multiple/missing transitions)
 * - Provides the foundation for type-specific processing in other features
 * 
 * DFA Requirements:
 * - Each state must have exactly one transition for each alphabet symbol
 * - No epsilon (empty string) transitions
 * - Complete and deterministic transition function
 * 
 * @param {Object} fa - Finite automaton structure
 * @returns {string} 'DFA' if deterministic, 'NFA' if nondeterministic
 */
export function checkFAType(fa) {
  const { states, alphabet, transitions } = fa;
  
  // Build transition map for analysis
  const transitionMap = {};
  
  // Initialize empty transition map
  for (const state of states) {
    transitionMap[state] = {};
  }
  
  // Populate transition map with actual transitions
  for (const t of transitions) {
    if (!transitionMap[t.from][t.symbol]) {
      transitionMap[t.from][t.symbol] = [];
    }
    transitionMap[t.from][t.symbol].push(t.to);
  }
  
  // Check determinism: each state-symbol combination must have exactly one target
  for (const state of states) {
    for (const symbol of alphabet) {
      const targets = transitionMap[state][symbol] || [];
      
      // DFA requirement: exactly one transition per state-symbol pair
      if (targets.length !== 1) return 'NFA';
    }
  }
  
  // All checks passed - this is a DFA
  return 'DFA';
}

// ===============================================
// FEATURE 2 CORE: STRING SIMULATION
// ===============================================

/**
 * Simulate input string on FA - CORE ALGORITHM FOR FEATURE 2
 * This function implements the string processing simulation that powers the "Test Input" feature:
 * - Simulates string processing on any finite automaton (DFA or NFA)
 * - Tracks state transitions step-by-step during execution
 * - Handles nondeterministic execution with multiple active states
 * - Determines ACCEPTED/REJECTED based on final states
 * - Provides the computational foundation for string testing
 * 
 * Algorithm:
 * 1. Start with initial state in active state set
 * 2. For each input symbol, compute next states from all current states
 * 3. Handle nondeterminism by maintaining set of possible states
 * 4. Accept if any final state is reachable after processing entire string
 * 
 * @param {Object} fa - Finite automaton structure
 * @param {string} input - Input string to simulate
 * @returns {boolean} True if string is accepted, false if rejected
 */
export function simulateFA(fa, input) {
  const { transitions, startState, finalStates } = fa;
  
  // Initialize simulation with start state
  let currentStates = new Set([startState]);
  
  // Process each symbol in the input string
  for (const symbol of input) {
    const nextStates = new Set();
    
    // For each currently active state, find all possible next states
    for (const state of currentStates) {
      for (const t of transitions) {
        if (t.from === state && t.symbol === symbol) {
          nextStates.add(t.to);
        }
      }
    }
    
    // Update current states for next iteration
    currentStates = nextStates;
    
    // If no states are reachable, the string will be rejected
    if (currentStates.size === 0) break;
  }
  
  // Check if any current state is a final state
  for (const state of currentStates) {
    if (finalStates.includes(state)) return true;
  }
  
  // No final state reached - string is rejected
  return false;
}

// ===============================================
// FEATURE 4 CORE: NFA TO DFA CONVERSION
// ===============================================

/**
 * Convert NFA to DFA using subset construction - CORE ALGORITHM FOR FEATURE 4
 * This function implements the subset construction algorithm that powers the "NFA→DFA" feature:
 * - Converts nondeterministic automata to equivalent deterministic automata
 * - Creates DFA states from sets of NFA states (powerset construction)
 * - Handles multiple transitions and nondeterministic choices
 * - Preserves language recognition while ensuring determinism
 * - Forms the algorithmic foundation for NFA processing in other features
 * 
 * Subset Construction Algorithm:
 * 1. Create initial DFA state from NFA start state
 * 2. For each DFA state (set of NFA states), compute transitions
 * 3. Create new DFA states for each unique set of reachable NFA states
 * 4. Mark DFA states as final if they contain any NFA final state
 * 5. Continue until no new DFA states can be created
 * 
 * @param {Object} nfa - Nondeterministic finite automaton structure
 * @returns {Object} Equivalent deterministic finite automaton
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
