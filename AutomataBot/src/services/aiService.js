// AI Service for DeepSeek integration
import axios from 'axios';
import { generateAutomatonImage } from './imageService.js';

import {AIAssistant} from './trainAi.js';

/**
 * Call DeepSeek AI API
 * @param {string} prompt - User prompt
 * @param {string} systemMessage - System message for context
 * @returns {Promise<string>} AI response
 */
export async function callDeepSeekAI(prompt, systemMessage = "You are an expert in automata theory and formal languages. Help users understand concepts and solve problems related to finite automata, regular languages, and computational theory.") {
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ DeepSeek API Error:', error.response?.data || error.message);
    return "I'm sorry, I'm having trouble connecting to my AI assistant right now. Please try again later.";
  }
}

// call deepseek for quick reply
export async function callDeepSeekAIWithoutThink(prompt, systemMessage = new AIAssistant().generateSystemPrompt()) {
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ DeepSeek API Error:', error.response?.data || error.message);
    return "I'm sorry, I'm having trouble connecting to my AI assistant right now. Please try again later.";
  }
}

/**
 * Generate explanation for automata operations
 * @param {Object} fa - Finite automaton
 * @param {string} operation - Operation type
 * @param {string} userInput - User input (for simulation)
 * @returns {Promise<string>} AI explanation
 */
export async function explainAutomataStep(fa, operation, userInput = '') {
  const faDescription = `
Finite Automaton:
- States: ${fa.states.join(', ')}
- Alphabet: ${fa.alphabet.join(', ')}
- Start State: ${fa.startState}
- Final States: ${fa.finalStates.join(', ')}
- Transitions: ${fa.transitions.map(t => `${t.from} --${t.symbol}--> ${t.to}`).join(', ')}
`;

  let prompt = '';
  switch (operation) {
    case 'minimize':
      prompt = `Explain step-by-step how to minimize this DFA:\n${faDescription}\nProvide a clear, educational explanation of the minimization process.`;
      break;
    case 'nfa2dfa':
      prompt = `Explain step-by-step how to convert this NFA to DFA using subset construction:\n${faDescription}\nProvide a clear, educational explanation.`;
      break;
    case 'simulate':
      prompt = `Explain step-by-step how this automaton processes the input string "${userInput}":\n${faDescription}\nShow each step of the simulation.`;
      break;
    case 'type':
      prompt = `Analyze this finite automaton and explain why it is a DFA or NFA:\n${faDescription}\nProvide clear reasoning.`;
      break;
    default:
      prompt = `Explain this finite automaton:\n${faDescription}`;
  }
  
  return await callDeepSeekAI(prompt);
}

/**
 * Handle AI questions from users
 * @param {string} quest/ion - User question
 * @returns {Promise<string>} AI response
 */
// export async function handleAIQuestion(question) {
//   const aiSystemPrompt = new AIAssistant().generateSystemPrompt();
//   // return await callDeepSeekAI(question, systemMessage);
//   return await callDeepSeekAI(question, aiSystemPrompt);
// }

export async function handleAIQuestion(question) {
  // Use a minimal system prompt for general user questions to avoid overthinking
  const quickPrompt = new AIAssistant().generateSystemPrompt();
  return await callDeepSeekAI(question, quickPrompt);
}

/**
 * Generate automaton example with both text explanation and visual diagram
 * @param {string} requirement - What the automaton should do
 * @param {Object} ctx - Telegram context for sending messages
 * @returns {Promise<void>}
 */
export async function generateAutomatonExample(requirement, ctx) {
  try {
    console.log(`🎨 [STEP 1] Starting generateAutomatonExample for: "${requirement}"`);

    // Generate the automaton design using AI
    const designPrompt = `Design a finite automaton that ${requirement}.

    IMPORTANT: Start your response with the formal definition in EXACTLY this format:

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

    After the formal definition, provide a brief explanation of the design logic.

    Make sure to use simple state names like q0, q1, q2 and common alphabet symbols like 0, 1.`;

    console.log(`🤖 [STEP 2] Calling AI service...`);
    const aiResponse = await callDeepSeekAI(designPrompt);
    console.log(`✅ [STEP 3] AI response received (${aiResponse.length} chars)`);

    // Parse the AI response to extract the automaton definition
    console.log(`🔍 [STEP 4] Parsing AI response...`);
    const automaton = parseAutomatonFromAI(aiResponse);
    console.log(`📊 [STEP 5] Automaton parsed:`, automaton ? 'SUCCESS' : 'FAILED');

    if (automaton) {
      console.log(`🖼️ [STEP 6] Generating image...`);
      // Generate visual diagram
      const imagePath = await generateAutomatonImage(
        automaton,
        `Example: ${requirement}`,
        'example'
      );
      console.log(`✅ [STEP 7] Image generated at: ${imagePath}`);

      // Check if file exists
      const fsExtra = await import('fs-extra');
      const fs = fsExtra.default;
      const fileExists = await fs.pathExists(imagePath);
      console.log(`📁 [STEP 8] File exists: ${fileExists}`);

      if (fileExists) {
        const stats = await fs.stat(imagePath);
        console.log(`📊 [STEP 9] File size: ${stats.size} bytes`);
      }

      console.log(`📤 [STEP 10] Attempting to send photo...`);
      console.log(`📤 [STEP 10.1] Context type:`, typeof ctx);
      console.log(`📤 [STEP 10.2] replyWithPhoto function:`, typeof ctx.replyWithPhoto);

      try {
        // Try multiple methods to send the photo
        console.log(`📤 [STEP 10.3] Trying method 1: Input.fromLocalFile`);
        try {
          const { Input } = await import('telegraf');
          const photoResult = await ctx.replyWithPhoto(Input.fromLocalFile(imagePath), {
            caption: `🎯 **Example Solution: ${requirement}**\n\n📊 Visual diagram of the automaton`,
            parse_mode: 'Markdown'
          });
          console.log(`✅ [STEP 11] Photo sent successfully with Input.fromLocalFile! Message ID:`, photoResult.message_id);
        } catch (inputError) {
          console.log(`❌ [STEP 10.3] Input.fromLocalFile failed:`, inputError.message);
          console.log(`📤 [STEP 10.4] Trying method 2: fs.createReadStream`);

          // Method 2: Use fs.createReadStream
          const fsExtra = await import('fs-extra');
          const fs = fsExtra.default;
          const photoStream = fs.createReadStream(imagePath);
          const photoResult = await ctx.replyWithPhoto(photoStream, {
            caption: `🎯 **Example Solution: ${requirement}**\n\n📊 Visual diagram of the automaton`,
            parse_mode: 'Markdown'
          });
          console.log(`✅ [STEP 11] Photo sent successfully with createReadStream! Message ID:`, photoResult.message_id);
        }
      } catch (photoError) {
        console.error(`❌ [STEP 11] Photo sending failed:`, photoError);
        console.error(`❌ [STEP 11.1] Error details:`, photoError.message);

        // Fallback: try to send as buffer
        try {
          console.log(`📤 [STEP 11.3] Trying fallback method: buffer`);
          const fsExtra = await import('fs-extra');
          const fs = fsExtra.default;
          const buffer = await fs.readFile(imagePath);
          const photoResult = await ctx.replyWithPhoto({ source: buffer, filename: 'automaton.png' }, {
            caption: `🎯 **Example Solution: ${requirement}**\n\n📊 Visual diagram of the automaton`,
            parse_mode: 'Markdown'
          });
          console.log(`✅ [STEP 11] Photo sent successfully with buffer! Message ID:`, photoResult.message_id);
        } catch (bufferError) {
          console.error(`❌ [STEP 11.3] Buffer method also failed:`, bufferError);
          throw photoError;
        }
      }

      console.log(`📝 [STEP 12] Sending text explanation...`);
      try {
        // Send detailed explanation
        const textResult = await ctx.reply(`📋 **Detailed Explanation:**\n\n${aiResponse}`, {
          parse_mode: 'Markdown'
        });
        console.log(`✅ [STEP 13] Text sent successfully! Message ID:`, textResult.message_id);
      } catch (textError) {
        console.error(`❌ [STEP 13] Text sending failed:`, textError);
        throw textError;
      }

      // Clean up image
      setTimeout(async () => {
        try {
          await fs.remove(imagePath);
          console.log(`🗑️ Cleaned up example image: ${imagePath}`);
        } catch (error) {
          console.error('Error cleaning up image:', error);
        }
      }, 30000);

    } else {
      // Fallback: send text only
      await ctx.reply(`🎯 **Example Solution: ${requirement}**\n\n${aiResponse}`, {
        parse_mode: 'Markdown'
      });
    }

  } catch (error) {
    console.error('❌ Error generating automaton example:', error);

    // Fallback response
    const fallbackPrompt = `Provide a detailed explanation and example for: ${requirement}`;
    const fallbackResponse = await callDeepSeekAI(fallbackPrompt);
    await ctx.reply(`🎯 **Example Solution: ${requirement}**\n\n${fallbackResponse}`, {
      parse_mode: 'Markdown'
    });
  }
}

/**
 * Parse automaton definition from AI response
 */
function parseAutomatonFromAI(aiResponse) {
  try {
    const lines = aiResponse.split('\n');
    let states = [], alphabet = [], transitions = [], startState = '', finalStates = [];
    let inTransitions = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (line.startsWith('States:')) {
        states = line.replace('States:', '').split(',').map(s => s.trim()).filter(s => s);
      } else if (line.startsWith('Alphabet:')) {
        alphabet = line.replace('Alphabet:', '').split(',').map(s => s.trim()).filter(s => s);
      } else if (line.startsWith('Transitions:')) {
        inTransitions = true;
      } else if (line.startsWith('Start:')) {
        startState = line.replace('Start:', '').trim();
        inTransitions = false;
      } else if (line.startsWith('Final:')) {
        finalStates = line.replace('Final:', '').split(',').map(s => s.trim()).filter(s => s);
        inTransitions = false;
      } else if (inTransitions && line.includes(',')) {
        const parts = line.split(',');
        if (parts.length === 3) {
          const [from, symbol, to] = parts.map(s => s.trim());
          if (from && symbol && to) {
            transitions.push({ from, symbol, to });
          }
        }
      }
    }

    // Validate the parsed automaton
    if (states.length > 0 && alphabet.length > 0 && transitions.length > 0 &&
        startState && finalStates.length > 0) {
      return { states, alphabet, transitions, startState, finalStates };
    }

    return null;
  } catch (error) {
    console.error('❌ Error parsing automaton from AI:', error);
    return null;
  }
}

/**
 * Enhanced AI question handler that provides examples with images
 */
export async function handleAIQuestionWithVisuals(question, ctx) {
  try {
    console.log(`🔍 [AI-VISUAL] Starting handleAIQuestionWithVisuals with: "${question}"`);
    console.log(`🔍 [AI-VISUAL] Context info - Chat ID: ${ctx.chat?.id}, User ID: ${ctx.from?.id}`);

    // Enhanced detection for design/example requests
    const lowerQuestion = question.toLowerCase();
    const isDesignRequest = lowerQuestion.includes('design') ||
                           lowerQuestion.includes('create') ||
                           lowerQuestion.includes('example') ||
                           lowerQuestion.includes('show me') ||
                           lowerQuestion.includes('build') ||
                           lowerQuestion.includes('make') ||
                           lowerQuestion.includes('construct') ||
                           lowerQuestion.includes('draw') ||
                           lowerQuestion.includes('diagram');

    console.log(`🎯 [AI-VISUAL] Is design request: ${isDesignRequest}`);

    if (isDesignRequest) {
      // More flexible requirement extraction
      let requirement = question;

      // Remove common prefixes but keep the core requirement
      const patterns = [
        /^(design|create|show\s+me|build|make|construct|draw)\s+(a\s+)?(dfa|nfa|automaton|finite\s+automaton)?\s*(that|which|for)?\s*/i,
        /^(give\s+me\s+an?\s+)?(example\s+of\s+)?(a\s+)?(dfa|nfa|automaton|finite\s+automaton)?\s*(that|which|for)?\s*/i,
        /^(can\s+you\s+)?(please\s+)?(show|design|create|make)\s*/i
      ];

      for (const pattern of patterns) {
        requirement = requirement.replace(pattern, '').trim();
      }

      // If we still have a meaningful requirement, generate the example
      if (requirement.length > 5) {
        console.log(`✅ [AI-VISUAL] Calling generateAutomatonExample with: "${requirement}"`);
        await generateAutomatonExample(requirement, ctx);
        console.log(`✅ [AI-VISUAL] generateAutomatonExample completed for: "${requirement}"`);
        return;
      } else {
        // Provide a default example if requirement is unclear
        console.log(`🔄 [AI-VISUAL] Using default example for unclear requirement`);
        await generateAutomatonExample('accepts strings with even number of 1s', ctx);
        console.log(`✅ [AI-VISUAL] Default example completed`);
        return;
      }
    }

    // For other questions, provide regular AI response
    ctx.reply('🧠 **Thinking...** please wait a second...!', { parse_mode: 'Markdown' });
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

    const response = await handleAIQuestion(question);
    await ctx.reply(`🧠 **AI Assistant:**\n\n${response}`, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('❌ Error in AI question with visuals:', error);

    // Fallback to regular AI response
    const response = await handleAIQuestion(question);
    await ctx.reply(`🧠 **AI Assistant:**\n\n${response}`, { parse_mode: 'Markdown' });
  }
}




/**
 * Generate learning content for specific topics
 * @param {string} topic - Learning topic
 * @returns {Promise<string>} Educational content
 */
export async function generateLearningContent(topic) {
  let prompt = '';
  
  switch (topic) {
    case '📖 DFA Basics':
      prompt = 'Explain the basics of Deterministic Finite Automata (DFA) with simple examples. Include definition, components, and a basic example.';
      break;
    case '📖 NFA Basics':
      prompt = 'Explain the basics of Nondeterministic Finite Automata (NFA) with examples. Include how they differ from DFAs and when to use them.';
      break;
    case '📖 Conversions':
      prompt = 'Explain how to convert NFA to DFA using subset construction algorithm with a step-by-step example.';
      break;
    case '📖 Minimization':
      prompt = 'Explain DFA minimization algorithm with a step-by-step example. Include the concept of equivalent states.';
      break;
    case '📖 Regular Languages':
      prompt = 'Explain regular languages, their relationship with finite automata, and provide examples of regular and non-regular languages.';
      break;
    case '📖 Practice Problems':
      prompt = 'Provide 3 practice problems for designing finite automata, ranging from easy to medium difficulty. Include the problem statement and hints.';
      break;
    default:
      prompt = 'Provide an overview of finite automata theory and its applications.';
  }
  
  return await callDeepSeekAI(prompt);
}
