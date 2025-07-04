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
    userSessions.set(userId, {
      currentFA: null,
      waitingFor: null,
      lastOperation: null,
      history: []
    });
  }
  return userSessions.get(userId);
}

/**
 * Update user session
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 */
export function updateUserSession(userId, updates) {
  const session = getUserSession(userId);
  Object.assign(session, updates);
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
