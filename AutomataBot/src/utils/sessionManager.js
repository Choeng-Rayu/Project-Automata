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
  for (const [userId, session] of userSessions.entries()) {
    if (session.lastActivity && (now - session.lastActivity) > maxAge) {
      userSessions.delete(userId);
    }
  }
}
