// ===============================================
// INPUT TESTING CALCULATOR - FEATURE 2
// ===============================================
// This calculator processes automaton and test string, performs simulation,
// and returns step-by-step execution results before AI explanation.
// Flow: User Input → Calculator Processing → Structured Results → AI Enhanced Explanation

import { simulateFA, checkFAType } from '../../utils/automataUtils.js';

/**
 * Calculate input testing with detailed step-by-step simulation
 * @param {Object} automaton - The finite automaton to test
 * @param {string} testString - The input string to test
 * @returns {Object} Structured simulation results
 */
export function calculateInputTest(automaton, testString) {
  try {
    console.log('🧪 [INPUT TEST CALC] Starting input testing calculation...');
    
    // Step 1: Validate automaton
    if (!automaton || !automaton.states || !automaton.alphabet) {
      return {
        success: false,
        error: 'Invalid automaton structure provided.',
        errorType: 'INVALID_AUTOMATON'
      };
    }

    // Step 2: Validate test string
    const stringValidation = validateTestString(testString, automaton.alphabet);
    if (!stringValidation.valid) {
      return {
        success: false,
        error: stringValidation.error,
        errorType: 'INVALID_STRING',
        invalidSymbols: stringValidation.invalidSymbols
      };
    }

    // Step 3: Determine automaton type
    const automatonType = checkFAType(automaton);
    
    // Step 4: Perform simulation
    const simulationResult = simulateFA(automaton, testString);
    
    // Step 5: Generate detailed execution trace
    const executionTrace = generateExecutionTrace(automaton, testString, automatonType);
    
    // Step 6: Analyze the result
    const analysis = analyzeSimulationResult(automaton, testString, simulationResult, executionTrace);
    
    console.log('✅ [INPUT TEST CALC] Input testing calculation completed successfully');
    
    return {
      success: true,
      automaton,
      testString,
      automatonType,
      result: simulationResult,
      executionTrace,
      analysis,
      calculationType: 'INPUT_TEST'
    };

  } catch (error) {
    console.error('❌ [INPUT TEST CALC] Error in input testing calculation:', error);
    return {
      success: false,
      error: 'An error occurred during input testing calculation.',
      errorType: 'CALCULATION_ERROR',
      details: error.message
    };
  }
}

/**
 * Validate test string against automaton alphabet
 */
function validateTestString(testString, alphabet) {
  if (testString === null || testString === undefined) {
    return { valid: false, error: 'Test string cannot be null or undefined' };
  }
  
  // Convert to string if not already
  const str = String(testString);
  
  // Empty string is valid (epsilon)
  if (str === '') {
    return { valid: true, isEmpty: true };
  }
  
  const invalidSymbols = [];
  for (const char of str) {
    if (!alphabet.includes(char)) {
      invalidSymbols.push(char);
    }
  }
  
  if (invalidSymbols.length > 0) {
    return {
      valid: false,
      error: `Invalid symbols found in test string: ${invalidSymbols.join(', ')}`,
      invalidSymbols: [...new Set(invalidSymbols)] // Remove duplicates
    };
  }
  
  return { valid: true, isEmpty: false };
}

/**
 * Generate detailed execution trace for the simulation
 */
function generateExecutionTrace(automaton, testString, automatonType) {
  const trace = [];
  const str = String(testString);
  
  if (automatonType === 'DFA') {
    return generateDFATrace(automaton, str);
  } else {
    return generateNFATrace(automaton, str);
  }
}

/**
 * Generate execution trace for DFA
 */
function generateDFATrace(dfa, testString) {
  const trace = [];
  let currentState = dfa.startState;
  
  // Initial state
  trace.push({
    step: 0,
    inputPosition: 0,
    currentState: currentState,
    remainingInput: testString,
    symbol: null,
    action: 'START',
    description: `Starting at state ${currentState}`
  });
  
  // Process each symbol
  for (let i = 0; i < testString.length; i++) {
    const symbol = testString[i];
    const transition = dfa.transitions.find(t => 
      t.from === currentState && t.symbol === symbol
    );
    
    if (!transition) {
      trace.push({
        step: i + 1,
        inputPosition: i,
        currentState: currentState,
        remainingInput: testString.substring(i),
        symbol: symbol,
        action: 'REJECT',
        description: `No transition from ${currentState} on symbol '${symbol}' - REJECTED`
      });
      break;
    }
    
    const nextState = transition.to;
    trace.push({
      step: i + 1,
      inputPosition: i,
      currentState: currentState,
      nextState: nextState,
      remainingInput: testString.substring(i),
      symbol: symbol,
      action: 'TRANSITION',
      description: `Read '${symbol}', transition from ${currentState} to ${nextState}`
    });
    
    currentState = nextState;
  }
  
  // Final state check
  const finalStep = trace.length;
  const isAccepted = dfa.finalStates.includes(currentState);
  trace.push({
    step: finalStep,
    inputPosition: testString.length,
    currentState: currentState,
    remainingInput: '',
    symbol: null,
    action: isAccepted ? 'ACCEPT' : 'REJECT',
    description: isAccepted 
      ? `Input consumed, final state ${currentState} is accepting - ACCEPTED`
      : `Input consumed, final state ${currentState} is not accepting - REJECTED`
  });
  
  return trace;
}

/**
 * Generate execution trace for NFA (simplified - shows one possible path)
 */
function generateNFATrace(nfa, testString) {
  const trace = [];
  let currentStates = new Set([nfa.startState]);
  
  // Initial state
  trace.push({
    step: 0,
    inputPosition: 0,
    currentStates: Array.from(currentStates),
    remainingInput: testString,
    symbol: null,
    action: 'START',
    description: `Starting at state(s) {${Array.from(currentStates).join(', ')}}`
  });
  
  // Process each symbol
  for (let i = 0; i < testString.length; i++) {
    const symbol = testString[i];
    const nextStates = new Set();
    
    // Find all possible transitions
    for (const state of currentStates) {
      const transitions = nfa.transitions.filter(t => 
        t.from === state && t.symbol === symbol
      );
      transitions.forEach(t => nextStates.add(t.to));
    }
    
    if (nextStates.size === 0) {
      trace.push({
        step: i + 1,
        inputPosition: i,
        currentStates: Array.from(currentStates),
        remainingInput: testString.substring(i),
        symbol: symbol,
        action: 'REJECT',
        description: `No transitions from {${Array.from(currentStates).join(', ')}} on symbol '${symbol}' - REJECTED`
      });
      break;
    }
    
    trace.push({
      step: i + 1,
      inputPosition: i,
      currentStates: Array.from(currentStates),
      nextStates: Array.from(nextStates),
      remainingInput: testString.substring(i),
      symbol: symbol,
      action: 'TRANSITION',
      description: `Read '${symbol}', transition from {${Array.from(currentStates).join(', ')}} to {${Array.from(nextStates).join(', ')}}`
    });
    
    currentStates = nextStates;
  }
  
  // Final state check
  const finalStep = trace.length;
  const hasAcceptingState = Array.from(currentStates).some(state => 
    nfa.finalStates.includes(state)
  );
  
  trace.push({
    step: finalStep,
    inputPosition: testString.length,
    currentStates: Array.from(currentStates),
    remainingInput: '',
    symbol: null,
    action: hasAcceptingState ? 'ACCEPT' : 'REJECT',
    description: hasAcceptingState 
      ? `Input consumed, at least one final state in {${Array.from(currentStates).join(', ')}} - ACCEPTED`
      : `Input consumed, no final states in {${Array.from(currentStates).join(', ')}} - REJECTED`
  });
  
  return trace;
}

/**
 * Analyze simulation result and provide insights
 */
function analyzeSimulationResult(automaton, testString, result, trace) {
  const analysis = {
    inputLength: testString.length,
    stepsExecuted: trace.length - 1, // Exclude initial state
    result: result ? 'ACCEPTED' : 'REJECTED',
    automatonType: checkFAType(automaton),
    finalStates: automaton.finalStates,
    pathTaken: trace.map(step => step.currentState || step.currentStates).filter(Boolean),
    transitionsUsed: trace.filter(step => step.action === 'TRANSITION').length
  };
  
  // Add specific insights based on result
  if (result) {
    analysis.acceptanceReason = 'String was accepted because the automaton reached a final state';
    analysis.finalStateReached = trace[trace.length - 1].currentState || trace[trace.length - 1].currentStates;
  } else {
    const lastStep = trace[trace.length - 1];
    if (lastStep.action === 'REJECT' && lastStep.symbol) {
      analysis.rejectionReason = `No valid transition found for symbol '${lastStep.symbol}'`;
    } else {
      analysis.rejectionReason = 'Input was fully consumed but no final state was reached';
    }
  }
  
  return analysis;
}

/**
 * Validate input test parameters
 */
export function validateInputTestParams(automaton, testString) {
  const errors = [];
  
  if (!automaton) {
    errors.push('Automaton is required');
  } else {
    if (!automaton.states || !Array.isArray(automaton.states)) {
      errors.push('Automaton must have a valid states array');
    }
    if (!automaton.alphabet || !Array.isArray(automaton.alphabet)) {
      errors.push('Automaton must have a valid alphabet array');
    }
    if (!automaton.startState) {
      errors.push('Automaton must have a start state');
    }
  }
  
  if (testString === null || testString === undefined) {
    errors.push('Test string is required (use empty string for epsilon)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
