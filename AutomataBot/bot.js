// Enhanced Telegram Bot for Finite Automata with AI Integration
import dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';

// Import services and utilities
import { connectDB } from './src/config/database.js';
import { getUserSession } from './src/utils/sessionManager.js';
import { parseDFAInput, checkFAType, simulateFA, nfaToDfa } from './src/utils/automataUtils.js';
import { minimizeDFA } from './src/algorithms/dfaMinimization.js';
import { explainAutomataStep } from './src/services/aiService.js';
import { saveToDatabase } from './src/config/database.js';
import { sendFormattedResult } from './src/utils/messageFormatter.js';

// Import handlers
import {
  handleStart,
  handleExplainCommand,
  handleExampleCommand,
  handleDesignCommand,
  handlePracticeCommand,
  handleLearningTopic,
  handleNaturalLanguageQuestion,
  handleExamplesCommand
} from './src/handlers/commandHandlers.js';

import {
  handleDesignFA,
  handleTestInput,
  handleCheckFAType,
  handleNFAToDFA,
  handleMinimizeDFA,
  handleAIHelp,
  handleLearnMode,
  handleMyHistory,
  handleHelp,
  handleBackToMainMenu
} from './src/handlers/menuHandlers.js';

import { handleSessionOperation } from './src/handlers/operationHandlers.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Bot command handlers
bot.start(handleStart);

// Command handlers
bot.command('explain', handleExplainCommand);
bot.command('example', handleExampleCommand);
bot.command('examples', handleExamplesCommand);
bot.command('design', handleDesignCommand);
bot.command('practice', handlePracticeCommand);

// Menu button handlers
bot.hears('🔧 Design FA', handleDesignFA);
bot.hears('🧪 Test Input', handleTestInput);
bot.hears('🔍 Check FA Type', handleCheckFAType);
bot.hears('🔄 NFA→DFA', handleNFAToDFA);
bot.hears('⚡ Minimize DFA', handleMinimizeDFA);
bot.hears('🧠 AI Help', handleAIHelp);
bot.hears('📚 Learn Mode', handleLearnMode);
bot.hears('📊 My History', handleMyHistory);
bot.hears('❓ Help', handleHelp);
bot.hears('🔙 Back to Main Menu', handleBackToMainMenu);

// Learning topic handlers
bot.hears(/^📖/, (ctx) => handleLearningTopic(ctx, ctx.message.text));


// Main text handler
bot.on('text', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  const text = ctx.message.text;
  
  // Handle natural language questions (AI integration)
  if (text.includes('?') || text.toLowerCase().includes('explain') || 
      text.toLowerCase().includes('how') || text.toLowerCase().includes('what') ||
      text.toLowerCase().includes('help me')) {
    await handleNaturalLanguageQuestion(ctx, text);
    return;
  }
  
  // Handle session-based operations
  if (session.waitingFor) {
    await handleSessionOperation(ctx, session, text);
    return;
  }
  
  // Default: try to parse as FA definition for minimization
  try {
    const fa = parseDFAInput(text);
    if (!fa.states.length || !fa.alphabet.length || !fa.transitions.length || !fa.startState || !fa.finalStates.length) {
      ctx.reply('🚫 **Invalid Format**\n\nPlease use the correct format or click "❓ Help" for guidance.\n\nOr ask me: "How do I format an automaton?"', { parse_mode: 'Markdown' });
      return;
    }
    
    // Store the FA in session
    session.currentFA = fa;
    session.lastOperation = 'minimize';
    
    // Check if it's a DFA first
    const faType = checkFAType(fa);
    if (faType === 'NFA') {
      ctx.reply('🔄 **NFA Detected**\n\nI\'ll convert this to DFA first, then minimize it.\n\n⏳ Processing...', { parse_mode: 'Markdown' });
      const dfa = nfaToDfa(fa);
      session.currentFA = dfa;
      const minimized = minimizeDFA(dfa);
      
      // Get AI explanation
      const explanation = await explainAutomataStep(fa, 'nfa2dfa');
      
      await saveToDatabase(ctx.from.id, fa, minimized, 'nfa_to_dfa_minimize');
      await sendFormattedResult(ctx, minimized, 'Converted and Minimized DFA', explanation);
    } else {
      ctx.reply('⚡ **Minimizing DFA**\n\n⏳ Processing...', { parse_mode: 'Markdown' });
      const minimized = minimizeDFA(fa);
      
      // Get AI explanation
      const explanation = await explainAutomataStep(fa, 'minimize');
      
      await saveToDatabase(ctx.from.id, fa, minimized, 'minimize');
      await sendFormattedResult(ctx, minimized, 'Minimized DFA', explanation);
    }
  } catch (e) {
    ctx.reply('❌ **Error Processing Input**\n\nI couldn\'t understand your input. Try:\n• Using the menu buttons\n• Asking a question\n• Checking the format with "❓ Help"', { parse_mode: 'Markdown' });
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ **Oops!** Something went wrong. Please try again or contact support.', { parse_mode: 'Markdown' });
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Initialize database connection
connectDB().then(() => {
  console.log('✅ Database connected');
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
});

console.log('🤖 Enhanced Automata Bot is starting...');

// Start the bot
bot.launch().then(() => {
  console.log('✅ Bot is running successfully!');
  console.log('📁 Modular structure implemented:');
  console.log('  • src/config/ - Database configuration');
  console.log('  • src/services/ - AI and external services');
  console.log('  • src/algorithms/ - Automata algorithms');
  console.log('  • src/utils/ - Utility functions');
  console.log('  • src/handlers/ - Command and menu handlers');
}).catch((error) => {
  console.error('❌ Failed to start bot:', error);
});
