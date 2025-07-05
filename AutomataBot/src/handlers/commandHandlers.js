// Command handlers for bot commands
import { handleAIQuestion, generateLearningContent } from '../services/aiService.js';
import { formatAIResponse, formatLearningMessage } from '../utils/messageFormatter.js';

/**
 * Handle /start command
 */
export function handleStart(ctx) {
  const welcomeMessage = `🤖 Welcome to the Enhanced Finite Automata Bot!

I'm your AI-powered assistant for automata theory. I can help you with:

🔧 **Core Operations:**
• Design and analyze finite automata
• Convert NFA to DFA
• Minimize DFAs
• Test input strings
• Check automaton types

🧠 **AI Features:**
• Step-by-step explanations
• Concept clarification
• Problem-solving assistance
• Educational guidance

📚 **Learning Mode:**
• Interactive tutorials
• Example problems
• Theory explanations

Choose an option below or ask me anything about automata theory!`;

  ctx.reply(welcomeMessage, {
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

/**
 * Handle /explain command
 */
export async function handleExplainCommand(ctx) {
  const topic = ctx.message.text.replace('/explain', '').trim();
  if (!topic) {
    ctx.reply('🧠 **Usage:** `/explain [topic]`\n\nExample: `/explain DFA minimization`', { parse_mode: 'Markdown' });
    return;
  }
  
  ctx.reply('🧠 **Thinking...**', { parse_mode: 'Markdown' });
  const response = await handleAIQuestion(`Explain ${topic} in the context of automata theory and formal languages.`);
  ctx.reply(formatAIResponse(response), { parse_mode: 'Markdown' });
}

/**
 * Handle /example command
 */
export async function handleExampleCommand(ctx) {
  const type = ctx.message.text.replace('/example', '').trim();
  let prompt = '';
  
  if (type.toLowerCase().includes('dfa')) {
    prompt = 'Provide a simple DFA example with explanation. Show the formal definition and a practical example.';
  } else if (type.toLowerCase().includes('nfa')) {
    prompt = 'Provide a simple NFA example with explanation. Show how it differs from a DFA.';
  } else {
    prompt = 'Provide examples of both DFA and NFA with clear explanations and differences.';
  }
  
  ctx.reply('📚 **Generating example...**', { parse_mode: 'Markdown' });
  const response = await handleAIQuestion(prompt);
  ctx.reply(`📚 **Example:**\n\n${response}`, { parse_mode: 'Markdown' });
}

/**
 * Handle /design command
 */
export async function handleDesignCommand(ctx) {
  const requirement = ctx.message.text.replace('/design', '').trim();
  if (!requirement) {
    ctx.reply('🔧 **Usage:** `/design [requirement]`\n\nExample: `/design DFA that accepts strings with even number of 1s`', { parse_mode: 'Markdown' });
    return;
  }
  
  const prompt = `Design a finite automaton that ${requirement}. Provide the formal definition with states, alphabet, transitions, start state, and final states. Also explain the design logic.`;
  
  ctx.reply('🔧 **Designing automaton...**', { parse_mode: 'Markdown' });
  const response = await handleAIQuestion(prompt);
  ctx.reply(`🔧 **Design Solution:**\n\n${response}`, { parse_mode: 'Markdown' });
}

/**
 * Handle /practice command
 */
export async function handlePracticeCommand(ctx) {
  const prompt = 'Generate a practice problem for finite automata design. Include the problem statement, difficulty level, and hints for solving it.';
  
  ctx.reply('🎯 **Generating practice problem...**', { parse_mode: 'Markdown' });
  const response = await handleAIQuestion(prompt);
  ctx.reply(`🎯 **Practice Problem:**\n\n${response}`, { parse_mode: 'Markdown' });
}

/**
 * Handle learning topic selection
 */
export async function handleLearningTopic(ctx, topic) {
  ctx.reply('📚 **Loading lesson...**', { parse_mode: 'Markdown' });
  const response = await generateLearningContent(topic);
  await bot.telegram.sendChatAction(chatId, 'typing');
  ctx.reply(formatLearningMessage(topic, response), { parse_mode: 'Markdown' });
}

/**
 * Handle natural language AI questions
 */
export async function handleNaturalLanguageQuestion(ctx, question) {
  ctx.reply('🧠 **Thinking...** please wait a second...!', { parse_mode: 'Markdown' });
  // Show typing status
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
  const response = await handleAIQuestion(question);
  ctx.reply(formatAIResponse(response), { parse_mode: 'Markdown' });
}

/**
 * Handle /examples command - show input format examples
 */
export function handleExamplesCommand(ctx) {
  const examplesText = `📝 **Complete Input Format Examples**

**🔄 NFA to DFA - Strings ending with "01":**
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

**⚡ DFA Minimization - Even number of 1s:**
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

**🔍 Check Type - DFA Example:**
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

**🧪 Test Strings (after loading FA):**
• \`00\` → Test two zeros
• \`101\` → Test pattern
• \`1111\` → Test longer string

**💡 Usage:**
1. Copy any example above
2. Use appropriate menu button
3. Paste the example
4. See the magic happen!

**🤖 AI Help:** Ask "Design a DFA that accepts [your requirement]"`;

  ctx.reply(examplesText, { parse_mode: 'Markdown' });
}
