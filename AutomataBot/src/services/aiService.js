// AI Service for DeepSeek integration
import axios from 'axios';
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
