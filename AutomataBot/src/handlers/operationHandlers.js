// ===============================================
// OPERATION HANDLERS FOR THE SIX MAIN FEATURES
// ===============================================
// This file implements the core processing logic for all six main automata operations:
// 1. 🔧 Design FA - Parse and validate automaton definitions
// 2. 🧪 Test Input - Simulate string processing with step-by-step execution
// 3. 🔍 Check FA Type - Analyze automaton type (DFA/NFA) with explanations  
// 4. 🔄 NFA→DFA - Convert using subset construction with detailed process
// 5. ⚡ Minimize DFA - Apply partition refinement algorithm with state analysis
// 6. Session Management - Handle multi-step operations and user workflows

import { parseDFAInput, checkFAType, simulateFA, nfaToDfa } from '../utils/automataUtils.js';
import { minimizeDFA } from '../algorithms/dfaMinimization.js';
import { explainAutomataStep } from '../services/aiService.js';
import { saveToDatabase } from '../config/database.js';
import { sendFormattedResult, formatTestResult, formatErrorMessage } from '../utils/messageFormatter.js';
import { updateUserSession } from '../utils/sessionManager.js';
import { generateAutomatonImage, generateComparisonImage, generateSimulationImage, cleanupTempImages } from '../services/imageService.js';
import fs from 'fs-extra';

// Import the new calculators
import { calculateDFADesign } from '../services/calculators/dfaDesignCalculator.js';
import { calculateInputTest } from '../services/calculators/inputTestCalculator.js';
import { calculateFAType } from '../services/calculators/faTypeCalculator.js';
import { calculateNFAToDFA } from '../services/calculators/nfaToDfaCalculator.js';
import { calculateDFAMinimization } from '../services/calculators/dfaMinimizationCalculator.js';
import { calculateRegexOperation } from '../services/calculators/regexCalculator.js';

/**
 * Helper function to send photo with proper error handling and multiple methods
 */
async function sendPhotoWithFallback(ctx, imagePath, options) {
  console.log(`📤 [PHOTO] Attempting to send photo: ${imagePath}`);

  try {
    // Method 1: Try Input.fromLocalFile (most reliable)
    try {
      const { Input } = await import('telegraf');
      const result = await ctx.replyWithPhoto(Input.fromLocalFile(imagePath), options);
      console.log(`✅ [PHOTO] Sent successfully with Input.fromLocalFile! Message ID: ${result.message_id}`);
      return result;
    } catch (inputError) {
      console.log(`❌ [PHOTO] Input.fromLocalFile failed:`, inputError.message);
      console.log(`📤 [PHOTO] Trying createReadStream...`);

      // Method 2: Try fs.createReadStream
      const photoStream = fs.createReadStream(imagePath);
      const result = await ctx.replyWithPhoto(photoStream, options);
      console.log(`✅ [PHOTO] Sent successfully with createReadStream! Message ID: ${result.message_id}`);
      return result;
    }
  } catch (streamError) {
    console.log(`❌ [PHOTO] Stream method failed:`, streamError.message);
    console.log(`📤 [PHOTO] Trying buffer method...`);

    // Method 3: Try buffer as fallback
    try {
      const buffer = await fs.readFile(imagePath);
      const result = await ctx.replyWithPhoto({ source: buffer, filename: 'automaton.png' }, options);
      console.log(`✅ [PHOTO] Sent successfully with buffer! Message ID: ${result.message_id}`);
      return result;
    } catch (bufferError) {
      console.error(`❌ [PHOTO] All methods failed:`, bufferError);
      throw bufferError;
    }
  }
}

// ===============================================
// FEATURE 1 IMPLEMENTATION: 🔧 DESIGN FA
// ===============================================

/**
 * Handle FA definition input - CORE IMPLEMENTATION OF FEATURE 1
 * This function processes user automaton definitions and provides:
 * - Structured input parsing and validation
 * - Support for both DFA and NFA creation  
 * - Automaton structure verification
 * - Type analysis with AI explanations
 * - Session state management for further operations
 */
export async function handleFADefinition(ctx, session, text) {
  try {
    // Step 1: Use calculator to process and validate the input
    const calculationResult = calculateDFADesign(text);

    if (!calculationResult.success) {
      ctx.reply(formatErrorMessage('Invalid Format', calculationResult.error), { parse_mode: 'Markdown' });
      return;
    }

    const { automaton, automatonType, validation, analysis, designIssues, recommendations } = calculationResult;

    // Store the validated automaton in user session for future operations
    updateUserSession(ctx.from.id, { currentFA: automaton, waitingFor: null });

    try {
      // Generate visual diagram of the automaton
      const imagePath = await generateAutomatonImage(automaton, `${automatonType} Diagram`, 'design');

      // Step 2: Get enhanced AI explanation with calculator results
      const enhancedPrompt = `Explain this automaton design with the following analysis:

      Type: ${automatonType}
      States: ${analysis.stateCount}
      Alphabet: ${analysis.alphabetSize} symbols
      Transitions: ${analysis.transitionCount}
      Completeness: ${analysis.completeness.isComplete ? 'Complete' : 'Incomplete'}

      ${designIssues.length > 0 ? `Issues found: ${designIssues.map(i => i.description).join(', ')}` : 'No issues found'}

      Provide a clear explanation of the automaton structure and any recommendations.`;

      const explanation = await explainAutomataStep(automaton, 'design', enhancedPrompt);

      // Send the visual diagram first
      await sendPhotoWithFallback(ctx, imagePath, {
        caption: `✅ **Automaton Loaded Successfully!**\n\n🔍 **Type:** ${automatonType}\n📊 **States:** ${analysis.stateCount}\n🔤 **Alphabet:** ${automaton.alphabet.join(', ')}\n⚡ **Completeness:** ${analysis.completeness.isComplete ? '✅ Complete' : '⚠️ Incomplete'}`,
        parse_mode: 'Markdown'
      });

      // Send detailed analysis with calculator insights
      let detailedAnalysis = `**📋 Detailed Analysis:**\n${explanation}`;

      if (designIssues.length > 0) {
        detailedAnalysis += `\n\n**⚠️ Design Issues:**\n`;
        designIssues.forEach(issue => {
          detailedAnalysis += `• ${issue.description}\n`;
        });
      }

      if (recommendations.length > 0) {
        detailedAnalysis += `\n\n**💡 Recommendations:**\n`;
        recommendations.forEach(rec => {
          detailedAnalysis += `• ${rec.description}\n`;
        });
      }

      ctx.reply(detailedAnalysis, { parse_mode: 'Markdown' });

      // Clean up the image file
      setTimeout(async () => {
        try {
          await fs.remove(imagePath);
          console.log(`🗑️ Cleaned up image: ${imagePath}`);
        } catch (error) {
          console.error('Error cleaning up image:', error);
        }
      }, 30000);

    } catch (imageError) {
      console.error('Error generating image:', imageError);

      // Fallback: send text result only with calculator insights
      const explanation = await explainAutomataStep(automaton, 'design');
      ctx.reply(`✅ **Automaton Loaded Successfully!**\n\n🔍 **Type:** ${automatonType}\n📊 **States:** ${analysis.stateCount}\n🔤 **Alphabet:** ${automaton.alphabet.join(', ')}\n\n**Analysis:**\n${explanation}`, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    ctx.reply(formatErrorMessage('Invalid automaton format', 'Please try again or ask for help'), { parse_mode: 'Markdown' });
  }
}

// ===============================================
// FEATURE 2 IMPLEMENTATION: 🧪 TEST INPUT
// ===============================================

/**
 * Handle test input string - CORE IMPLEMENTATION OF FEATURE 2
 * This function provides string simulation capabilities:
 * - String processing simulation on any defined automaton
 * - ACCEPTED/REJECTED results with detailed execution trace
 * - Works with both DFA and NFA through universal simulation
 * - Step-by-step state transition display
 * - AI-powered execution path explanations
 */
export async function handleTestInput(ctx, session, text) {
  // Ensure user has loaded an automaton first
  if (!session.currentFA) {
    ctx.reply('🚫 No automaton loaded. Please design one first.');
    return;
  }

  // Inform user that simulation is starting
  ctx.reply(`🧪 **Testing Input String: "${text}"** 📊 Generating simulation diagram...`, { parse_mode: 'Markdown' });

  // Step 1: Use calculator to process the input test
  const calculationResult = calculateInputTest(session.currentFA, text);

  if (!calculationResult.success) {
    ctx.reply(formatErrorMessage('Input Test Error', calculationResult.error), { parse_mode: 'Markdown' });
    return;
  }

  const { result, executionTrace, analysis, automatonType } = calculationResult;

  try {
    // Generate visual simulation diagram showing the path through the automaton
    const resultEmoji = result ? '✅' : '❌';
    const resultText = result ? 'ACCEPTED' : 'REJECTED';
    const imagePath = await generateSimulationImage(session.currentFA, text, result);

    // Step 2: Get enhanced AI explanation with calculator results
    const enhancedPrompt = `Explain this string simulation with the following detailed analysis:

    Input: "${text}"
    Result: ${resultText}
    Automaton Type: ${automatonType}
    Steps Executed: ${analysis.stepsExecuted}
    Path Taken: ${analysis.pathTaken.join(' → ')}

    Execution Trace:
    ${executionTrace.map(step => `Step ${step.step}: ${step.description}`).join('\n')}

    ${result ? `Acceptance Reason: ${analysis.acceptanceReason}` : `Rejection Reason: ${analysis.rejectionReason}`}

    Provide a clear step-by-step explanation of how the automaton processed this input.`;

    const explanation = await explainAutomataStep(session.currentFA, 'simulate', enhancedPrompt);

    // Send the visual simulation diagram
    await sendPhotoWithFallback(ctx, imagePath, {
      caption: `🧪 **String Simulation Result**\n\n**Input:** \`${text}\`\n**Result:** ${resultEmoji} ${resultText}\n**Steps:** ${analysis.stepsExecuted}\n**Type:** ${automatonType}\n\n📊 Visual simulation showing the path taken through the automaton\n🔴 Red highlights show the execution path`,
      parse_mode: 'Markdown'
    });

    // Send detailed step-by-step explanation with calculator insights
    let detailedExplanation = `**📋 Step-by-step Simulation:**\n${explanation}`;

    if (executionTrace.length <= 10) { // Show trace for short executions
      detailedExplanation += `\n\n**🔍 Execution Trace:**\n`;
      executionTrace.forEach(step => {
        detailedExplanation += `${step.step}. ${step.description}\n`;
      });
    }

    ctx.reply(detailedExplanation, { parse_mode: 'Markdown' });

    // Clean up the image file
    setTimeout(async () => {
      try {
        await fs.remove(imagePath);
        console.log(`🗑️ Cleaned up image: ${imagePath}`);
      } catch (error) {
        console.error('Error cleaning up image:', error);
      }
    }, 30000);

  } catch (imageError) {
    console.error('Error generating simulation image:', imageError);

    // Fallback: send text result only with calculator insights
    const explanation = await explainAutomataStep(session.currentFA, 'simulate', text);
    const testResult = formatTestResult(text, result, explanation);
    ctx.reply(testResult, { parse_mode: 'Markdown' });
  }

  // Clear waiting state
  updateUserSession(ctx.from.id, { waitingFor: null });
}

// ===============================================
// FEATURE 3 IMPLEMENTATION: 🔍 CHECK FA TYPE
// ===============================================

/**
 * Handle FA type check - CORE IMPLEMENTATION OF FEATURE 3
 * This function provides automaton type analysis:
 * - Automatic determination of DFA vs NFA classification
 * - Analysis of transition functions for determinism properties
 * - Clear explanations for the classification reasoning
 * - Educational insights into automaton characteristics
 */
export async function handleFATypeCheck(ctx, session, text) {
  try {
    // Step 1: Use calculator to analyze the automaton type
    const calculationResult = calculateFAType(text);

    if (!calculationResult.success) {
      ctx.reply(formatErrorMessage('Type Analysis Error', calculationResult.error), { parse_mode: 'Markdown' });
      return;
    }

    const { automaton, type, determinismAnalysis, nfaCharacteristics, reasoning } = calculationResult;

    try {
      // Generate visual diagram showing the automaton structure
      const imagePath = await generateAutomatonImage(automaton, `${type} Analysis`, 'type_check');

      // Step 2: Get enhanced AI explanation with calculator results
      const enhancedPrompt = `Explain why this automaton is classified as ${type} with the following analysis:

      Classification: ${type}
      Primary Reasons: ${reasoning.primaryReasons.join(', ')}

      Determinism Analysis:
      - Is Deterministic: ${determinismAnalysis.isDeterministic}
      - Completeness: ${determinismAnalysis.completeness.completenessPercentage}%
      - Violations: ${determinismAnalysis.violations.length} found

      ${type === 'NFA' ? `NFA Characteristics:
      - Multiple Transitions: ${nfaCharacteristics.hasMultipleTransitions}
      - Missing Transitions: ${nfaCharacteristics.hasMissingTransitions}
      - Epsilon Transitions: ${nfaCharacteristics.hasEpsilonTransitions}` : ''}

      Counter Examples: ${reasoning.counterExamples.join(', ') || 'None'}

      Provide a clear explanation of the classification with specific examples.`;

      const explanation = await explainAutomataStep(automaton, 'type', enhancedPrompt);

      // Send the visual diagram with type analysis
      await sendPhotoWithFallback(ctx, imagePath, {
        caption: `🔍 **Automaton Type Analysis**\n\n**Result:** ${type}\n**Completeness:** ${determinismAnalysis.completeness.completenessPercentage}%\n**Issues:** ${determinismAnalysis.violations.length} found\n\n📊 Visual diagram shows the automaton structure`,
        parse_mode: 'Markdown'
      });

      // Send detailed explanation with calculator insights
      let detailedExplanation = `**📋 Detailed Explanation:**\n${explanation}`;

      if (reasoning.counterExamples.length > 0) {
        detailedExplanation += `\n\n**🔍 Counter Examples:**\n`;
        reasoning.counterExamples.forEach(example => {
          detailedExplanation += `• ${example}\n`;
        });
      }

      ctx.reply(detailedExplanation, { parse_mode: 'Markdown' });

      // Clean up the image file
      setTimeout(async () => {
        try {
          await fs.remove(imagePath);
          console.log(`🗑️ Cleaned up image: ${imagePath}`);
        } catch (error) {
          console.error('Error cleaning up image:', error);
        }
      }, 30000);

    } catch (imageError) {
      console.error('Error generating image:', imageError);

      // Fallback: send text result only with calculator insights
      const explanation = await explainAutomataStep(automaton, 'type');
      ctx.reply(`🔍 **Automaton Type Analysis**\n\n**Result:** ${type}\n**Summary:** ${reasoning.summary}\n\n**Explanation:**\n${explanation}`, { parse_mode: 'Markdown' });
    }

    updateUserSession(ctx.from.id, { waitingFor: null });
  } catch (error) {
    ctx.reply(formatErrorMessage('Invalid automaton format'), { parse_mode: 'Markdown' });
  }
}

// ===============================================
// FEATURE 4 IMPLEMENTATION: 🔄 NFA→DFA CONVERSION  
// ===============================================

/**
 * Handle NFA to DFA conversion - CORE IMPLEMENTATION OF FEATURE 4
 * This function provides NFA to DFA conversion capabilities:
 * - Converts NFAs to equivalent DFAs using subset construction algorithm
 * - Shows the conversion process step-by-step with clear explanations
 * - Handles epsilon transitions and multiple transitions properly
 * - Provides AI-powered explanations of each conversion step
 * - Saves results and updates session for further operations
 */
export async function handleNFAConversion(ctx, session, text) {
  try {
    // Parse the input as NFA
    const nfa = parseDFAInput(text);
    
    // Check if it's already a DFA
    const faType = checkFAType(nfa);
    
    if (faType === 'DFA') {
      ctx.reply('ℹ️ **Already a DFA**\n\nThis automaton is already deterministic. No conversion needed!', { parse_mode: 'Markdown' });
      updateUserSession(ctx.from.id, { waitingFor: null });
      return;
    }
    
    // Inform user that conversion is starting
    ctx.reply('🔄 **Converting NFA to DFA...** 📊 Generating visual diagram...', { parse_mode: 'Markdown' });

    // Apply subset construction algorithm
    const dfa = nfaToDfa(nfa);

    try {
      // Generate comparison image showing NFA and DFA side by side
      const imagePath = await generateComparisonImage(nfa, dfa, 'NFA to DFA Conversion');

      // Get AI explanation of the conversion process
      const explanation = await explainAutomataStep(nfa, 'nfa2dfa');

      // Save the conversion operation to database
      await saveToDatabase(ctx.from.id, nfa, dfa, 'nfa_to_dfa');

      // Send the visual diagram first
      await sendPhotoWithFallback(ctx, imagePath, {
        caption: '🔄 **NFA to DFA Conversion Result**\n\n📊 Visual comparison showing the original NFA (left) and converted DFA (right)',
        parse_mode: 'Markdown'
      });

      // Send formatted result with detailed explanation
      await sendFormattedResult(ctx, dfa, 'Converted DFA Details', explanation);

      // Clean up the image file after sending
      setTimeout(async () => {
        try {
          await fs.remove(imagePath);
          console.log(`🗑️ Cleaned up image: ${imagePath}`);
        } catch (error) {
          console.error('Error cleaning up image:', error);
        }
      }, 30000); // Clean up after 30 seconds

    } catch (imageError) {
      console.error('Error generating image:', imageError);

      // Fallback: send text result only
      const explanation = await explainAutomataStep(nfa, 'nfa2dfa');
      await saveToDatabase(ctx.from.id, nfa, dfa, 'nfa_to_dfa');
      await sendFormattedResult(ctx, dfa, 'Converted DFA', explanation);
    }

    // Update session with the new DFA for potential further operations
    updateUserSession(ctx.from.id, { currentFA: dfa, waitingFor: null });
  } catch (error) {
    ctx.reply(formatErrorMessage('Invalid NFA format'), { parse_mode: 'Markdown' });
  }
}

// ===============================================
// FEATURE 5 IMPLEMENTATION: ⚡ MINIMIZE DFA
// ===============================================

/**
 * Handle DFA minimization - CORE IMPLEMENTATION OF FEATURE 5
 * This function provides DFA minimization capabilities:
 * - Minimizes DFAs using partition refinement algorithm
 * - Automatically converts NFAs to DFAs before minimization if needed
 * - Shows which states can be merged and explains the reasoning
 * - Identifies already minimal DFAs and explains why
 * - Provides comprehensive state equivalence analysis
 */
export async function handleDFAMinimization(ctx, session, text) {
  try {
    // Parse the input automaton
    const dfa = parseDFAInput(text);
    
    // Check the automaton type
    const faType = checkFAType(dfa);
    
    if (faType === 'NFA') {
      // Handle NFA input - convert first, then minimize
      ctx.reply('🔄 **NFA Detected - Converting First...** 📊 Generating visual diagram...', { parse_mode: 'Markdown' });

      // Step 1: Convert NFA to DFA using subset construction
      const convertedDFA = nfaToDfa(dfa);

      // Step 2: Apply minimization to the converted DFA
      const minimized = minimizeDFA(convertedDFA);

      try {
        // Generate comparison image showing original NFA and final minimized DFA
        const imagePath = await generateComparisonImage(dfa, minimized, 'NFA to Minimized DFA');

        // Step 3: Get AI explanation for the combined process
        const explanation = await explainAutomataStep(dfa, 'minimize');

        // Step 4: Save the combined operation to database
        await saveToDatabase(ctx.from.id, dfa, minimized, 'nfa_to_dfa_minimize');

        // Send the visual diagram first
        await sendPhotoWithFallback(ctx, imagePath, {
          caption: '⚡ **NFA to Minimized DFA Result**\n\n📊 Visual comparison: Original NFA (left) → Final Minimized DFA (right)',
          parse_mode: 'Markdown'
        });

        // Step 5: Send result with explanation of both conversion and minimization
        await sendFormattedResult(ctx, minimized, 'Converted and Minimized DFA Details', explanation);

        // Clean up the image file
        setTimeout(async () => {
          try {
            await fs.remove(imagePath);
            console.log(`🗑️ Cleaned up image: ${imagePath}`);
          } catch (error) {
            console.error('Error cleaning up image:', error);
          }
        }, 30000);

      } catch (imageError) {
        console.error('Error generating image:', imageError);

        // Fallback: send text result only
        const explanation = await explainAutomataStep(dfa, 'minimize');
        await saveToDatabase(ctx.from.id, dfa, minimized, 'nfa_to_dfa_minimize');
        await sendFormattedResult(ctx, minimized, 'Converted and Minimized DFA', explanation);
      }
    } else {
      // Handle DFA input - apply minimization directly
      ctx.reply('⚡ **Minimizing DFA...** 📊 Generating visual diagram...', { parse_mode: 'Markdown' });

      // Step 1: Apply partition refinement algorithm
      const minimized = minimizeDFA(dfa);

      try {
        // Generate comparison image showing original and minimized DFA
        const imagePath = await generateComparisonImage(dfa, minimized, 'DFA Minimization');

        // Step 2: Get AI explanation of the minimization process
        const explanation = await explainAutomataStep(dfa, 'minimize');

        // Step 3: Save the minimization operation to database
        await saveToDatabase(ctx.from.id, dfa, minimized, 'minimize');

        // Send the visual diagram first
        await sendPhotoWithFallback(ctx, imagePath, {
          caption: '⚡ **DFA Minimization Result**\n\n📊 Visual comparison: Original DFA (left) → Minimized DFA (right)',
          parse_mode: 'Markdown'
        });

        // Step 4: Send formatted result with detailed explanation
        await sendFormattedResult(ctx, minimized, 'Minimized DFA Details', explanation);

        // Clean up the image file
        setTimeout(async () => {
          try {
            await fs.remove(imagePath);
            console.log(`🗑️ Cleaned up image: ${imagePath}`);
          } catch (error) {
            console.error('Error cleaning up image:', error);
          }
        }, 30000);

      } catch (imageError) {
        console.error('Error generating image:', imageError);

        // Fallback: send text result only
        const explanation = await explainAutomataStep(dfa, 'minimize');
        await saveToDatabase(ctx.from.id, dfa, minimized, 'minimize');
        await sendFormattedResult(ctx, minimized, 'Minimized DFA', explanation);
      }
    }
    
    // Clear the waiting state
    updateUserSession(ctx.from.id, { waitingFor: null });
  } catch (error) {
    ctx.reply(formatErrorMessage('Invalid DFA format'), { parse_mode: 'Markdown' });
  }
}

// ===============================================
// SESSION OPERATION DISPATCHER
// ===============================================

/**
 * Handle session operation - MAIN DISPATCHER FOR ALL FEATURES
 * This function routes user input to the appropriate feature handler based on
 * the current session state, enabling multi-step workflows for all six main features
 */
export async function handleSessionOperation(ctx, session, text) {
  // Route to appropriate handler based on what the session is waiting for
  switch (session.waitingFor) {
    case 'fa_definition':        // Feature 1: Design FA
      await handleFADefinition(ctx, session, text);
      break;
    case 'test_input':          // Feature 2: Test Input
      await handleTestInput(ctx, session, text);
      break;
    case 'fa_type_check':       // Feature 3: Check FA Type
      await handleFATypeCheck(ctx, session, text);
      break;
    case 'nfa_conversion':      // Feature 4: NFA→DFA
      await handleNFAConversion(ctx, session, text);
      break;
    case 'dfa_minimization':    // Feature 5: Minimize DFA
      await handleDFAMinimization(ctx, session, text);
      break;
    default:
      // Unknown operation - reset session and provide guidance
      updateUserSession(ctx.from.id, { waitingFor: null });
      ctx.reply('❓ I\'m not sure what you\'re trying to do. Please use the menu buttons.');
  }
}
