# 🚀 Render.com Webhook Deployment Guide

## Quick Deployment Steps

### 1. 📁 Push Your Code to GitHub

First, make sure your code is in a GitHub repository:

```bash
cd AutomataBot
git init
git add .
git commit -m "Initial commit for webhook deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. 🔗 Connect to Render.com

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub account
4. Select your repository: `Project-Automata` or your repository name
5. Set the **Root Directory** to: `AutomataBot`

### 3. ⚙️ Configure Deployment Settings

Render will auto-detect your `render.yaml` file, but verify these settings:

- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: `18.x` or higher

### 4. 🔐 Set Environment Variables

In the Render dashboard, add these environment variables:

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `BOT_TOKEN` | `7649782967:AAHHly40Iw9tErvtWfQiRw9ScwUBBwNGQRk` | Your current token |
| `MONGODB_URI` | `mongodb+srv://ChoengRayu:C9r6nhxOVLCUkkGd@cluster0.2ott03t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` | Your current MongoDB |
| `DEEPSEEK_API_KEY` | `sk-698124ba5ed24bcea3c8d298b73f2f52` | Your current API key |
| `NODE_ENV` | `production` | Set automatically |
| `WEBHOOK_URL` | `https://enhanced-automata-bot.onrender.com` | Your Render app URL |

⚠️ **Important**: Replace `enhanced-automata-bot` with your actual Render service name!

### 5. 🚀 Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Start your bot with webhook support (`npm start`)
   - Provide a health check endpoint at `/health`

### 6. 🌐 Configure Webhook URL

After deployment, update the `WEBHOOK_URL` environment variable:

1. Go to your Render service dashboard
2. Copy your service URL (e.g., `https://your-service-name.onrender.com`)
3. Update the `WEBHOOK_URL` environment variable with this URL
4. Redeploy the service

### 7. ✅ Verify Deployment

Once deployed, you should see:
- ✅ **Deploy Status**: "Live"
- ✅ **Health Check**: Passing at `https://your-app.onrender.com/health`
- ✅ **Webhook**: Active at `https://your-app.onrender.com/webhook/YOUR_BOT_TOKEN`
- ✅ **Bot Status**: Active in Telegram

## 🔧 Webhook Management

### Automatic Setup
The bot automatically sets up the webhook when starting in production mode.

### Manual Webhook Commands
If you need to manually manage webhooks:

```bash
# Set webhook (done automatically on startup)
npm run webhook:set

# Check current webhook status
npm run webhook:info

# Delete webhook (switch to polling for development)
npm run webhook:delete
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**: Check that `AutomataBot` is set as root directory
2. **Bot Not Responding**: 
   - Verify all environment variables are set correctly
   - Check that `WEBHOOK_URL` matches your Render service URL
   - Ensure webhook is properly registered with Telegram
3. **Health Check Fails**: Ensure the health endpoint is accessible
4. **Webhook Issues**: Check logs for webhook registration errors

### Debugging Webhooks

1. **Check webhook status**:
   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
   ```

2. **Test health endpoint**:
   ```bash
   curl https://your-app.onrender.com/health
   ```

3. **View Render logs**:
   - Go to Render dashboard → Your service → Logs tab
   - Look for webhook setup messages and any errors

### Development vs Production

- **Development**: Uses polling (long polling to Telegram servers)
- **Production**: Uses webhooks (Telegram sends updates to your server)

The bot automatically detects the environment via `NODE_ENV`.

## 📊 Monitoring

Render provides:
- **Health Checks**: Automatic monitoring at `/health`
- **Webhook Endpoint**: Telegram updates at `/webhook/<bot_token>`
- **Logs**: Real-time application logs
- **Metrics**: Performance and uptime statistics
- **Alerts**: Email notifications for issues

## 🔄 Updates

To update your deployed bot:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update bot features"
   git push
   ```
3. Render will automatically redeploy with webhook support

## 💰 Pricing

- **Free Tier**: 750 hours/month (sufficient for most bots)
- **Paid Tier**: $7/month for always-on service

## 🆘 Support

If you encounter issues:
1. Check webhook status with `npm run webhook:info`
2. Review Render logs for webhook errors
3. Check Render documentation: [docs.render.com](https://docs.render.com)
4. Contact Render support

---

**Your webhook-enabled bot is now ready for production! 🎉**

### Key Benefits of Webhook Deployment:
- ⚡ **Instant Response**: No polling delay
- 💰 **Lower Resource Usage**: More efficient than polling
- 🔒 **Secure**: Direct HTTPS communication
- 📈 **Scalable**: Better for high-traffic bots
