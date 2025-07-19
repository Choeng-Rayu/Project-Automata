#!/usr/bin/env node

/**
 * Startup Verification Script
 * Verifies that all required environment variables are set and services are accessible
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

console.log('🔍 Verifying deployment environment...\n');

// Check required environment variables
const requiredVars = ['BOT_TOKEN', 'MONGODB_URI', 'DEEPSEEK_API_KEY'];
let allVarsPresent = true;

console.log('📋 Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allVarsPresent = false;
  }
});

console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`✅ PORT: ${process.env.PORT || 3000}`);
console.log(`✅ WEBHOOK_URL: ${process.env.WEBHOOK_URL || 'Not set'}\n`);

if (!allVarsPresent) {
  console.error('❌ Some required environment variables are missing!');
  process.exit(1);
}

// Test Telegram API connectivity
async function testTelegramAPI() {
  console.log('🤖 Testing Telegram API connectivity...');
  try {
    const response = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getMe`);
    if (response.data.ok) {
      console.log(`✅ Bot connected: @${response.data.result.username}`);
      return true;
    } else {
      console.error('❌ Telegram API error:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to Telegram API:', error.message);
    return false;
  }
}

// Test MongoDB connectivity
async function testMongoDB() {
  console.log('🗄️ Testing MongoDB connectivity...');
  try {
    // Simple connection test
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    await client.db().admin().ping();
    await client.close();
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Test DeepSeek API
async function testDeepSeekAPI() {
  console.log('🧠 Testing DeepSeek API...');
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.choices) {
      console.log('✅ DeepSeek API connected successfully');
      return true;
    } else {
      console.error('❌ DeepSeek API unexpected response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ DeepSeek API test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running connectivity tests...\n');
  
  const telegramOK = await testTelegramAPI();
  const mongoOK = await testMongoDB();
  const deepseekOK = await testDeepSeekAPI();
  
  console.log('\n📊 Test Results:');
  console.log(`🤖 Telegram API: ${telegramOK ? '✅ OK' : '❌ Failed'}`);
  console.log(`🗄️ MongoDB: ${mongoOK ? '✅ OK' : '❌ Failed'}`);
  console.log(`🧠 DeepSeek API: ${deepseekOK ? '✅ OK' : '❌ Failed'}`);
  
  if (telegramOK && mongoOK && deepseekOK) {
    console.log('\n🎉 All tests passed! Bot is ready to start.');
    return true;
  } else {
    console.log('\n❌ Some tests failed. Please check your configuration.');
    return false;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runAllTests };
