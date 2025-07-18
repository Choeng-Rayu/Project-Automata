# 🚀 Render.com Deployment Guide

## Quick Deployment Steps

### 1. 📁 Push Your Code to GitHub

First, make sure your code is in a GitHub repository:

```bash
cd AutomataBot
git init
git add .
git commit -m "Initial commit for deployment"
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
| `PORT` | `10000` | Render default (auto-set) |

### 5. 🚀 Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Start your bot (`npm start`)
   - Provide a health check endpoint at `/health`

### 6. ✅ Verify Deployment

Once deployed, you should see:
- ✅ **Deploy Status**: "Live"
- ✅ **Health Check**: Passing at `https://your-app.onrender.com/health`
- ✅ **Bot Status**: Active in Telegram

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**: Check that `AutomataBot` is set as root directory
2. **Bot Not Responding**: Verify all environment variables are set correctly
3. **Health Check Fails**: Ensure the health endpoint is accessible

### Logs

View logs in Render dashboard:
- Go to your service
- Click **"Logs"** tab
- Look for startup messages and any errors

### Test Your Bot

1. Open Telegram
2. Search for your bot
3. Send `/start` command
4. Verify all features work correctly

## 📊 Monitoring

Render provides:
- **Health Checks**: Automatic monitoring at `/health`
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
3. Render will automatically redeploy

## 💰 Pricing

- **Free Tier**: 750 hours/month (sufficient for most bots)
- **Paid Tier**: $7/month for always-on service

## 🆘 Support

If you encounter issues:
1. Check Render documentation: [docs.render.com](https://docs.render.com)
2. Contact Render support
3. Review bot logs for specific errors

---

**Your bot is now ready for production! 🎉**
