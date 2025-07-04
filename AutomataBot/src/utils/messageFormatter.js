// Message formatting utilities

/**
 * Format automaton result for display
 * @param {Object} ctx - Telegram context
 * @param {Object} fa - Finite automaton
 * @param {string} title - Result title
 * @param {string} explanation - AI explanation
 */
export async function sendFormattedResult(ctx, fa, title, explanation = '') {
  let reply = `✨ **${title}**\n\n`;
  reply += `📊 **States:** ${fa.states.join(', ')}\n`;
  reply += `🔤 **Alphabet:** ${fa.alphabet.join(', ')}\n`;
  reply += `🚀 **Start State:** ${fa.startState}\n`;
  reply += `🎯 **Final States:** ${fa.finalStates.join(', ')}\n\n`;
  reply += `🔄 **Transitions:**\n`;
  
  fa.transitions.forEach(t => {
    reply += `• ${t.from} --${t.symbol}--> ${t.to}\n`;
  });
  
  if (explanation) {
    reply += `\n🧠 **AI Explanation:**\n${explanation}`;
  }
  
  // Split long messages to avoid Telegram limits
  if (reply.length > 4000) {
    const parts = reply.match(/.{1,4000}/g);
    for (const part of parts) {
      await ctx.reply(part, { parse_mode: 'Markdown' });
    }
  } else {
    ctx.reply(reply, { parse_mode: 'Markdown' });
  }
}

/**
 * Format error message
 * @param {string} error - Error message
 * @param {string} suggestion - Suggestion for user
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(error, suggestion = '') {
  let message = `❌ **Error:** ${error}`;
  if (suggestion) {
    message += `\n\n💡 **Suggestion:** ${suggestion}`;
  }
  return message;
}

/**
 * Format help message
 * @param {string} topic - Help topic
 * @param {string} content - Help content
 * @returns {string} Formatted help message
 */
export function formatHelpMessage(topic, content) {
  return `❓ **${topic}**\n\n${content}`;
}

/**
 * Format learning content
 * @param {string} topic - Learning topic
 * @param {string} content - Learning content
 * @returns {string} Formatted learning message
 */
export function formatLearningMessage(topic, content) {
  return `📚 **${topic}**\n\n${content}`;
}

/**
 * Format AI response
 * @param {string} response - AI response
 * @returns {string} Formatted AI message
 */
export function formatAIResponse(response) {
  return `🧠 **AI Assistant:**\n\n${response}`;
}

/**
 * Format test result
 * @param {string} input - Input string
 * @param {boolean} result - Test result
 * @param {string} explanation - Step-by-step explanation
 * @returns {string} Formatted test result
 */
export function formatTestResult(input, result, explanation) {
  const resultEmoji = result ? '✅' : '❌';
  const resultText = result ? 'ACCEPTED' : 'REJECTED';
  
  return `🧪 **Test Result**\n\n**Input:** \`${input}\`\n**Result:** ${resultEmoji} ${resultText}\n\n**Step-by-step simulation:**\n${explanation}`;
}

/**
 * Format history display
 * @param {Array} history - User history
 * @returns {string} Formatted history message
 */
export function formatHistoryMessage(history) {
  if (history.length === 0) {
    return '📊 No history found. Start by designing some automata!';
  }
  
  let historyText = '📊 **Your Recent Automata:**\n\n';
  history.forEach((item, index) => {
    historyText += `${index + 1}. ${item.date.toDateString()}\n`;
    historyText += `   Operation: ${item.operation}\n`;
    historyText += `   States: ${item.input.states.length} → ${item.output.states.length}\n\n`;
  });
  
  return historyText;
}
