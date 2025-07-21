// ===============================================
// MENU BUTTON HANDLERS FOR AUTOMATA BOT
// ===============================================
// This file implements the six main features through menu button handlers:
// 1. 🔧 Design FA - Create and analyze finite automata
// 2. 🧪 Test Input - Simulate string processing on automata  
// 3. 🔍 Check FA Type - Determine if automaton is DFA or NFA
// 4. 🔄 NFA→DFA - Convert NFA to DFA using subset construction
// 5. ⚡ Minimize DFA - Minimize DFA using partition refinement
// 6. 🧠 AI Help - AI-powered explanations and assistance

import { getUserSession, updateUserSession, getUserHistory, getConversationSummary } from '../utils/sessionManager.js';
import { checkFAType } from '../utils/automataUtils.js';

// ===============================================
// FEATURE 1: 🔧 DESIGN FA 
// ===============================================
// Allows users to create and analyze finite automata using structured input format
// Supports both DFA and NFA creation with validation and examples

/**
 * Handle Design FA button - MAIN FEATURE 1
 * This function implements the core "Design FA" feature that allows users to:
 * - Create finite automata using structured input format
 * - Validate automaton structure and format
 * - Get examples for common patterns (even/odd counters, string patterns)
 * - Support both DFA and NFA creation
 */
export async function handleDesignFA(ctx) {
  // Show typing indicator
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  // Use proper session update instead of direct assignment
  updateUserSession(ctx.from.id, {
    waitingFor: 'fa_definition',
    lastOperation: 'design_fa_menu'
  });

  const helpText = `� **Design Your Finite Automaton**

**📝 Required Format:**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q2
q1,0,q0
q1,1,q2
q2,0,q2
q2,1,q2
Start: q0
Final: q2
\`\`\`

**📚 Common Pattern Examples:**

**1️⃣ Even number of 1s (DFA):**
\`\`\`
States: q0,q1
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q1
q1,0,q1
q1,1,q0
Start: q0
Final: q0
\`\`\`

**2️⃣ Strings ending with "01" (DFA):**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q0
q1,0,q1
q1,1,q2
q2,0,q1
q2,1,q0
Start: q0
Final: q2
\`\`\`

**💡 Tips:**
• Copy and paste any example above to try it
• Each transition: from_state,symbol,to_state
• No spaces in state names
• Ask: "Design a DFA that accepts [your requirement]"`;

  ctx.reply(helpText, { parse_mode: 'Markdown' });
}

// ===============================================
// FEATURE 2: 🧪 TEST INPUT
// ===============================================
// Simulates string processing on any defined automaton
// Shows ACCEPTED/REJECTED results with step-by-step simulation

/**
 * Handle Test Input button - MAIN FEATURE 2
 * This function implements the "Test Input" feature that allows users to:
 * - Simulate string processing on any defined automaton
 * - Show ACCEPTED/REJECTED results with step-by-step simulation  
 * - Work with both DFA and NFA
 * - Display the execution path through states
 */
export async function handleTestInput(ctx) {
  // Show typing indicator
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  const session = getUserSession(ctx.from.id);

  console.log(`🧪 [MENU] Test Input button pressed by user ${ctx.from.id}`);
  console.log(`🧪 [MENU] Session check:`, {
    hasFA: !!session.currentFA,
    faType: session.currentFA ? 'loaded' : 'none',
    faStates: session.currentFA ? session.currentFA.states?.length : 0,
    lastOperation: session.lastOperation
  });

  // Check if user has a loaded automaton
  if (!session.currentFA) {
    console.log(`❌ [MENU] No automaton in session for user ${ctx.from.id}`);

    ctx.reply(`🚫 **No Automaton Loaded**

Please design an automaton first using "🔧 Design FA"

**Quick Example - Copy and paste:**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q0
q1,0,q2
q1,1,q0
q2,0,q2
q2,1,q2
Start: q0
Final: q2
\`\`\`

Then come back to test strings!`, { parse_mode: 'Markdown' });
    return;
  }

  console.log(`✅ [MENU] Automaton found, setting session to wait for test input`);

  // Ensure session is properly updated
  updateUserSession(ctx.from.id, {
    waitingFor: 'test_input',
    lastOperation: 'test_input_menu'
  });

  const testText = `🧪 **Test Input String**

Send me a string to test against your current automaton.

**📚 Example Test Strings:**
• \`00\` - Two zeros
• \`01\` - Zero then one
• \`101\` - One-zero-one pattern
• \`1100\` - Longer string
• \`ε\` - Empty string (just send empty message)

**Current Automaton:**
• **Type:** ${checkFAType(session.currentFA)}
• **States:** ${session.currentFA.states.join(', ')}
• **Alphabet:** ${session.currentFA.alphabet.join(', ')}

**💡 What I'll show you:**
• ✅/❌ ACCEPTED or REJECTED result
• 🔄 Step-by-step state transitions
• 📍 Current state at each symbol
• 🎯 Final state and acceptance decision

**Tips:**
• Use only symbols from your alphabet
• I'll trace the execution path for you
• Try different patterns to understand your automaton`;

  ctx.reply(testText, { parse_mode: 'Markdown' });
}

// ===============================================
// FEATURE 3: 🔍 CHECK FA TYPE
// ===============================================
// Automatically determines if an automaton is DFA or NFA
// Analyzes transition functions for determinism

/**
 * Handle Check FA Type button - MAIN FEATURE 3
 * This function implements the "Check FA Type" feature that allows users to:
 * - Automatically determine if an automaton is DFA or NFA
 * - Analyze transition functions for determinism
 * - Provide clear explanations for the classification
 */
export async function handleCheckFAType(ctx) {
  // Show typing indicator
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  // Use proper session update instead of direct assignment
  updateUserSession(ctx.from.id, {
    waitingFor: 'fa_type_check',
    lastOperation: 'fa_type_menu'
  });

  const helpText = `🔍 **Check Automaton Type**

Send me an automaton and I'll analyze whether it's a DFA or NFA.

**🤖 What I analyze:**
• **Determinism**: Each state has exactly one transition per symbol (DFA)
• **Nondeterminism**: Multiple transitions or missing transitions (NFA)
• **Transition completeness**: All state-symbol combinations covered
• **Epsilon transitions**: Empty string transitions (NFA feature)

**📚 DFA Example:**

**📚 DFA Example (Deterministic):**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q0
q1,0,q2
q1,1,q0
q2,0,q2
q2,1,q2
Start: q0
Final: q2
\`\`\`

**📚 NFA Example (Nondeterministic):**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q0
q0,1,q1
q1,0,q2
Start: q0
Final: q2
\`\`\`

**💡 Key Differences:**
• **DFA**: Exactly one transition per symbol from each state
• **NFA**: Multiple or missing transitions allowed

Try both examples to see the analysis!`;

  ctx.reply(helpText, { parse_mode: 'Markdown' });
}

// ===============================================
// FEATURE 4: 🔄 NFA→DFA CONVERSION
// ===============================================
// Converts NFAs to equivalent DFAs using subset construction algorithm
// Shows the conversion process step-by-step with AI explanations

/**
 * Handle NFA to DFA conversion button - MAIN FEATURE 4
 * This function implements the "NFA→DFA" feature that allows users to:
 * - Convert NFAs to equivalent DFAs using subset construction algorithm
 * - Show the conversion process step-by-step
 * - Handle epsilon transitions and multiple transitions
 * - Provide AI-powered explanations of each conversion step
 */
export async function handleNFAToDFA(ctx) {
  // Show typing indicator
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  // Use proper session update instead of direct assignment
  updateUserSession(ctx.from.id, {
    waitingFor: 'nfa_conversion',
    lastOperation: 'nfa_conversion_menu'
  });

  const helpText = `🔄 **Convert NFA to DFA**

Send me an NFA definition and I'll convert it to an equivalent DFA using subset construction.

**🧠 What the algorithm does:**
• **Subset Construction**: Create DFA states from sets of NFA states
• **Epsilon Closure**: Handle empty string transitions
• **Transition Mapping**: Map multiple NFA transitions to single DFA transitions
• **State Naming**: Generate clear names for the new DFA states

**📚 NFA Example - Strings ending with "01":**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q0
q0,0,q1
q0,1,q0
q1,1,q2
q2,0,q2
q2,1,q2
Start: q0
Final: q2
\`\`\`

**📚 More Complex NFA Example:**
\`\`\`
States: q0,q1,q2,q3
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q0
q0,1,q1
q1,0,q2
q2,1,q3
Start: q0
Final: q3
\`\`\`

**💡 What I'll show you:**
• ✨ Equivalent DFA with clear state names
• 📊 Step-by-step conversion explanation
• 🔍 How subset construction works
• 📈 State reduction and optimization

**Note**: If you send a DFA, I'll tell you it's already deterministic!`;

  ctx.reply(helpText, { parse_mode: 'Markdown' });
}

// ===============================================
// FEATURE 5: ⚡ MINIMIZE DFA
// ===============================================
// Minimizes DFAs using partition refinement algorithm
// Automatically converts NFAs to DFAs before minimization if needed

/**
 * Handle Minimize DFA button - MAIN FEATURE 5
 * This function implements the "Minimize DFA" feature that allows users to:
 * - Minimize DFAs using partition refinement algorithm
 * - Automatically convert NFAs to DFAs before minimization if needed
 * - Show which states can be merged and why
 * - Identify already minimal DFAs
 */
export async function handleMinimizeDFA(ctx) {
  // Show typing indicator
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  // Use proper session update instead of direct assignment
  updateUserSession(ctx.from.id, {
    waitingFor: 'dfa_minimization',
    lastOperation: 'dfa_minimization_menu'
  });

  const helpText = `⚡ **Minimize DFA**

Send me a DFA and I'll minimize it using partition refinement algorithm.

**🧠 What the algorithm does:**
• **Initial Partitioning**: Separate final and non-final states
• **Partition Refinement**: Iteratively split partitions based on transitions
• **Equivalence Detection**: Find states that behave identically
• **State Merging**: Combine equivalent states into single states
• **Optimization**: Remove unreachable and unnecessary states

**📚 DFA Example - Can be minimized (has redundant states):**
\`\`\`
States: q0,q1,q2,q3,q4
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q2
q1,0,q3
q1,1,q4
q2,0,q4
q2,1,q3
q3,0,q3
q3,1,q3
q4,0,q4
q4,1,q4
Start: q0
Final: q3
\`\`\`

**📚 DFA Example - Already minimal (no redundant states):**
\`\`\`
States: q0,q1
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q1
q1,0,q1
q1,1,q0
Start: q0
Final: q0
\`\`\`

**💡 What I'll show you:**
• 🔍 State equivalence analysis
• 📊 Partition refinement steps
• ✨ Final minimized DFA
• 📈 Comparison with original (states reduced)
• 🧠 AI explanation of why states were merged

**Note**: If you send an NFA, I'll convert it to DFA first, then minimize!`;

  ctx.reply(helpText, { parse_mode: 'Markdown' });
}

// ===============================================
// FEATURE 6: 🧠 AI HELP  
// ===============================================
// AI-powered explanations and assistance for automata theory

/**
 * Handle AI Help button - MAIN FEATURE 6
 * This function implements the "AI Help" feature that provides:
 * - Natural language question answering using DeepSeek AI
 * - Step-by-step algorithmic explanations
 * - Educational content and concept clarification
 * - Problem-solving assistance and guidance
 */
export function handleAIHelp(ctx) {
  const helpMessage = `🧠 **AI Assistant Ready!**

I can help you with automata theory using natural language!

🎯 **Concept Explanations:**
• "Explain DFA minimization step by step"
• "What is the difference between DFA and NFA?"
• "How does subset construction algorithm work?"
• "What are regular languages?"

🔧 **Problem Solving:**
• "Design a DFA that accepts even number of 1s"
• "Convert this NFA to DFA: [paste your NFA]"
• "Why is my automaton not working?"
• "How do I test if a string is accepted?"

📚 **Learning Support:**
• "Give me practice problems for DFA design"
• "Explain the pumping lemma"
• "Show me examples of finite automata applications"
• "What are the formal definitions?"

🎨 **Interactive Features:**
• Ask questions in plain English
• Get step-by-step explanations
• Request examples and tutorials
• Troubleshoot your automata

💡 **Example Questions:**
Just type naturally like: "How do I create a DFA that accepts strings with an odd number of zeros?"

**Ready to help! Ask me anything about automata theory! 🚀**`;

  ctx.reply(helpMessage, { parse_mode: 'Markdown' });
}

// ===============================================
// ADDITIONAL SUPPORT FEATURES
// ===============================================

/**
 * Handle Learn Mode button - Interactive Learning System
 * Provides structured learning paths and tutorials
 */
export function handleLearnMode(ctx) {
  const learningMenu = `📚 **Interactive Learning Mode**

Choose a topic to learn with step-by-step tutorials:

🎯 **Available Topics:**
• **📖 DFA Basics** - Deterministic finite automata fundamentals
• **📖 NFA Basics** - Nondeterministic finite automata concepts  
• **📖 Conversions** - NFA→DFA conversion techniques
• **📖 Minimization** - DFA optimization algorithms
• **📖 Regular Languages** - Formal language theory
• **📖 Practice Problems** - Hands-on exercises with solutions`;

  ctx.reply(learningMenu, {
    reply_markup: {
      keyboard: [
        [{ text: '📖 DFA Basics' }, { text: '📖 NFA Basics' }],
        [{ text: '📖 Conversions' }, { text: '📖 Minimization' }],
        [{ text: '📖 Regular Languages' }, { text: '📖 Practice Problems' }],
        [{ text: '🔙 Back to Main Menu' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
}

/**
 * Handle My History button - User Operation History
 * Shows saved operations and previous work
 */
export async function handleMyHistory(ctx) {
  try {
    // Show typing indicator
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

    // Get conversation history from session (not database)
    const history = getUserHistory(ctx.from.id, 15, 'all'); // Get last 15 entries of all types
    const summary = getConversationSummary(ctx.from.id);

    if (history.length === 0) {
      ctx.reply('📊 **No History Found**\n\nStart by designing some automata! Try:\n• Click "🔧 Design FA"\n• Send an automaton definition\n• Use AI help with questions', { parse_mode: 'Markdown' });
      return;
    }

    // Format comprehensive history message
    let historyMessage = `📊 **Your Conversation History**\n\n`;

    // Add summary statistics
    historyMessage += `**📈 Session Summary:**\n`;
    historyMessage += `• Total interactions: ${summary.totalEntries}\n`;
    historyMessage += `• User inputs: ${summary.userInputs}\n`;
    historyMessage += `• Bot responses: ${summary.botResponses}\n`;
    historyMessage += `• Exercises completed: ${summary.exercises}\n`;

    if (Object.keys(summary.operations).length > 0) {
      historyMessage += `\n**🔧 Operations Used:**\n`;
      Object.entries(summary.operations).forEach(([op, count]) => {
        const opName = op.replace('_', ' ').toUpperCase();
        historyMessage += `• ${opName}: ${count} times\n`;
      });
    }

    historyMessage += `\n**📝 Recent Activity:**\n`;

    // Show recent history entries
    history.slice(0, 10).forEach((entry, index) => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const emoji = entry.type === 'USER_INPUT' ? '👤' :
                   entry.type === 'BOT_RESPONSE' ? '🤖' : '📚';

      let description = '';
      if (entry.type === 'USER_INPUT') {
        description = entry.operation ? entry.operation.replace('_', ' ') : 'question';
      } else if (entry.type === 'BOT_RESPONSE') {
        description = entry.result?.success ? 'successful response' : 'error response';
      } else if (entry.type === 'EXERCISE') {
        description = `${entry.exerciseType} exercise`;
      }

      historyMessage += `${emoji} ${time} - ${description}\n`;
    });

    if (history.length > 10) {
      historyMessage += `\n... and ${history.length - 10} more entries`;
    }

    ctx.reply(historyMessage, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('History error:', error);
    ctx.reply('❌ **Error retrieving history**\n\nThis might be a temporary issue. Try again later or contact support.', { parse_mode: 'Markdown' });
  }
}

/**
 * Handle Help button
 */
export function handleHelp(ctx) {
  const helpText = `❓ **Help & Commands**

**🚀 Quick Commands:**
• \`/examples\` - Show complete format examples
• \`/explain [topic]\` - Get AI explanation
• \`/design [requirement]\` - AI-assisted design
• \`/practice\` - Get practice problems

**📝 Basic Format:**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q0
Start: q0
Final: q1
\`\`\`

**🎯 Quick Start Examples:**

**Even number of 1s (DFA):**
\`\`\`
States: q0,q1
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q1
q1,0,q1
q1,1,q0
Start: q0
Final: q0
\`\`\`

**Strings ending with "01" (NFA):**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q0
q0,0,q1
q0,1,q0
q1,1,q2
Start: q0
Final: q2
\`\`\`

**💡 Pro Tips:**
• Copy examples above and try them!
• Use menu buttons for guided help
• Ask: "Design a DFA that accepts [requirement]"
• All operations include AI explanations
• Your work is automatically saved

**🆘 Need Help?** Ask: "How do I create a DFA?" or use \`/examples\``;

  ctx.reply(helpText, { parse_mode: 'Markdown' });
}

/**
 * Handle Back to Main Menu button
 */
export function handleBackToMainMenu(ctx) {
  ctx.reply('🏠 Back to main menu', {
    reply_markup: {
      keyboard: [
        [{ text: '🔧 Design FA' }, { text: '🧪 Test Input' }],
        [{ text: '🔍 Check FA Type' }, { text: '🔄 NFA→DFA' }],
        [{ text: '⚡ Minimize DFA' }, { text: '🧠 AI Help' }],
        [{ text: '📚 Learn Mode' }, { text: '📊 My History' }],
        [{ text: '❓ Help' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
}
