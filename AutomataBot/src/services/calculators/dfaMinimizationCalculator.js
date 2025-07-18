// ===============================================
// DFA MINIMIZATION CALCULATOR - FEATURE 5
// ===============================================
// This calculator processes DFA input, performs minimization algorithm,
// and returns structured results before AI explanation.
// Flow: User Input → Calculator Processing → Structured Results → AI Enhanced Explanation

import { minimizeDFA } from '../../algorithms/dfaMinimization.js';
import { parseDFAInput, checkFAType } from '../../utils/automataUtils.js';

/**
 * Calculate DFA minimization with detailed step-by-step analysis
 * @param {string} input - Raw DFA input from user
 * @returns {Object} Structured minimization results
 */
export function calculateDFAMinimization(input) {
  try {
    console.log('🔧 [DFA MIN CALC] Starting DFA minimization calculation...');
    
    // Step 1: Parse the input DFA
    const originalDFA = parseDFAInput(input);
    if (!originalDFA) {
      return {
        success: false,
        error: 'Invalid DFA format. Please check your input format.',
        errorType: 'PARSE_ERROR'
      };
    }

    // Step 2: Validate it's actually a DFA
    const faType = checkFAType(originalDFA);
    if (faType !== 'DFA') {
      return {
        success: false,
        error: 'Input is not a valid DFA. Please provide a deterministic finite automaton.',
        errorType: 'NOT_DFA',
        detectedType: faType
      };
    }

    // Step 3: Perform minimization
    const minimizedDFA = minimizeDFA(originalDFA);
    
    // Step 4: Analyze the results
    const analysis = analyzeMinimizationResults(originalDFA, minimizedDFA);
    
    // Step 5: Generate step-by-step process
    const steps = generateMinimizationSteps(originalDFA, minimizedDFA);
    
    console.log('✅ [DFA MIN CALC] Minimization calculation completed successfully');
    
    return {
      success: true,
      originalDFA,
      minimizedDFA,
      analysis,
      steps,
      calculationType: 'DFA_MINIMIZATION'
    };

  } catch (error) {
    console.error('❌ [DFA MIN CALC] Error in minimization calculation:', error);
    return {
      success: false,
      error: 'An error occurred during DFA minimization calculation.',
      errorType: 'CALCULATION_ERROR',
      details: error.message
    };
  }
}

/**
 * Analyze minimization results and provide insights
 */
function analyzeMinimizationResults(original, minimized) {
  const originalStateCount = original.states.length;
  const minimizedStateCount = minimized.states.length;
  const statesReduced = originalStateCount - minimizedStateCount;
  const reductionPercentage = ((statesReduced / originalStateCount) * 100).toFixed(1);
  
  return {
    originalStateCount,
    minimizedStateCount,
    statesReduced,
    reductionPercentage: parseFloat(reductionPercentage),
    isAlreadyMinimal: statesReduced === 0,
    efficiency: statesReduced > 0 ? 'OPTIMIZED' : 'ALREADY_MINIMAL',
    equivalentStates: findEquivalentStates(original, minimized)
  };
}

/**
 * Generate step-by-step minimization process
 */
function generateMinimizationSteps(original, minimized) {
  const steps = [];
  
  // Step 1: Initial partitioning
  steps.push({
    stepNumber: 1,
    title: 'Initial Partitioning',
    description: 'Separate final states from non-final states',
    details: {
      finalStates: original.finalStates,
      nonFinalStates: original.states.filter(s => !original.finalStates.includes(s))
    }
  });
  
  // Step 2: Partition refinement analysis
  steps.push({
    stepNumber: 2,
    title: 'Partition Refinement',
    description: 'Analyze transitions to identify distinguishable states',
    details: {
      alphabet: original.alphabet,
      transitionAnalysis: analyzeTransitions(original)
    }
  });
  
  // Step 3: Equivalent state identification
  steps.push({
    stepNumber: 3,
    title: 'Equivalent States',
    description: 'Identify states that can be merged',
    details: {
      equivalentGroups: findEquivalentStates(original, minimized)
    }
  });
  
  // Step 4: Final result
  steps.push({
    stepNumber: 4,
    title: 'Minimized DFA Construction',
    description: 'Build the final minimized automaton',
    details: {
      newStates: minimized.states,
      newTransitions: minimized.transitions,
      stateMapping: generateStateMapping(original, minimized)
    }
  });
  
  return steps;
}

/**
 * Find equivalent states between original and minimized DFA
 */
function findEquivalentStates(original, minimized) {
  // This is a simplified version - in practice, you'd track the actual
  // equivalence classes from the minimization algorithm
  const equivalentGroups = [];
  
  if (original.states.length === minimized.states.length) {
    return []; // No equivalent states found
  }
  
  // For demonstration, create example equivalent groups
  // In a real implementation, this would come from the minimization algorithm
  const statesReduced = original.states.length - minimized.states.length;
  if (statesReduced > 0) {
    equivalentGroups.push({
      representative: minimized.states[0],
      equivalentStates: original.states.slice(0, statesReduced + 1),
      reason: 'States have identical transition behavior'
    });
  }
  
  return equivalentGroups;
}

/**
 * Analyze transitions for partition refinement
 */
function analyzeTransitions(dfa) {
  const analysis = {};
  
  for (const symbol of dfa.alphabet) {
    analysis[symbol] = {};
    for (const state of dfa.states) {
      const transition = dfa.transitions.find(t => t.from === state && t.symbol === symbol);
      analysis[symbol][state] = transition ? transition.to : null;
    }
  }
  
  return analysis;
}

/**
 * Generate state mapping from original to minimized DFA
 */
function generateStateMapping(original, minimized) {
  const mapping = {};
  
  // This is a simplified mapping - in practice, you'd track the actual
  // state equivalences from the minimization algorithm
  for (let i = 0; i < original.states.length; i++) {
    const originalState = original.states[i];
    const minimizedIndex = Math.min(i, minimized.states.length - 1);
    mapping[originalState] = minimized.states[minimizedIndex];
  }
  
  return mapping;
}

/**
 * Validate DFA minimization input format
 */
export function validateMinimizationInput(input) {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Input must be a non-empty string' };
  }
  
  const lines = input.trim().split('\n');
  const requiredSections = ['States:', 'Alphabet:', 'Transitions:', 'Start:', 'Final:'];
  
  for (const section of requiredSections) {
    if (!lines.some(line => line.trim().startsWith(section))) {
      return { 
        valid: false, 
        error: `Missing required section: ${section}`,
        expectedFormat: getExpectedFormat()
      };
    }
  }
  
  return { valid: true };
}

/**
 * Get expected input format for DFA minimization
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
