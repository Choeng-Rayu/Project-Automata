#!/usr/bin/env node

/**
 * Webhook Setup Script for Render.com Deployment
 * This script helps set up the webhook URL with Telegram after deployment
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://enhanced-automata-bot.onrender.com';
const WEBHOOK_PATH = `/webhook/${BOT_TOKEN}`;
const FULL_WEBHOOK_URL = `${WEBHOOK_URL}${WEBHOOK_PATH}`;

async function setupWebhook() {
  console.log('🔧 Setting up Telegram webhook...');
  console.log(`📡 Webhook URL: ${FULL_WEBHOOK_URL}`);
  
  try {
    // Set webhook
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: FULL_WEBHOOK_URL,
      drop_pending_updates: true
    });
    
    if (response.data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log('📊 Response:', response.data);
    } else {
      console.error('❌ Failed to set webhook:', response.data);
    }
    
    // Get webhook info
    const infoResponse = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    console.log('📋 Current webhook info:');
    console.log(JSON.stringify(infoResponse.data.result, null, 2));
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

async function deleteWebhook() {
  console.log('🗑️ Deleting webhook (switching to polling)...');
  
  try {
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    
    if (response.data.ok) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.error('❌ Failed to delete webhook:', response.data);
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'set':
    setupWebhook();
    break;
  case 'delete':
    deleteWebhook();
    break;
  case 'info':
    axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
      .then(response => {
        console.log('📋 Current webhook info:');
        console.log(JSON.stringify(response.data.result, null, 2));
      })
      .catch(error => {
        console.error('❌ Error getting webhook info:', error.message);
      });
    break;
  default:
    console.log('Usage:');
    console.log('  node webhook-setup.js set    - Set webhook URL');
    console.log('  node webhook-setup.js delete - Delete webhook (use polling)');
    console.log('  node webhook-setup.js info   - Get current webhook info');
    break;
}
