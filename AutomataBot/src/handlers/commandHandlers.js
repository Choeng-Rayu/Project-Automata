// Command handlers for bot commands
import { handleAIQuestion, generateLearningContent, handleAIQuestionWithVisuals, generateAutomatonExample } from '../services/aiService.js';
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
 * Handle /example command with visual diagrams
 */
export async function handleExampleCommand(ctx) {
  const type = ctx.message.text.replace('/example', '').trim();

  ctx.reply('📚 **Generating example...** 📊 Creating visual diagram...', { parse_mode: 'Markdown' });

  if (type.toLowerCase().includes('dfa')) {
    await generateAutomatonExample('accepts strings with even number of 1s (DFA example)', ctx);
  } else if (type.toLowerCase().includes('nfa')) {
    await generateAutomatonExample('accepts strings ending with "01" (NFA example)', ctx);
  } else {
    // Provide both DFA and NFA examples
    await generateAutomatonExample('accepts strings with even number of 0s (DFA example)', ctx);

    // Small delay before second example
    setTimeout(async () => {
      await generateAutomatonExample('accepts strings containing "11" (NFA example)', ctx);
    }, 2000);
  }
}

/**
 * Handle /design command with automatic visual diagram
 */
export async function handleDesignCommand(ctx) {
  const requirement = ctx.message.text.replace('/design', '').trim();
  if (!requirement) {
    ctx.reply('🔧 **Usage:** `/design [requirement]`\n\nExample: `/design DFA that accepts strings with even number of 1s`', { parse_mode: 'Markdown' });
    return;
  }

  ctx.reply('🔧 **Designing automaton...** 📊 Generating visual diagram...', { parse_mode: 'Markdown' });

  // Use the enhanced function that provides both text and visual diagram
  await generateAutomatonExample(requirement, ctx);
}

/**
 * Handle /practice command with solution examples
 */
export async function handlePracticeCommand(ctx) {
  // Generate a practice problem first
  const problemPrompt = 'Generate a practice problem for finite automata design. Include the problem statement, difficulty level, and hints for solving it. End with "Would you like to see the solution?"';

  ctx.reply('🎯 **Generating practice problem...**', { parse_mode: 'Markdown' });
  const problemResponse = await handleAIQuestion(problemPrompt);

  // Send the problem
  await ctx.reply(`🎯 **Practice Problem:**\n\n${problemResponse}`, { parse_mode: 'Markdown' });

  // Automatically provide the solution with visual diagram after a short delay
  setTimeout(async () => {
    ctx.reply('💡 **Here\'s the solution with visual diagram:**', { parse_mode: 'Markdown' });

    // Generate common practice problems with solutions
    const practiceExamples = [
      'accepts strings with odd length',
      'accepts strings ending with "00"',
      'accepts strings with at least two 1s',
      'accepts strings where every 0 is followed by a 1'
    ];

    const randomExample = practiceExamples[Math.floor(Math.random() * practiceExamples.length)];
    await generateAutomatonExample(randomExample, ctx);
  }, 3000);
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
 * Handle natural language AI questions with automatic visual examples
 */
export async function handleNaturalLanguageQuestion(ctx, question) {
  console.log(`🎯 [HANDLER] handleNaturalLanguageQuestion called with: "${question}"`);
  try {
    // Use the enhanced AI handler that automatically provides visuals for design requests
    await handleAIQuestionWithVisuals(question, ctx);
    console.log(`✅ [HANDLER] handleAIQuestionWithVisuals completed successfully`);
  } catch (error) {
    console.error(`❌ [HANDLER] handleAIQuestionWithVisuals failed:`, error);
    throw error;
  }
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
