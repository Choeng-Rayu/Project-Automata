// Session management for user interactions

// User session storage
const userSessions = new Map();

/**
 * Get or create user session
 * @param {string} userId - User ID
 * @returns {Object} User session
 */
export function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    console.log(`🔧 [SESSION] Creating new session for user ${userId}`);
    userSessions.set(userId, {
      currentFA: null,
      waitingFor: null,
      lastOperation: null,
      history: [],
      lastActivity: Date.now()
    });
  } else {
    // Update last activity
    const session = userSessions.get(userId);
    session.lastActivity = Date.now();
  }

  const session = userSessions.get(userId);
  console.log(`📋 [SESSION] Retrieved session for user ${userId}: waitingFor=${session.waitingFor}, hasFA=${!!session.currentFA}`);
  return session;
}

/**
 * Update user session
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 */
export function updateUserSession(userId, updates) {
  const session = getUserSession(userId);
  Object.assign(session, updates);
  session.lastActivity = Date.now();

  console.log(`🔄 [SESSION] Updated session for user ${userId}:`, {
    waitingFor: session.waitingFor,
    hasFA: !!session.currentFA,
    faStates: session.currentFA ? session.currentFA.states?.length : 0,
    updates: Object.keys(updates)
  });
}

/**
 * Add user input to history
 * @param {string} userId - User ID
 * @param {string} input - User input text
 * @param {string} operation - Operation type (e.g., 'design_fa', 'test_input', 'ai_question')
 * @param {Object} metadata - Additional metadata (automaton, result, etc.)
 */
export function addUserInputToHistory(userId, input, operation, metadata = {}) {
  const session = getUserSession(userId);

  const historyEntry = {
    id: generateHistoryId(),
    timestamp: Date.now(),
    type: 'USER_INPUT',
    operation,
    input,
    metadata: {
      ...metadata,
      sessionState: {
        waitingFor: session.waitingFor,
        hasFA: !!session.currentFA
      }
    }
  };

  session.history.push(historyEntry);

  // Keep only last 50 entries to prevent memory issues
  if (session.history.length > 50) {
    session.history = session.history.slice(-50);
  }

  console.log(`📝 [HISTORY] Added user input for user ${userId}: ${operation}`);
  return historyEntry.id;
}

/**
 * Add bot response to history
 * @param {string} userId - User ID
 * @param {string} response - Bot response text
 * @param {string} operation - Operation type
 * @param {Object} result - Operation result (calculation results, AI response, etc.)
 * @param {string} inputId - ID of the corresponding user input
 */
export function addBotResponseToHistory(userId, response, operation, result = {}, inputId = null) {
  const session = getUserSession(userId);

  const historyEntry = {
    id: generateHistoryId(),
    timestamp: Date.now(),
    type: 'BOT_RESPONSE',
    operation,
    response,
    result: {
      ...result,
      success: result.success !== undefined ? result.success : true
    },
    relatedInputId: inputId,
    metadata: {
      responseLength: response.length,
      hasImage: result.hasImage || false,
      hasCalculation: result.calculationType !== undefined
    }
  };

  session.history.push(historyEntry);

  // Keep only last 50 entries to prevent memory issues
  if (session.history.length > 50) {
    session.history = session.history.slice(-50);
  }

  console.log(`📝 [HISTORY] Added bot response for user ${userId}: ${operation}`);
  return historyEntry.id;
}

/**
 * Add exercise/example to history
 * @param {string} userId - User ID
 * @param {string} exerciseType - Type of exercise (e.g., 'dfa_example', 'nfa_example')
 * @param {Object} exercise - Exercise data (automaton, question, solution)
 * @param {string} trigger - What triggered the exercise (user question, menu selection)
 */
export function addExerciseToHistory(userId, exerciseType, exercise, trigger = 'user_request') {
  const session = getUserSession(userId);

  const historyEntry = {
    id: generateHistoryId(),
    timestamp: Date.now(),
    type: 'EXERCISE',
    exerciseType,
    exercise: {
      ...exercise,
      difficulty: exercise.difficulty || 'medium',
      topic: exercise.topic || exerciseType
    },
    trigger,
    metadata: {
      hasAutomaton: !!exercise.automaton,
      hasVisualization: !!exercise.imagePath,
      hasSteps: !!exercise.steps
    }
  };

  session.history.push(historyEntry);

  // Keep only last 50 entries
  if (session.history.length > 50) {
    session.history = session.history.slice(-50);
  }

  console.log(`📚 [HISTORY] Added exercise for user ${userId}: ${exerciseType}`);
  return historyEntry.id;
}

/**
 * Get user's conversation history
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of entries to return
 * @param {string} type - Filter by type ('USER_INPUT', 'BOT_RESPONSE', 'EXERCISE', or 'all')
 * @returns {Array} History entries
 */
export function getUserHistory(userId, limit = 20, type = 'all') {
  const session = getUserSession(userId);

  let history = [...session.history];

  // Filter by type if specified
  if (type !== 'all') {
    history = history.filter(entry => entry.type === type);
  }

  // Sort by timestamp (newest first) and limit
  return history
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Get conversation summary for user
 * @param {string} userId - User ID
 * @returns {Object} Conversation summary
 */
export function getConversationSummary(userId) {
  const session = getUserSession(userId);
  const history = session.history;

  const summary = {
    totalEntries: history.length,
    userInputs: history.filter(h => h.type === 'USER_INPUT').length,
    botResponses: history.filter(h => h.type === 'BOT_RESPONSE').length,
    exercises: history.filter(h => h.type === 'EXERCISE').length,
    operations: {},
    topics: {},
    lastActivity: session.lastActivity,
    sessionDuration: Date.now() - (history[0]?.timestamp || Date.now())
  };

  // Count operations and topics
  history.forEach(entry => {
    if (entry.operation) {
      summary.operations[entry.operation] = (summary.operations[entry.operation] || 0) + 1;
    }
    if (entry.exercise?.topic) {
      summary.topics[entry.exercise.topic] = (summary.topics[entry.exercise.topic] || 0) + 1;
    }
  });

  return summary;
}

/**
 * Generate unique history entry ID
 */
function generateHistoryId() {
  return `hist_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Clear user session
 * @param {string} userId - User ID
 */
export function clearUserSession(userId) {
  userSessions.delete(userId);
}

/**
 * Get all active sessions count
 * @returns {number} Number of active sessions
 */
export function getActiveSessionsCount() {
  return userSessions.size;
}

/**
 * Clean up old sessions (optional - for memory management)
 * @param {number} maxAge - Maximum age in milliseconds
 */
export function cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
  const now = Date.now();
  let cleanedCount = 0;

  for (const [userId, session] of userSessions.entries()) {
    if (session.lastActivity && (now - session.lastActivity) > maxAge) {
      userSessions.delete(userId);
      cleanedCount++;
      console.log(`🧹 [SESSION] Cleaned up old session for user ${userId}`);
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 [SESSION] Cleaned up ${cleanedCount} old sessions. Active sessions: ${userSessions.size}`);
  }

  return cleanedCount;
}

/**
 * Clean up stuck sessions (sessions waiting for input too long)
 * @param {number} maxWaitTime - Maximum wait time in milliseconds
 */
export function cleanupStuckSessions(maxWaitTime = 30 * 60 * 1000) { // 30 minutes
  const now = Date.now();
  let cleanedCount = 0;

  for (const [userId, session] of userSessions.entries()) {
    if (session.waitingFor && session.lastActivity && (now - session.lastActivity) > maxWaitTime) {
      session.waitingFor = null;
      session.lastActivity = now;
      cleanedCount++;
      console.log(`🔄 [SESSION] Cleared stuck session for user ${userId} (was waiting for: ${session.waitingFor})`);
    }
  }

  if (cleanedCount > 0) {
    console.log(`🔄 [SESSION] Cleared ${cleanedCount} stuck sessions`);
  }

  return cleanedCount;
}

/**
 * Get session statistics for monitoring
 */
export function getSessionStats() {
  const stats = {
    totalSessions: userSessions.size,
    waitingSessions: 0,
    sessionsWithFA: 0,
    operationCounts: {}
  };

  for (const [userId, session] of userSessions.entries()) {
    if (session.waitingFor) {
      stats.waitingSessions++;
      stats.operationCounts[session.waitingFor] = (stats.operationCounts[session.waitingFor] || 0) + 1;
    }
    if (session.currentFA) {
      stats.sessionsWithFA++;
    }
  }

  return stats;
}

/**
 * Force clear a user's session (for debugging)
 */
export function forceResetUserSession(userId) {
  if (userSessions.has(userId)) {
    const oldSession = userSessions.get(userId);
    console.log(`🔧 [SESSION] Force resetting session for user ${userId}`, {
      wasWaitingFor: oldSession.waitingFor,
      hadFA: !!oldSession.currentFA
    });

    userSessions.set(userId, {
      currentFA: null,
      waitingFor: null,
      lastOperation: null,
      history: oldSession.history || [],
      lastActivity: Date.now()
    });

    return true;
  }
  return false;
}

/**
 * Validate session state and fix inconsistencies
 */
export function validateAndFixSession(userId) {
  const session = getUserSession(userId);
  let fixed = false;

  // Fix missing lastActivity
  if (!session.lastActivity) {
    session.lastActivity = Date.now();
    fixed = true;
  }

  // Fix missing history array
  if (!Array.isArray(session.history)) {
    session.history = [];
    fixed = true;
  }

  // Check for stuck waiting states (older than 1 hour)
  if (session.waitingFor && session.lastActivity &&
      (Date.now() - session.lastActivity) > 60 * 60 * 1000) {
    console.log(`🔄 [SESSION] Clearing stuck waiting state for user ${userId}: ${session.waitingFor}`);
    session.waitingFor = null;
    session.lastActivity = Date.now();
    fixed = true;
  }

  if (fixed) {
    console.log(`🔧 [SESSION] Fixed session inconsistencies for user ${userId}`);
  }

  return session;
}

/**
 * Safe session operation wrapper
 */
export function safeSessionOperation(userId, operation, operationName = 'unknown') {
  try {
    return operation(validateAndFixSession(userId));
  } catch (error) {
    console.error(`❌ [SESSION] Error in ${operationName} for user ${userId}:`, error);

    // Reset session on critical error
    forceResetUserSession(userId);
    return null;
  }
}
