#!/usr/bin/env node

/**
 * Simple Webhook Test Script
 * Test webhook connection without complex imports
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://enhanced-automata-bot.onrender.com';

console.log('🔍 Simple Webhook Test');
console.log('=====================');
console.log('Bot Token:', BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : '❌ Not set');
console.log('Webhook URL:', WEBHOOK_URL);
console.log('');

async function testBot() {
  console.log('1. 🤖 Testing bot connection...');
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    if (response.data.ok) {
      console.log('   ✅ Bot connected successfully');
      console.log('   Username:', response.data.result.username);
      console.log('   Name:', response.data.result.first_name);
    } else {
      console.log('   ❌ Bot connection failed');
    }
  } catch (error) {
    console.log('   ❌ Bot connection error:', error.message);
  }
}

async function checkWebhook() {
  console.log('\n2. 📡 Checking webhook status...');
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const info = response.data.result;
    
    console.log('   Current webhook URL:', info.url || 'Not set');
    console.log('   Pending updates:', info.pending_update_count);
    console.log('   Last error:', info.last_error_message || 'None');
    
    const expectedUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    if (info.url === expectedUrl) {
      console.log('   ✅ Webhook URL is correct');
    } else {
      console.log('   ❌ Webhook URL mismatch');
      console.log('   Expected:', expectedUrl);
      console.log('   Actual:', info.url);
    }
  } catch (error) {
    console.log('   ❌ Webhook check error:', error.message);
  }
}

async function fixWebhook() {
  console.log('\n3. 🔧 Setting webhook...');
  try {
    const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: webhookUrl,
      drop_pending_updates: true
    });
    
    if (response.data.ok) {
      console.log('   ✅ Webhook set successfully');
    } else {
      console.log('   ❌ Failed to set webhook:', response.data);
    }
  } catch (error) {
    console.log('   ❌ Webhook setup error:', error.message);
  }
}

async function testHealth() {
  console.log('\n4. 🏥 Testing health endpoint...');
  try {
    const response = await axios.get(`${WEBHOOK_URL}/health`);
    console.log('   ✅ Health endpoint responding');
    console.log('   Status:', response.data.status);
  } catch (error) {
    console.log('   ❌ Health endpoint error:', error.message);
  }
}

async function main() {
  if (!BOT_TOKEN) {
    console.log('❌ BOT_TOKEN environment variable is required');
    return;
  }
  
  await testBot();
  await checkWebhook();
  await fixWebhook();
  await checkWebhook(); // Check again after fixing
  await testHealth();
  
  console.log('\n📋 Next Steps:');
  console.log('1. If webhook is not correct, check your Render service URL');
  console.log('2. Make sure WEBHOOK_URL environment variable matches your service URL');
  console.log('3. Test by sending a message to your bot');
  console.log('4. Check Render logs for any errors');
}

main().catch(console.error);
