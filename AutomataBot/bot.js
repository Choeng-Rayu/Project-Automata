// ===============================================
// ENHANCED TELEGRAM BOT FOR FINITE AUTOMATA
// ===============================================
// This bot provides comprehensive automata theory support with AI integration
// Features include: DFA/NFA operations, conversions, minimization, and AI explanations
//
// 🎯 COMPLETE FEATURE LIST:
// ===============================================
//
// 🔧 CORE AUTOMATA OPERATIONS:
//    • Design FA - Create and analyze finite automata with structured input format
//    • Test Input - Simulate string processing on automata (accepts/rejects)
//    • Check FA Type - Automatically determine if automaton is DFA or NFA
//    • NFA→DFA Conversion - Convert using subset construction algorithm
//    • DFA Minimization - Optimize DFAs using partition refinement algorithm
//
// 🧠 AI-POWERED FEATURES:
//    • Natural Language Questions - Ask questions in plain English
//    • AI Explanations - Step-by-step algorithmic explanations
//    • Educational Content - Learning tutorials and concept clarification
//    • Practice Problems - AI-generated exercises with solutions
//
// 💬 COMMAND SYSTEM:
//    • /start - Main menu and welcome message
//    • /explain [topic] - Get detailed AI explanations
//    • /example [type] - Request specific automata examples
//    • /design [requirement] - AI-assisted automaton design
//    • /practice - Generate practice problems
//    • /examples - Show all input format examples
//
// 🎨 USER INTERFACE:
//    • Menu-based button navigation
//    • Session-aware multi-step operations
//    • Context-sensitive help and examples
//    • Mobile-friendly Telegram interface
//
// 💾 DATA MANAGEMENT:
//    • MongoDB history tracking
//    • User session management
//    • Operation result storage
//    • Progress tracking
//
// 🚀 TECHNICAL FEATURES:
//    • Modular architecture with clean separation
//    • Error handling and validation
//    • Environment-based configuration
//    • Graceful shutdown handling
//
// ===============================================

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables (BOT_TOKEN, MONGODB_URI, DEEPSEEK_API_KEY)
import { Telegraf } from 'telegraf'; // Telegram Bot Framework

// ===============================================
// CORE SERVICES AND UTILITIES IMPORTS
// ===============================================

// Database and session management
import { connectDB } from './src/config/database.js'; // MongoDB connection handler
import { getUserSession } from './src/utils/sessionManager.js'; // User session state management

// Automata algorithms and utilities
import { parseDFAInput, checkFAType, simulateFA, nfaToDfa } from './src/utils/automataUtils.js';
// - parseDFAInput: Parse user input into automaton structure
// - checkFAType: Determine if automaton is DFA or NFA
// - simulateFA: Simulate string processing on automaton
// - nfaToDfa: Convert NFA to DFA using subset construction

import { minimizeDFA } from './src/algorithms/dfaMinimization.js'; // DFA minimization algorithm
import { explainAutomataStep } from './src/services/aiService.js'; // AI-powered explanations
import { saveToDatabase } from './src/config/database.js'; // Database save operations
import { sendFormattedResult } from './src/utils/messageFormatter.js'; // Result formatting

// ===============================================
// COMMAND AND MENU HANDLERS IMPORTS
// ===============================================

// Command handlers for slash commands (/start, /explain, /example, etc.)
import {
  handleStart,              // /start command - shows main menu
  handleExplainCommand,     // /explain [topic] - AI explanations
  handleExampleCommand,     // /example [type] - show examples
  handleDesignCommand,      // /design [requirement] - AI-assisted design
  handlePracticeCommand,    // /practice - generate practice problems
  handleLearningTopic,      // Handle learning topic selection
  handleNaturalLanguageQuestion, // Process natural language AI questions
  handleExamplesCommand     // /examples - show all format examples
} from './src/handlers/commandHandlers.js';

// Menu button handlers for inline keyboard buttons
import {
  handleDesignFA,          // 🔧 Design FA - create automata
  handleTestInput,         // 🧪 Test Input - test strings on automata
  handleCheckFAType,       // 🔍 Check FA Type - determine DFA/NFA
  handleNFAToDFA,          // 🔄 NFA→DFA - convert NFA to DFA
  handleMinimizeDFA,       // ⚡ Minimize DFA - minimize DFA states
  handleAIHelp,            // 🧠 AI Help - AI assistant
  handleLearnMode,         // 📚 Learn Mode - interactive tutorials
  handleMyHistory,         // 📊 My History - user operation history
  handleHelp,              // ❓ Help - format help and guidance
  handleBackToMainMenu     // 🔙 Back to Main Menu - navigation
} from './src/handlers/menuHandlers.js';

// Session operation handlers for multi-step processes
import { handleSessionOperation } from './src/handlers/operationHandlers.js';

// ===============================================
// BOT INITIALIZATION AND SETUP
// ===============================================

const BOT_TOKEN = process.env.BOT_TOKEN; // Telegram bot token from environment
const bot = new Telegraf(BOT_TOKEN); // Create Telegraf bot instance

// ===============================================
// COMMAND HANDLERS REGISTRATION
// ===============================================
// Register handlers for slash commands that users can type

bot.start(handleStart); // /start - Welcome message and main menu

// AI and educational commands
bot.command('explain', handleExplainCommand);    // /explain [topic] - Get AI explanations
bot.command('example', handleExampleCommand);    // /example [type] - Request specific examples  
bot.command('examples', handleExamplesCommand);  // /examples - Show all format examples
bot.command('design', handleDesignCommand);      // /design [requirement] - AI-assisted design
bot.command('practice', handlePracticeCommand);  // /practice - Generate practice problems

// ===============================================
// MENU BUTTON HANDLERS REGISTRATION
// ===============================================
// Register handlers for inline keyboard buttons in the main menu

// Core automata operations
bot.hears('🔧 Design FA', handleDesignFA);       // Create and analyze finite automata
bot.hears('🧪 Test Input', handleTestInput);     // Test input strings on automata
bot.hears('🔍 Check FA Type', handleCheckFAType); // Determine if automaton is DFA or NFA
bot.hears('🔄 NFA→DFA', handleNFAToDFA);         // Convert NFA to DFA using subset construction
bot.hears('⚡ Minimize DFA', handleMinimizeDFA); // Minimize DFA using partition refinement

// AI and learning features
bot.hears('🧠 AI Help', handleAIHelp);           // Access AI assistant for questions
bot.hears('📚 Learn Mode', handleLearnMode);     // Interactive tutorials and learning

// User management and navigation
bot.hears('📊 My History', handleMyHistory);     // View saved operations and history
bot.hears('❓ Help', handleHelp);                // Format help and guidance
bot.hears('🔙 Back to Main Menu', handleBackToMainMenu); // Return to main menu

// ===============================================
// LEARNING TOPIC HANDLERS
// ===============================================
// Handle learning topic selections (buttons starting with 📖)
bot.hears(/^📖/, (ctx) => handleLearningTopic(ctx, ctx.message.text));


// ===============================================
// MAIN TEXT MESSAGE HANDLER
// ===============================================
// This is the core message processing logic that handles all text input

bot.on('text', async (ctx) => {
  const session = getUserSession(ctx.from.id); // Get or create user session
  const text = ctx.message.text; // Extract message text
  
  // ===============================================
  // NATURAL LANGUAGE AI QUESTION DETECTION
  // ===============================================
  // Detect if user is asking a question or needs AI help
  // Keywords that trigger AI assistance
  if (
        text.includes('?') ||                          // Questions with question marks
        text.toLowerCase().includes('explain') ||      // Explanation requests
        text.toLowerCase().includes('how') ||          // How-to questions
        text.toLowerCase().includes('what') ||         // What-is questions
        text.toLowerCase().includes('help me') ||      // Direct help requests
        text.toLowerCase().includes('h')||             // Short help
        text.toLowerCase().includes('bro') ||          // Informal help requests
        text.toLowerCase().includes('rayu')||          // Bot name mentions
        text.toLowerCase().includes('who')             // Who questions
      ){
    // Route to AI question handler for natural language processing
    await handleNaturalLanguageQuestion(ctx, text);
    return;
  }
  
  // ===============================================
  // SESSION-BASED OPERATION HANDLING
  // ===============================================
  // Handle multi-step operations where bot is waiting for specific input
  // (e.g., waiting for automaton definition, test string, etc.)
  if (session.waitingFor) {
    await handleSessionOperation(ctx, session, text);
    return;
  }
  
  // ===============================================
  // DEFAULT AUTOMATON PROCESSING
  // ===============================================
  // If no specific operation is active, try to parse input as automaton definition
  // This allows direct automaton input for quick minimization
  try {
    const fa = parseDFAInput(text); // Parse input as finite automaton
    
    // Validate automaton structure
    if (!fa.states.length || !fa.alphabet.length || !fa.transitions.length || !fa.startState || !fa.finalStates.length) {
      ctx.reply('🚫 **Invalid Format**\n\nPlease use the correct format or click "❓ Help" for guidance.\n\nOr ask me: "How do I format an automaton?"', { parse_mode: 'Markdown' });
      return;
    }
    
    // ===============================================
    // AUTOMATON PROCESSING PIPELINE
    // ===============================================
    
    // Store the parsed automaton in user session
    session.currentFA = fa;
    session.lastOperation = 'minimize';
    
    // Check automaton type (DFA or NFA)
    const faType = checkFAType(fa);
    
    if (faType === 'NFA') {
      // ===============================================
      // NFA PROCESSING BRANCH
      // ===============================================
      // If input is NFA, convert to DFA first, then minimize
      
      ctx.reply('🔄 **NFA Detected**\n\nI\'ll convert this to DFA first, then minimize it.\n\n⏳ Processing...', { parse_mode: 'Markdown' });
      
      // Step 1: Convert NFA to DFA using subset construction
      const dfa = nfaToDfa(fa);
      session.currentFA = dfa; // Update session with converted DFA
      
      // Step 2: Minimize the converted DFA
      const minimized = minimizeDFA(dfa);
      
      // Step 3: Get AI explanation for the NFA→DFA conversion process
      const explanation = await explainAutomataStep(fa, 'nfa2dfa');
      
      // Step 4: Save operation to database for history tracking
      await saveToDatabase(ctx.from.id, fa, minimized, 'nfa_to_dfa_minimize');
      
      // Step 5: Send formatted result with AI explanation
      await sendFormattedResult(ctx, minimized, 'Converted and Minimized DFA', explanation);
      
    } else {
      // ===============================================
      // DFA PROCESSING BRANCH
      // ===============================================
      // If input is already a DFA, proceed directly to minimization
      
      ctx.reply('⚡ **Minimizing DFA**\n\n⏳ Processing...', { parse_mode: 'Markdown' });
      
      // Step 1: Apply DFA minimization algorithm (partition refinement)
      const minimized = minimizeDFA(fa);
      
      // Step 2: Get AI explanation for the minimization process
      const explanation = await explainAutomataStep(fa, 'minimize');
      
      // Step 3: Save operation to database for history tracking
      await saveToDatabase(ctx.from.id, fa, minimized, 'minimize');
      
      // Step 4: Send formatted result with AI explanation
      await sendFormattedResult(ctx, minimized, 'Minimized DFA', explanation);
    }
    
  } catch (e) {
    // ===============================================
    // ERROR HANDLING FOR INVALID INPUT
    // ===============================================
    // Handle parsing errors and provide helpful guidance
    ctx.reply('❌ **Error Processing Input**\n\nI couldn\'t understand your input. Try:\n• Using the menu buttons\n• Asking a question\n• Checking the format with "❓ Help"', { parse_mode: 'Markdown' });
  }
});

// ===============================================
// GLOBAL ERROR HANDLING
// ===============================================
// Catch any unhandled errors in bot operations
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ **Oops!** Something went wrong. Please try again or contact support.', { parse_mode: 'Markdown' });
});

// ===============================================
// GRACEFUL SHUTDOWN HANDLERS
// ===============================================
// Handle process termination signals gracefully
process.once('SIGINT', () => bot.stop('SIGINT'));   // Handle Ctrl+C
process.once('SIGTERM', () => bot.stop('SIGTERM')); // Handle termination signal

// ===============================================
// DATABASE INITIALIZATION
// ===============================================
// Initialize MongoDB connection on startup
connectDB().then(() => {
  console.log('✅ Database connected');
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
});

console.log('🤖 Enhanced Automata Bot is starting...');

// ===============================================
// BOT STARTUP AND LAUNCH
// ===============================================
// Start the bot and display startup information
bot.launch().then(() => {
  console.log('✅ Bot is running successfully!');
  console.log('📁 Modular structure implemented:');
  console.log('  • src/config/ - Database configuration');
  console.log('  • src/services/ - AI and external services');
  console.log('  • src/algorithms/ - Automata algorithms');
  console.log('  • src/utils/ - Utility functions');
  console.log('  • src/handlers/ - Command and menu handlers');
  console.log('');
  console.log('🎯 Available Features:');
  console.log('  • 🔧 Design FA - Create and analyze finite automata');
  console.log('  • 🧪 Test Input - Simulate string processing');
  console.log('  • 🔍 Check FA Type - Determine DFA/NFA classification');
  console.log('  • 🔄 NFA→DFA - Convert using subset construction');
  console.log('  • ⚡ Minimize DFA - Optimize using partition refinement');
  console.log('  • 🧠 AI Help - Natural language explanations');
  console.log('  • 📚 Learn Mode - Interactive tutorials');
  console.log('  • 📊 History - Operation tracking and retrieval');
}).catch((error) => {
  console.error('❌ Failed to start bot:', error);
});
