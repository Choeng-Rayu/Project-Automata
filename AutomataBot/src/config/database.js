// Database configuration and connection
import { MongoClient } from 'mongodb';

let db;

/**
 * Connect to MongoDB database
 * @returns {Promise<Db>} Database instance
 */
export async function connectDB() {
  if (db) return db;
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Save operation to database
 * @param {string} userId - User ID
 * @param {Object} input - Input automaton
 * @param {Object} output - Output automaton
 * @param {string} operation - Operation type
 */
export async function saveToDatabase(userId, input, output, operation) {
  try {
    const database = await connectDB();
    await database.collection('dfa_minimizations').insertOne({
      user: userId,
      input: input,
      output: output,
      operation: operation,
      date: new Date()
    });
    console.log(`💾 Saved ${operation} operation for user ${userId}`);
  } catch (error) {
    console.error('❌ Database save error:', error);
  }
}

/**
 * Get user history from database
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to retrieve
 * @returns {Promise<Array>} User history
 */
export async function getUserHistory(userId, limit = 5) {
  try {
    const database = await connectDB();
    const history = await database.collection('dfa_minimizations')
      .find({ user: userId })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
    return history;
  } catch (error) {
    console.error('❌ Database query error:', error);
    return [];
  }
}
