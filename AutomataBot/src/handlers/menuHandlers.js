// Menu button handlers
import { getUserSession } from '../utils/sessionManager.js';
import { getUserHistory } from '../config/database.js';
import { formatHistoryMessage } from '../utils/messageFormatter.js';

/**
 * Handle Design FA button
 */
export function handleDesignFA(ctx) {
  const session = getUserSession(ctx.from.id);
  session.waitingFor = 'fa_definition';

  const helpText = `📝 **Design Your Finite Automaton**

**Format:**
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

**📚 Common Examples:**

**1️⃣ Even number of 1s:**
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

**2️⃣ Strings ending with "01":**
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

/**
 * Handle Test Input button
 */
export function handleTestInput(ctx) {
  const session = getUserSession(ctx.from.id);
  if (!session.currentFA) {
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

  session.waitingFor = 'test_input';

  const testText = `🧪 **Test Input String**

Send me a string to test against your current automaton.

**📚 Example Test Strings:**
• \`00\` - Two zeros
• \`01\` - Zero then one
• \`101\` - One-zero-one pattern
• \`1100\` - Longer string
• \`ε\` - Empty string (just send empty message)

**💡 Tips:**
• Use only symbols from your alphabet
• I'll show step-by-step simulation
• Try different patterns to understand your automaton`;

  ctx.reply(testText, { parse_mode: 'Markdown' });
}

/**
 * Handle Check FA Type button
 */
export function handleCheckFAType(ctx) {
  const session = getUserSession(ctx.from.id);
  session.waitingFor = 'fa_type_check';

  const helpText = `🔍 **Check Automaton Type**

Send me an automaton and I'll tell you if it's a DFA or NFA.

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

/**
 * Handle NFA to DFA conversion button
 */
export function handleNFAToDFA(ctx) {
  const session = getUserSession(ctx.from.id);
  session.waitingFor = 'nfa_conversion';

  const helpText = `🔄 **Convert NFA to DFA**

Send me an NFA definition and I'll convert it using subset construction.

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

**📚 NFA Example - Contains "11":**
\`\`\`
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q0
q0,1,q1
q1,1,q2
q2,0,q2
q2,1,q2
Start: q0
Final: q2
\`\`\`

**💡 Copy any example above to try the conversion!**
I'll show you the step-by-step process and resulting DFA.`;

  ctx.reply(helpText, { parse_mode: 'Markdown' });
}

/**
 * Handle Minimize DFA button
 */
export function handleMinimizeDFA(ctx) {
  const session = getUserSession(ctx.from.id);
  session.waitingFor = 'dfa_minimization';

  const helpText = `⚡ **Minimize DFA**

Send me a DFA and I'll minimize it using partition refinement algorithm.

**📚 DFA Example - Can be minimized:**
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

**📚 DFA Example - Already minimal:**
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

**💡 Try both examples to see the difference!**
I'll show you which states can be merged and why.`;

  ctx.reply(helpText, { parse_mode: 'Markdown' });
}

/**
 * Handle AI Help button
 */
export function handleAIHelp(ctx) {
  const helpMessage = `🧠 **AI Assistant Ready!**

I can help you with:

🎯 **Concept Explanations:**
• "Explain DFA minimization"
• "What is the difference between DFA and NFA?"
• "How does subset construction work?"

🔧 **Problem Solving:**
• "Design a DFA that accepts even number of 1s"
• "Convert this NFA to DFA: [your NFA]"
• "Why is my automaton not working?"

📚 **Learning Support:**
• "Give me practice problems"
• "Explain regular languages"
• "Show me examples of finite automata"

Just ask me anything about automata theory in natural language!`;

  ctx.reply(helpMessage, { parse_mode: 'Markdown' });
}

/**
 * Handle Learn Mode button
 */
export function handleLearnMode(ctx) {
  const learningMenu = `📚 **Interactive Learning Mode**

Choose a topic to learn:`;

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
 * Handle My History button
 */
export async function handleMyHistory(ctx) {
  try {
    const history = await getUserHistory(ctx.from.id);

    if (history.length === 0) {
      ctx.reply('📊 **No History Found**\n\nStart by designing some automata! Try:\n• Click "🔧 Design FA"\n• Send an automaton definition\n• Use AI help with questions', { parse_mode: 'Markdown' });
      return;
    }

    let historyText = '📊 **Your Recent Automata:**\n\n';
    history.forEach((item, index) => {
      historyText += `${index + 1}. **${item.operation}** - ${item.date.toDateString()}\n`;
      if (item.input && item.input.states) {
        const inputStates = item.input.states.length;
        const outputStates = item.output && item.output.states ? item.output.states.length : inputStates;
        historyText += `   States: ${inputStates} → ${outputStates}\n`;
      }
      historyText += '\n';
    });

    ctx.reply(historyText, { parse_mode: 'Markdown' });
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
