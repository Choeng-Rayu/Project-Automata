// Operation handlers for automata processing
import { parseDFAInput, checkFAType, simulateFA, nfaToDfa } from '../utils/automataUtils.js';
import { minimizeDFA } from '../algorithms/dfaMinimization.js';
import { explainAutomataStep } from '../services/aiService.js';
import { saveToDatabase } from '../config/database.js';
import { sendFormattedResult, formatTestResult, formatErrorMessage } from '../utils/messageFormatter.js';
import { updateUserSession } from '../utils/sessionManager.js';

/**
 * Handle FA definition input
 */
export async function handleFADefinition(ctx, session, text) {
  try {
    const fa = parseDFAInput(text);
    if (!fa.states.length || !fa.alphabet.length || !fa.transitions.length || !fa.startState || !fa.finalStates.length) {
      ctx.reply(formatErrorMessage('Invalid Format', 'Please check your format. Need help? Ask: "Show me an example automaton"'), { parse_mode: 'Markdown' });
      return;
    }
    
    updateUserSession(ctx.from.id, { currentFA: fa, waitingFor: null });
    
    const faType = checkFAType(fa);
    const explanation = await explainAutomataStep(fa, 'type');
    
    ctx.reply(`✅ **Automaton Loaded Successfully!**\n\n🔍 **Type:** ${faType}\n📊 **States:** ${fa.states.length}\n🔤 **Alphabet:** ${fa.alphabet.join(', ')}\n\n**Analysis:**\n${explanation}`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply(formatErrorMessage('Invalid automaton format', 'Please try again or ask for help'), { parse_mode: 'Markdown' });
  }
}

/**
 * Handle test input string
 */
export async function handleTestInput(ctx, session, text) {
  if (!session.currentFA) {
    ctx.reply('🚫 No automaton loaded. Please design one first.');
    return;
  }
  
  const result = simulateFA(session.currentFA, text);
  const explanation = await explainAutomataStep(session.currentFA, 'simulate', text);
  
  const testResult = formatTestResult(text, result, explanation);
  ctx.reply(testResult, { parse_mode: 'Markdown' });
  
  updateUserSession(ctx.from.id, { waitingFor: null });
}

/**
 * Handle FA type check
 */
export async function handleFATypeCheck(ctx, session, text) {
  try {
    const fa = parseDFAInput(text);
    const faType = checkFAType(fa);
    const explanation = await explainAutomataStep(fa, 'type');
    
    ctx.reply(`🔍 **Automaton Type Analysis**\n\n**Result:** ${faType}\n\n**Explanation:**\n${explanation}`, { parse_mode: 'Markdown' });
    updateUserSession(ctx.from.id, { waitingFor: null });
  } catch (error) {
    ctx.reply(formatErrorMessage('Invalid automaton format'), { parse_mode: 'Markdown' });
  }
}

/**
 * Handle NFA to DFA conversion
 */
export async function handleNFAConversion(ctx, session, text) {
  try {
    const nfa = parseDFAInput(text);
    const faType = checkFAType(nfa);
    
    if (faType === 'DFA') {
      ctx.reply('ℹ️ **Already a DFA**\n\nThis automaton is already deterministic. No conversion needed!', { parse_mode: 'Markdown' });
      updateUserSession(ctx.from.id, { waitingFor: null });
      return;
    }
    
    ctx.reply('🔄 **Converting NFA to DFA...**', { parse_mode: 'Markdown' });
    const dfa = nfaToDfa(nfa);
    const explanation = await explainAutomataStep(nfa, 'nfa2dfa');
    
    await saveToDatabase(ctx.from.id, nfa, dfa, 'nfa_to_dfa');
    await sendFormattedResult(ctx, dfa, 'Converted DFA', explanation);
    
    updateUserSession(ctx.from.id, { currentFA: dfa, waitingFor: null });
  } catch (error) {
    ctx.reply(formatErrorMessage('Invalid NFA format'), { parse_mode: 'Markdown' });
  }
}

/**
 * Handle DFA minimization
 */
export async function handleDFAMinimization(ctx, session, text) {
  try {
    const dfa = parseDFAInput(text);
    const faType = checkFAType(dfa);
    
    if (faType === 'NFA') {
      ctx.reply('🔄 **NFA Detected - Converting First...**', { parse_mode: 'Markdown' });
      const convertedDFA = nfaToDfa(dfa);
      const minimized = minimizeDFA(convertedDFA);
      const explanation = await explainAutomataStep(dfa, 'minimize');
      
      await saveToDatabase(ctx.from.id, dfa, minimized, 'nfa_to_dfa_minimize');
      await sendFormattedResult(ctx, minimized, 'Converted and Minimized DFA', explanation);
    } else {
      ctx.reply('⚡ **Minimizing DFA...**', { parse_mode: 'Markdown' });
      const minimized = minimizeDFA(dfa);
      const explanation = await explainAutomataStep(dfa, 'minimize');
      
      await saveToDatabase(ctx.from.id, dfa, minimized, 'minimize');
      await sendFormattedResult(ctx, minimized, 'Minimized DFA', explanation);
    }
    
    updateUserSession(ctx.from.id, { waitingFor: null });
  } catch (error) {
    ctx.reply(formatErrorMessage('Invalid DFA format'), { parse_mode: 'Markdown' });
  }
}

/**
 * Handle session-based operations
 */
export async function handleSessionOperation(ctx, session, text) {
  switch (session.waitingFor) {
    case 'fa_definition':
      await handleFADefinition(ctx, session, text);
      break;
    case 'test_input':
      await handleTestInput(ctx, session, text);
      break;
    case 'fa_type_check':
      await handleFATypeCheck(ctx, session, text);
      break;
    case 'nfa_conversion':
      await handleNFAConversion(ctx, session, text);
      break;
    case 'dfa_minimization':
      await handleDFAMinimization(ctx, session, text);
      break;
    default:
      updateUserSession(ctx.from.id, { waitingFor: null });
      ctx.reply('❓ I\'m not sure what you\'re trying to do. Please use the menu buttons.');
  }
}
