# 🛠️ Telegram Bot Deployment Troubleshooting Guide

## Issues Fixed:
1. **render.yaml** - Removed duplicate service configuration and fixed webhook URL
2. **bot.js** - Updated webhook URL to match correct Render service URL 
3. **webhook-setup.js** - Already had correct configuration

## Common Issues & Solutions:

### 1. Bot Not Responding After Deployment

**Symptoms:**
- Bot doesn't respond to messages
- No errors in Render logs
- Health check passes

**Root Causes:**
- Incorrect webhook URL
- Webhook not registered with Telegram
- Environment variables not set

**Solutions:**

#### Step 1: Verify Environment Variables
Make sure these are set in your Render dashboard:
- `BOT_TOKEN` - Your Telegram bot token
- `MONGODB_URI` - Your MongoDB connection string
- `DEEPSEEK_API_KEY` - Your DeepSeek API key
- `WEBHOOK_URL` - Should be `https://your-service-name.onrender.com`
- `NODE_ENV` - Set to `production`

#### Step 2: Check Webhook Configuration
Run the verification script:
```bash
npm run verify
```

#### Step 3: Fix Webhook (if needed)
```bash
npm run webhook:set
```

#### Step 4: Test Bot Connection
```bash
node verify-deployment.js
```

#### Step 5: Fix Webhook Manually (if needed)
```bash
node verify-deployment.js fix
```

### 2. Environment Variables Issues

**Check in Render Dashboard:**
1. Go to your service
2. Click "Environment" tab
3. Verify all variables are set
4. Click "Deploy" to apply changes

### 3. Webhook URL Mismatch

**Correct Format:**
- Service URL: `https://your-service-name.onrender.com`
- Webhook URL: `https://your-service-name.onrender.com/webhook/YOUR_BOT_TOKEN`

**Update render.yaml:**
```yaml
envVars:
  - key: WEBHOOK_URL
    value: https://your-actual-service-name.onrender.com
```

### 4. Service Name Mismatch

**Important:** Your Render service name must match the webhook URL.

If your service is named `project-automata`, your webhook URL should be:
`https://project-automata.onrender.com`

If your service is named `enhanced-automata-bot`, your webhook URL should be:
`https://enhanced-automata-bot.onrender.com`

### 5. Health Check Issues

**Symptoms:**
- Service keeps restarting
- Health check fails

**Solution:**
The health endpoint `/health` should return a 200 status. This is already implemented in bot.js.

### 6. Database Connection Issues

**Symptoms:**
- Bot responds but can't save data
- MongoDB connection errors

**Solution:**
1. Check MongoDB Atlas connection string
2. Ensure IP whitelist includes 0.0.0.0/0 for Render
3. Verify database name and credentials

### 7. DeepSeek API Issues

**Symptoms:**
- Bot responds but AI features don't work
- API key errors

**Solution:**
1. Check DeepSeek API key is correct
2. Verify API quota/billing
3. Test API connection: `node verify-deployment.js`

## Quick Fix Commands:

```bash
# 1. Verify everything
node verify-deployment.js

# 2. Fix webhook
node verify-deployment.js fix

# 3. Check webhook info
npm run webhook:info

# 4. Set webhook manually
npm run webhook:set

# 5. Delete webhook (for testing)
npm run webhook:delete
```

## Manual Telegram API Test:

If all else fails, test the webhook manually:

1. **Get webhook info:**
```bash
curl "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getWebhookInfo"
```

2. **Set webhook manually:**
```bash
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-service-name.onrender.com/webhook/{YOUR_BOT_TOKEN}"}'
```

3. **Test your health endpoint:**
```bash
curl "https://your-service-name.onrender.com/health"
```

## Final Checklist:

- [ ] All environment variables set in Render
- [ ] Service name matches webhook URL
- [ ] Webhook registered with Telegram
- [ ] Health endpoint responding
- [ ] Database connection working
- [ ] DeepSeek API working
- [ ] No errors in Render logs

## Still Having Issues?

1. Check Render logs for detailed error messages
2. Ensure your service is fully deployed (not building)
3. Try redeploying the service
4. Contact support if webhook registration consistently fails

## Service URL Examples:

- If service name is `project-automata`: `https://project-automata.onrender.com`
- If service name is `enhanced-automata-bot`: `https://enhanced-automata-bot.onrender.com`
- If service name is `my-bot`: `https://my-bot.onrender.com`

Make sure your `WEBHOOK_URL` environment variable matches your actual service URL!
