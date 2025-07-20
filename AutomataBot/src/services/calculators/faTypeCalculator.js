// ===============================================
// FA TYPE CHECKER CALCULATOR - FEATURE 3
// ===============================================
// This calculator analyzes automaton structure, determines DFA/NFA classification,
// and returns detailed type analysis before AI explanation.
// Flow: User Input → Calculator Processing → Structured Results → AI Enhanced Explanation

import { parseDFAInput, checkFAType } from '../../utils/automataUtils.js';

/**
 * Calculate FA type analysis with detailed determinism analysis
 * @param {string} input - Raw automaton input from user
 * @returns {Object} Structured type analysis results
 */
export function calculateFAType(input) {
  try {
    console.log('🔍 [FA TYPE CALC] Starting FA type analysis calculation...');
    
    // Step 1: Parse the input automaton
    const automaton = parseDFAInput(input);
    if (!automaton) {
      return {
        success: false,
        error: 'Invalid automaton format. Please check your input format.',
        errorType: 'PARSE_ERROR'
      };
    }

    // Step 2: Determine automaton type
    const automatonType = checkFAType(automaton);
    
    // Step 3: Analyze determinism properties
    const determinismAnalysis = analyzeDeterminism(automaton);
    
    // Step 4: Check for NFA characteristics
    const nfaCharacteristics = analyzeNFACharacteristics(automaton);
    
    // Step 5: Analyze transition function properties
    const transitionAnalysis = analyzeTransitionFunction(automaton);
    
    // Step 6: Generate detailed reasoning
    const reasoning = generateTypeReasoning(automaton, automatonType, determinismAnalysis, nfaCharacteristics);
    
    console.log('✅ [FA TYPE CALC] FA type analysis calculation completed successfully');
    
    return {
      success: true,
      automaton,
      type: automatonType,
      determinismAnalysis,
      nfaCharacteristics,
      transitionAnalysis,
      reasoning,
      calculationType: 'FA_TYPE_CHECK'
    };

  } catch (error) {
    console.error('❌ [FA TYPE CALC] Error in FA type analysis calculation:', error);
    return {
      success: false,
      error: 'An error occurred during FA type analysis calculation.',
      errorType: 'CALCULATION_ERROR',
      details: error.message
    };
  }
}

/**
 * Analyze determinism properties of the automaton
 */
function analyzeDeterminism(automaton) {
  const analysis = {
    isDeterministic: true,
    violations: [],
    transitionMatrix: buildTransitionMatrix(automaton),
    completeness: analyzeCompleteness(automaton)
  };
  
  // Check for multiple transitions from same state on same symbol
  const transitionMap = {};
  
  for (const transition of automaton.transitions) {
    const key = `${transition.from}-${transition.symbol}`;
    
    if (!transitionMap[key]) {
      transitionMap[key] = [];
    }
    transitionMap[key].push(transition.to);
  }
  
  // Analyze each state-symbol combination
  for (const state of automaton.states) {
    for (const symbol of automaton.alphabet) {
      const key = `${state}-${symbol}`;
      const targets = transitionMap[key] || [];
      
      if (targets.length > 1) {
        analysis.isDeterministic = false;
        analysis.violations.push({
          type: 'MULTIPLE_TRANSITIONS',
          state: state,
          symbol: symbol,
          targets: targets,
          description: `State ${state} has ${targets.length} transitions on symbol '${symbol}'`
        });
      } else if (targets.length === 0) {
        analysis.violations.push({
          type: 'MISSING_TRANSITION',
          state: state,
          symbol: symbol,
          description: `State ${state} has no transition on symbol '${symbol}'`
        });
      }
    }
  }
  
  return analysis;
}

/**
 * Build transition matrix for analysis
 */
function buildTransitionMatrix(automaton) {
  const matrix = {};
  
  // Initialize matrix
  for (const state of automaton.states) {
    matrix[state] = {};
    for (const symbol of automaton.alphabet) {
      matrix[state][symbol] = [];
    }
  }
  
  // Populate matrix with transitions
  for (const transition of automaton.transitions) {
    matrix[transition.from][transition.symbol].push(transition.to);
  }
  
  return matrix;
}

/**
 * Analyze completeness of the automaton
 */
function analyzeCompleteness(automaton) {
  const totalRequired = automaton.states.length * automaton.alphabet.length;
  let totalPresent = 0;
  let missingTransitions = [];
  
  for (const state of automaton.states) {
    for (const symbol of automaton.alphabet) {
      const transitions = automaton.transitions.filter(t => 
        t.from === state && t.symbol === symbol
      );
      
      if (transitions.length > 0) {
        totalPresent++;
      } else {
        missingTransitions.push({ state, symbol });
      }
    }
  }
  
  return {
    isComplete: totalPresent === totalRequired,
    totalRequired,
    totalPresent,
    missingTransitions,
    completenessPercentage: ((totalPresent / totalRequired) * 100).toFixed(1)
  };
}

/**
 * Analyze NFA characteristics
 */
function analyzeNFACharacteristics(automaton) {
  const characteristics = {
    hasMultipleTransitions: false,
    hasMissingTransitions: false,
    hasEpsilonTransitions: false,
    nondeterministicStates: [],
    incompleteStates: [],
    examples: []
  };
  
  // Check for nondeterministic transitions
  const transitionCounts = {};
  
  for (const state of automaton.states) {
    for (const symbol of automaton.alphabet) {
      const key = `${state}-${symbol}`;
      const transitions = automaton.transitions.filter(t => 
        t.from === state && t.symbol === symbol
      );
      
      transitionCounts[key] = transitions.length;
      
      if (transitions.length > 1) {
        characteristics.hasMultipleTransitions = true;
        characteristics.nondeterministicStates.push({
          state,
          symbol,
          targetCount: transitions.length,
          targets: transitions.map(t => t.to)
        });
        
        characteristics.examples.push({
          type: 'NONDETERMINISTIC',
          description: `From state ${state} on symbol '${symbol}', can go to: ${transitions.map(t => t.to).join(', ')}`,
          state,
          symbol,
          targets: transitions.map(t => t.to)
        });
      } else if (transitions.length === 0) {
        characteristics.hasMissingTransitions = true;
        characteristics.incompleteStates.push({
          state,
          symbol
        });
        
        characteristics.examples.push({
          type: 'INCOMPLETE',
          description: `State ${state} has no transition on symbol '${symbol}'`,
          state,
          symbol
        });
      }
    }
  }
  
  // Check for epsilon transitions (if any transitions have empty symbol)
  const epsilonTransitions = automaton.transitions.filter(t => 
    t.symbol === '' || t.symbol === 'ε' || t.symbol === 'epsilon'
  );
  
  if (epsilonTransitions.length > 0) {
    characteristics.hasEpsilonTransitions = true;
    characteristics.examples.push({
      type: 'EPSILON',
      description: `Found ${epsilonTransitions.length} epsilon transition(s)`,
      transitions: epsilonTransitions
    });
  }
  
  return characteristics;
}

/**
 * Analyze transition function properties
 */
function analyzeTransitionFunction(automaton) {
  const analysis = {
    totalTransitions: automaton.transitions.length,
    transitionDensity: 0,
    stateTransitionCounts: {},
    symbolUsage: {},
    transitionTypes: {
      selfLoops: 0,
      forwardTransitions: 0,
      backwardTransitions: 0
    }
  };
  
  // Calculate transition density
  const maxPossibleTransitions = automaton.states.length * automaton.alphabet.length;
  analysis.transitionDensity = ((analysis.totalTransitions / maxPossibleTransitions) * 100).toFixed(1);
  
  // Count transitions per state
  for (const state of automaton.states) {
    analysis.stateTransitionCounts[state] = {
      outgoing: automaton.transitions.filter(t => t.from === state).length,
      incoming: automaton.transitions.filter(t => t.to === state).length
    };
  }
  
  // Count symbol usage
  for (const symbol of automaton.alphabet) {
    analysis.symbolUsage[symbol] = automaton.transitions.filter(t => t.symbol === symbol).length;
  }
  
  // Analyze transition types
  for (const transition of automaton.transitions) {
    if (transition.from === transition.to) {
      analysis.transitionTypes.selfLoops++;
    } else {
      // Simple heuristic: if target state comes after source in array, it's forward
      const fromIndex = automaton.states.indexOf(transition.from);
      const toIndex = automaton.states.indexOf(transition.to);
      
      if (toIndex > fromIndex) {
        analysis.transitionTypes.forwardTransitions++;
      } else {
        analysis.transitionTypes.backwardTransitions++;
      }
    }
  }
  
  return analysis;
}

/**
 * Generate detailed reasoning for type classification
 */
function generateTypeReasoning(automaton, type, determinismAnalysis, nfaCharacteristics) {
  const reasoning = {
    classification: type,
    primaryReasons: [],
    supportingEvidence: [],
    counterExamples: [],
    summary: ''
  };
  
  if (type === 'DFA') {
    reasoning.primaryReasons.push('Each state has exactly one transition for each alphabet symbol');
    reasoning.primaryReasons.push('No nondeterministic choices exist');
    
    if (determinismAnalysis.completeness.isComplete) {
      reasoning.supportingEvidence.push(`Complete transition function: ${determinismAnalysis.completeness.totalPresent}/${determinismAnalysis.completeness.totalRequired} transitions defined`);
    } else {
      reasoning.supportingEvidence.push(`Partial transition function: ${determinismAnalysis.completeness.totalPresent}/${determinismAnalysis.completeness.totalRequired} transitions defined`);
    }
    
    reasoning.supportingEvidence.push('No multiple transitions from any state on the same symbol');
    
    reasoning.summary = 'This is a Deterministic Finite Automaton (DFA) because it satisfies the determinism requirement: each state has at most one transition for each input symbol.';
    
  } else {
    reasoning.primaryReasons.push('Contains nondeterministic transitions');
    
    if (nfaCharacteristics.hasMultipleTransitions) {
      reasoning.primaryReasons.push('Multiple transitions exist from the same state on the same symbol');
      
      for (const example of nfaCharacteristics.examples) {
        if (example.type === 'NONDETERMINISTIC') {
          reasoning.counterExamples.push(`State ${example.state} on symbol '${example.symbol}' can transition to: ${example.targets.join(', ')}`);
        }
      }
    }
    
    if (nfaCharacteristics.hasMissingTransitions) {
      reasoning.supportingEvidence.push('Some states lack transitions for certain symbols (partial transition function)');
    }
    
    if (nfaCharacteristics.hasEpsilonTransitions) {
      reasoning.primaryReasons.push('Contains epsilon (empty string) transitions');
    }
    
    reasoning.summary = 'This is a Nondeterministic Finite Automaton (NFA) because it violates the determinism requirement of DFAs.';
  }
  
  return reasoning;
}

/**
 * Validate FA type check input
 */
export function validateFATypeInput(input) {
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
 * Get expected input format for FA type checking
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

/**
 * Generate type classification summary
 */
export function generateTypeClassificationSummary(result) {
  if (!result.success) {
    return 'Unable to classify automaton due to errors.';
  }
  
  const { type, determinismAnalysis, nfaCharacteristics } = result;
  
  let summary = `This automaton is classified as a ${type}.\n\n`;
  
  if (type === 'DFA') {
    summary += '✅ **DFA Characteristics:**\n';
    summary += `- Complete deterministic transitions: ${determinismAnalysis.completeness.isComplete ? 'Yes' : 'No'}\n`;
    summary += `- Transition coverage: ${determinismAnalysis.completeness.completenessPercentage}%\n`;
    summary += `- Total transitions: ${result.transitionAnalysis.totalTransitions}\n`;
  } else {
    summary += '🔄 **NFA Characteristics:**\n';
    if (nfaCharacteristics.hasMultipleTransitions) {
      summary += `- Multiple transitions: ${nfaCharacteristics.nondeterministicStates.length} cases found\n`;
    }
    if (nfaCharacteristics.hasMissingTransitions) {
      summary += `- Missing transitions: ${nfaCharacteristics.incompleteStates.length} cases found\n`;
    }
    if (nfaCharacteristics.hasEpsilonTransitions) {
      summary += '- Contains epsilon transitions\n';
    }
  }
  
  return summary;
}
