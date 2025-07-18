// ===============================================
// DFA DESIGN CALCULATOR - FEATURE 1
// ===============================================
// This calculator validates and processes automaton definitions,
// checks completeness, and returns structured analysis before AI explanation.
// Flow: User Input → Calculator Processing → Structured Results → AI Enhanced Explanation

import { parseDFAInput, checkFAType } from '../../utils/automataUtils.js';

/**
 * Calculate DFA design analysis with detailed validation and structure analysis
 * @param {string} input - Raw automaton input from user
 * @returns {Object} Structured design analysis results
 */
export function calculateDFADesign(input) {
  try {
    console.log('🔧 [DFA DESIGN CALC] Starting DFA design calculation...');
    
    // Step 1: Parse the input automaton
    const automaton = parseDFAInput(input);
    if (!automaton) {
      return {
        success: false,
        error: 'Invalid automaton format. Please check your input format.',
        errorType: 'PARSE_ERROR',
        expectedFormat: getExpectedFormat()
      };
    }

    // Step 2: Determine automaton type
    const automatonType = checkFAType(automaton);
    
    // Step 3: Validate automaton structure
    const validation = validateAutomatonStructure(automaton);
    
    // Step 4: Analyze completeness and properties
    const analysis = analyzeAutomatonProperties(automaton, automatonType);
    
    // Step 5: Check for common design issues
    const designIssues = checkDesignIssues(automaton, automatonType);
    
    // Step 6: Generate design recommendations
    const recommendations = generateDesignRecommendations(automaton, automatonType, designIssues);
    
    console.log('✅ [DFA DESIGN CALC] DFA design calculation completed successfully');
    
    return {
      success: true,
      automaton,
      automatonType,
      validation,
      analysis,
      designIssues,
      recommendations,
      calculationType: 'DFA_DESIGN'
    };

  } catch (error) {
    console.error('❌ [DFA DESIGN CALC] Error in DFA design calculation:', error);
    return {
      success: false,
      error: 'An error occurred during DFA design calculation.',
      errorType: 'CALCULATION_ERROR',
      details: error.message
    };
  }
}

/**
 * Validate automaton structure for completeness and correctness
 */
function validateAutomatonStructure(automaton) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    checks: {}
  };

  // Check 1: States validation
  validation.checks.states = validateStates(automaton.states);
  if (!validation.checks.states.valid) {
    validation.isValid = false;
    validation.errors.push(...validation.checks.states.errors);
  }

  // Check 2: Alphabet validation
  validation.checks.alphabet = validateAlphabet(automaton.alphabet);
  if (!validation.checks.alphabet.valid) {
    validation.isValid = false;
    validation.errors.push(...validation.checks.alphabet.errors);
  }

  // Check 3: Start state validation
  validation.checks.startState = validateStartState(automaton.startState, automaton.states);
  if (!validation.checks.startState.valid) {
    validation.isValid = false;
    validation.errors.push(...validation.checks.startState.errors);
  }

  // Check 4: Final states validation
  validation.checks.finalStates = validateFinalStates(automaton.finalStates, automaton.states);
  if (!validation.checks.finalStates.valid) {
    validation.isValid = false;
    validation.errors.push(...validation.checks.finalStates.errors);
  }

  // Check 5: Transitions validation
  validation.checks.transitions = validateTransitions(automaton.transitions, automaton.states, automaton.alphabet);
  if (!validation.checks.transitions.valid) {
    validation.isValid = false;
    validation.errors.push(...validation.checks.transitions.errors);
  }
  validation.warnings.push(...validation.checks.transitions.warnings);

  return validation;
}

/**
 * Validate states array
 */
function validateStates(states) {
  const validation = { valid: true, errors: [] };
  
  if (!Array.isArray(states) || states.length === 0) {
    validation.valid = false;
    validation.errors.push('States must be a non-empty array');
    return validation;
  }
  
  // Check for duplicate states
  const uniqueStates = new Set(states);
  if (uniqueStates.size !== states.length) {
    validation.valid = false;
    validation.errors.push('Duplicate states found');
  }
  
  // Check for empty or invalid state names
  for (const state of states) {
    if (!state || typeof state !== 'string' || state.trim() === '') {
      validation.valid = false;
      validation.errors.push('All states must be non-empty strings');
      break;
    }
  }
  
  return validation;
}

/**
 * Validate alphabet array
 */
function validateAlphabet(alphabet) {
  const validation = { valid: true, errors: [] };
  
  if (!Array.isArray(alphabet) || alphabet.length === 0) {
    validation.valid = false;
    validation.errors.push('Alphabet must be a non-empty array');
    return validation;
  }
  
  // Check for duplicate symbols
  const uniqueSymbols = new Set(alphabet);
  if (uniqueSymbols.size !== alphabet.length) {
    validation.valid = false;
    validation.errors.push('Duplicate symbols in alphabet');
  }
  
  return validation;
}

/**
 * Validate start state
 */
function validateStartState(startState, states) {
  const validation = { valid: true, errors: [] };
  
  if (!startState) {
    validation.valid = false;
    validation.errors.push('Start state is required');
  } else if (!states.includes(startState)) {
    validation.valid = false;
    validation.errors.push('Start state must be in the states set');
  }
  
  return validation;
}

/**
 * Validate final states
 */
function validateFinalStates(finalStates, states) {
  const validation = { valid: true, errors: [] };
  
  if (!Array.isArray(finalStates)) {
    validation.valid = false;
    validation.errors.push('Final states must be an array');
    return validation;
  }
  
  // Check if all final states are in the states set
  for (const finalState of finalStates) {
    if (!states.includes(finalState)) {
      validation.valid = false;
      validation.errors.push(`Final state '${finalState}' is not in the states set`);
    }
  }
  
  return validation;
}

/**
 * Validate transitions
 */
function validateTransitions(transitions, states, alphabet) {
  const validation = { valid: true, errors: [], warnings: [] };
  
  if (!Array.isArray(transitions)) {
    validation.valid = false;
    validation.errors.push('Transitions must be an array');
    return validation;
  }
  
  // Check each transition
  for (const transition of transitions) {
    if (!transition.from || !transition.symbol || !transition.to) {
      validation.valid = false;
      validation.errors.push('Each transition must have from, symbol, and to properties');
      continue;
    }
    
    if (!states.includes(transition.from)) {
      validation.valid = false;
      validation.errors.push(`Transition source state '${transition.from}' is not in states set`);
    }
    
    if (!states.includes(transition.to)) {
      validation.valid = false;
      validation.errors.push(`Transition target state '${transition.to}' is not in states set`);
    }
    
    if (!alphabet.includes(transition.symbol)) {
      validation.valid = false;
      validation.errors.push(`Transition symbol '${transition.symbol}' is not in alphabet`);
    }
  }
  
  return validation;
}

/**
 * Analyze automaton properties and completeness
 */
function analyzeAutomatonProperties(automaton, automatonType) {
  const analysis = {
    type: automatonType,
    stateCount: automaton.states.length,
    alphabetSize: automaton.alphabet.length,
    transitionCount: automaton.transitions.length,
    finalStateCount: automaton.finalStates.length,
    completeness: analyzeCompleteness(automaton, automatonType),
    connectivity: analyzeConnectivity(automaton),
    properties: analyzeSpecialProperties(automaton)
  };
  
  return analysis;
}

/**
 * Analyze automaton completeness
 */
function analyzeCompleteness(automaton, automatonType) {
  const completeness = {
    isComplete: true,
    missingTransitions: [],
    totalRequired: 0,
    totalPresent: 0
  };
  
  if (automatonType === 'DFA') {
    // For DFA, each state must have exactly one transition for each symbol
    completeness.totalRequired = automaton.states.length * automaton.alphabet.length;
    
    for (const state of automaton.states) {
      for (const symbol of automaton.alphabet) {
        const transitions = automaton.transitions.filter(t => 
          t.from === state && t.symbol === symbol
        );
        
        if (transitions.length === 0) {
          completeness.isComplete = false;
          completeness.missingTransitions.push({ state, symbol });
        } else if (transitions.length === 1) {
          completeness.totalPresent++;
        }
      }
    }
  } else {
    // For NFA, just count present transitions
    completeness.totalPresent = automaton.transitions.length;
    completeness.totalRequired = 'N/A (NFA)';
  }
  
  return completeness;
}

/**
 * Analyze automaton connectivity
 */
function analyzeConnectivity(automaton) {
  const connectivity = {
    reachableStates: findReachableStates(automaton),
    unreachableStates: [],
    deadStates: findDeadStates(automaton),
    stronglyConnected: false
  };
  
  connectivity.unreachableStates = automaton.states.filter(
    state => !connectivity.reachableStates.includes(state)
  );
  
  return connectivity;
}

/**
 * Find reachable states from start state
 */
function findReachableStates(automaton) {
  const reachable = new Set([automaton.startState]);
  const queue = [automaton.startState];
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    for (const transition of automaton.transitions) {
      if (transition.from === current && !reachable.has(transition.to)) {
        reachable.add(transition.to);
        queue.push(transition.to);
      }
    }
  }
  
  return Array.from(reachable);
}

/**
 * Find dead states (states with no path to final states)
 */
function findDeadStates(automaton) {
  const deadStates = [];
  
  for (const state of automaton.states) {
    if (!canReachFinalState(state, automaton)) {
      deadStates.push(state);
    }
  }
  
  return deadStates;
}

/**
 * Check if a state can reach any final state
 */
function canReachFinalState(startState, automaton) {
  if (automaton.finalStates.includes(startState)) {
    return true;
  }
  
  const visited = new Set();
  const queue = [startState];
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    if (automaton.finalStates.includes(current)) {
      return true;
    }
    
    for (const transition of automaton.transitions) {
      if (transition.from === current && !visited.has(transition.to)) {
        queue.push(transition.to);
      }
    }
  }
  
  return false;
}

/**
 * Analyze special properties
 */
function analyzeSpecialProperties(automaton) {
  return {
    hasLoops: hasLoops(automaton),
    hasSelfLoops: hasSelfLoops(automaton),
    isMinimal: 'Unknown', // Would require minimization algorithm
    acceptsEmptyString: automaton.finalStates.includes(automaton.startState)
  };
}

/**
 * Check if automaton has loops
 */
function hasLoops(automaton) {
  // Simple cycle detection using DFS
  const visited = new Set();
  const recursionStack = new Set();
  
  function hasCycle(state) {
    if (recursionStack.has(state)) return true;
    if (visited.has(state)) return false;
    
    visited.add(state);
    recursionStack.add(state);
    
    for (const transition of automaton.transitions) {
      if (transition.from === state && hasCycle(transition.to)) {
        return true;
      }
    }
    
    recursionStack.delete(state);
    return false;
  }
  
  return hasCycle(automaton.startState);
}

/**
 * Check if automaton has self-loops
 */
function hasSelfLoops(automaton) {
  return automaton.transitions.some(t => t.from === t.to);
}

/**
 * Check for common design issues
 */
function checkDesignIssues(automaton, automatonType) {
  const issues = [];
  
  // Issue 1: Unreachable states
  const reachableStates = findReachableStates(automaton);
  const unreachableStates = automaton.states.filter(s => !reachableStates.includes(s));
  if (unreachableStates.length > 0) {
    issues.push({
      type: 'UNREACHABLE_STATES',
      severity: 'WARNING',
      description: `States ${unreachableStates.join(', ')} are unreachable from the start state`,
      states: unreachableStates
    });
  }
  
  // Issue 2: Dead states
  const deadStates = findDeadStates(automaton);
  if (deadStates.length > 0) {
    issues.push({
      type: 'DEAD_STATES',
      severity: 'WARNING',
      description: `States ${deadStates.join(', ')} cannot reach any final state`,
      states: deadStates
    });
  }
  
  // Issue 3: No final states
  if (automaton.finalStates.length === 0) {
    issues.push({
      type: 'NO_FINAL_STATES',
      severity: 'ERROR',
      description: 'Automaton has no final states - will reject all strings'
    });
  }
  
  return issues;
}

/**
 * Generate design recommendations
 */
function generateDesignRecommendations(automaton, automatonType, issues) {
  const recommendations = [];
  
  for (const issue of issues) {
    switch (issue.type) {
      case 'UNREACHABLE_STATES':
        recommendations.push({
          type: 'REMOVE_UNREACHABLE',
          description: 'Consider removing unreachable states to simplify the automaton',
          action: `Remove states: ${issue.states.join(', ')}`
        });
        break;
      case 'DEAD_STATES':
        recommendations.push({
          type: 'HANDLE_DEAD_STATES',
          description: 'Consider removing dead states or adding transitions to final states',
          action: `Review states: ${issue.states.join(', ')}`
        });
        break;
      case 'NO_FINAL_STATES':
        recommendations.push({
          type: 'ADD_FINAL_STATES',
          description: 'Add at least one final state to make the automaton useful',
          action: 'Designate appropriate states as final states'
        });
        break;
    }
  }
  
  return recommendations;
}

/**
 * Get expected input format
 */
function getExpectedFormat() {
  return `Expected format:
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q0
q1,0,q2
q1,1,q0
Start: q0
Final: q2`;
}
