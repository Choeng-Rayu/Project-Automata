#!/usr/bin/env node

/**
 * Deployment Verification Script
 * This script verifies all aspects of the bot deployment
 */

import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { connectDB } from './src/config/database.js';
import axios from 'axios';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://enhanced-automata-bot.onrender.com';
const MONGODB_URI = process.env.MONGODB_URI;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

console.log('🔍 AutomataBot Deployment Verification');
console.log('=====================================');

async function verifyEnvironmentVariables() {
  console.log('\n1. 📋 Environment Variables Check:');
  console.log('   BOT_TOKEN:', BOT_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('   WEBHOOK_URL:', WEBHOOK_URL ? '✅ Set' : '❌ Missing');
  console.log('   MONGODB_URI:', MONGODB_URI ? '✅ Set' : '❌ Missing');
  console.log('   DEEPSEEK_API_KEY:', DEEPSEEK_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('   PORT:', process.env.PORT || '3000');
  
  return BOT_TOKEN && WEBHOOK_URL && MONGODB_URI && DEEPSEEK_API_KEY;
}

async function verifyBotConnection() {
  console.log('\n2. 🤖 Bot Connection Test:');
  try {
    const bot = new Telegraf(BOT_TOKEN);
    const me = await bot.telegram.getMe();
    console.log('   ✅ Bot connected successfully');
    console.log('   Username:', me.username);
    console.log('   Name:', me.first_name);
    console.log('   ID:', me.id);
    return true;
  } catch (error) {
    console.error('   ❌ Bot connection failed:', error.message);
    return false;
  }
}

async function verifyWebhookStatus() {
  console.log('\n3. 📡 Webhook Status Check:');
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const info = response.data.result;
    
    console.log('   Current webhook URL:', info.url || 'Not set');
    console.log('   Has custom certificate:', info.has_custom_certificate);
    console.log('   Pending updates:', info.pending_update_count);
    console.log('   Last error:', info.last_error_message || 'None');
    console.log('   Last error date:', info.last_error_date ? new Date(info.last_error_date * 1000) : 'None');
    
    const expectedUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    if (info.url === expectedUrl) {
      console.log('   ✅ Webhook URL is correct');
      return true;
    } else {
      console.log('   ❌ Webhook URL mismatch');
      console.log('   Expected:', expectedUrl);
      console.log('   Actual:', info.url);
      return false;
    }
  } catch (error) {
    console.error('   ❌ Webhook check failed:', error.message);
    return false;
  }
}

async function verifyDatabaseConnection() {
  console.log('\n4. 🗄️ Database Connection Test:');
  try {
    await connectDB();
    console.log('   ✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('   ❌ Database connection failed:', error.message);
    return false;
  }
}

async function verifyDeepSeekAPI() {
  console.log('\n5. 🧠 DeepSeek API Test:');
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
      ],
      temperature: 0.7,
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ✅ DeepSeek API connected successfully');
    console.log('   Response:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('   ❌ DeepSeek API connection failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

async function verifyHealthEndpoint() {
  console.log('\n6. 🏥 Health Endpoint Test:');
  try {
    const response = await axios.get(`${WEBHOOK_URL}/health`);
    console.log('   ✅ Health endpoint responding');
    console.log('   Status:', response.data.status);
    console.log('   Service:', response.data.service);
    return true;
  } catch (error) {
    console.error('   ❌ Health endpoint failed:', error.message);
    return false;
  }
}

async function fixWebhook() {
  console.log('\n🔧 Attempting to fix webhook...');
  try {
    const bot = new Telegraf(BOT_TOKEN);
    const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    
    console.log('   Setting webhook to:', webhookUrl);
    await bot.telegram.setWebhook(webhookUrl);
    console.log('   ✅ Webhook set successfully');
    
    // Wait a moment then check
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const info = await bot.telegram.getWebhookInfo();
    console.log('   New webhook URL:', info.url);
    console.log('   Pending updates:', info.pending_update_count);
    
    return true;
  } catch (error) {
    console.error('   ❌ Failed to fix webhook:', error.message);
    return false;
  }
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'fix') {
    await fixWebhook();
    return;
  }
  
  console.log('Starting comprehensive verification...\n');
  
  const results = [];
  
  results.push(await verifyEnvironmentVariables());
  results.push(await verifyBotConnection());
  results.push(await verifyWebhookStatus());
  results.push(await verifyDatabaseConnection());
  results.push(await verifyDeepSeekAPI());
  results.push(await verifyHealthEndpoint());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Verification Summary:');
  console.log('========================');
  console.log(`Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your bot should be working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    console.log('\nCommon solutions:');
    console.log('1. Verify all environment variables are set in Render');
    console.log('2. Run: node verify-deployment.js fix');
    console.log('3. Check Render logs for deployment errors');
    console.log('4. Ensure your Render service URL is correct');
  }
}

main().catch(console.error);
