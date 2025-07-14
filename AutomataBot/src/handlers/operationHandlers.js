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
    // Parse the user input into automaton structure
    const fa = parseDFAInput(text);
    
    // Validate that all required components are present
    if (!fa.states.length || !fa.alphabet.length || !fa.transitions.length || !fa.startState || !fa.finalStates.length) {
      ctx.reply(formatErrorMessage('Invalid Format', 'Please check your format. Need help? Ask: "Show me an example automaton"'), { parse_mode: 'Markdown' });
      return;
    }
    
    // Store the validated automaton in user session for future operations
    updateUserSession(ctx.from.id, { currentFA: fa, waitingFor: null });

    // Analyze the automaton type (DFA or NFA)
    const faType = checkFAType(fa);

    try {
      // Generate visual diagram of the automaton
      const imagePath = await generateAutomatonImage(fa, `${faType} Diagram`, 'design');

      // Get AI explanation for the type classification
      const explanation = await explainAutomataStep(fa, 'type');

      // Send the visual diagram first
      await sendPhotoWithFallback(ctx, imagePath, {
        caption: `✅ **Automaton Loaded Successfully!**\n\n🔍 **Type:** ${faType}\n📊 **States:** ${fa.states.length}\n🔤 **Alphabet:** ${fa.alphabet.join(', ')}`,
        parse_mode: 'Markdown'
      });

      // Send detailed analysis
      ctx.reply(`**📋 Detailed Analysis:**\n${explanation}`, { parse_mode: 'Markdown' });

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
      const explanation = await explainAutomataStep(fa, 'type');
      ctx.reply(`✅ **Automaton Loaded Successfully!**\n\n🔍 **Type:** ${faType}\n📊 **States:** ${fa.states.length}\n🔤 **Alphabet:** ${fa.alphabet.join(', ')}\n\n**Analysis:**\n${explanation}`, { parse_mode: 'Markdown' });
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

  // Simulate the input string on the loaded automaton
  const result = simulateFA(session.currentFA, text);

  try {
    // Generate visual simulation diagram showing the path through the automaton
    const resultEmoji = result ? '✅' : '❌';
    const resultText = result ? 'ACCEPTED' : 'REJECTED';
    const imagePath = await generateSimulationImage(session.currentFA, text, result);

    // Get AI explanation of the simulation process
    const explanation = await explainAutomataStep(session.currentFA, 'simulate', text);

    // Send the visual simulation diagram
    await sendPhotoWithFallback(ctx, imagePath, {
      caption: `🧪 **String Simulation Result**\n\n**Input:** \`${text}\`\n**Result:** ${resultEmoji} ${resultText}\n\n📊 Visual simulation showing the path taken through the automaton\n🔴 Red highlights show the execution path`,
      parse_mode: 'Markdown'
    });

    // Send detailed step-by-step explanation
    ctx.reply(`**📋 Step-by-step Simulation:**\n${explanation}`, { parse_mode: 'Markdown' });

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

    // Fallback: send text result only
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
    // Parse the input automaton
    const fa = parseDFAInput(text);

    // Analyze the automaton type using determinism criteria
    const faType = checkFAType(fa);

    try {
      // Generate visual diagram showing the automaton structure
      const imagePath = await generateAutomatonImage(fa, `${faType} Analysis`, 'type_check');

      // Get detailed AI explanation of why it's classified as DFA/NFA
      const explanation = await explainAutomataStep(fa, 'type');

      // Send the visual diagram with type analysis
      await sendPhotoWithFallback(ctx, imagePath, {
        caption: `🔍 **Automaton Type Analysis**\n\n**Result:** ${faType}\n📊 Visual diagram shows the automaton structure`,
        parse_mode: 'Markdown'
      });

      // Send detailed explanation
      ctx.reply(`**📋 Detailed Explanation:**\n${explanation}`, { parse_mode: 'Markdown' });

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
      const explanation = await explainAutomataStep(fa, 'type');
      ctx.reply(`🔍 **Automaton Type Analysis**\n\n**Result:** ${faType}\n\n**Explanation:**\n${explanation}`, { parse_mode: 'Markdown' });
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
