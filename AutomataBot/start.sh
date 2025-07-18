#!/bin/bash

# Render.com startup script for Enhanced Automata Bot
echo "🚀 Starting Enhanced Automata Bot on Render.com..."

# Set NODE_ENV to production if not already set
export NODE_ENV=${NODE_ENV:-production}

# Verify required environment variables
if [ -z "$BOT_TOKEN" ]; then
    echo "❌ ERROR: BOT_TOKEN environment variable is required"
    exit 1
fi

if [ -z "$MONGODB_URI" ]; then
    echo "❌ ERROR: MONGODB_URI environment variable is required"
    exit 1
fi

if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "❌ ERROR: DEEPSEEK_API_KEY environment variable is required"
    exit 1
fi

echo "✅ Environment variables validated"
echo "🤖 Starting bot with Node.js..."

# Start the bot
exec node bot.js
