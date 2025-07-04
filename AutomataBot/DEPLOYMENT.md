# Deployment Guide for Render.com 🚀

This guide will help you deploy your Enhanced Automata Bot to Render.com.

## Prerequisites ✅

Before deploying, make sure you have:
- [x] GitHub account with your bot code
- [x] Render.com account (free tier available)
- [x] Telegram Bot Token from @BotFather
- [x] MongoDB Atlas database (free tier available)
- [x] DeepSeek API Key: `sk-698124ba5ed24bcea3c8d298b73f2f52`

## Step-by-Step Deployment 📋

### 1. Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Enhanced Automata Bot with AI integration"
   git branch -M main
   git remote add origin https://github.com/yourusername/automata-bot.git
   git push -u origin main
   ```

2. **Verify Files**:
   - ✅ `bot.js` (main application)
   - ✅ `package.json` (with correct scripts)
   - ✅ `README.md` (documentation)
   - ✅ `render.yaml` (deployment config)
   - ❌ `.env` (should NOT be in repository)

### 2. Create MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Create database user
4. Get connection string
5. Replace `<password>` with your password
6. Whitelist all IPs (0.0.0.0/0) for Render

### 3. Deploy on Render.com

1. **Create Account**: Go to [render.com](https://render.com) and sign up

2. **New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your automata-bot repository

3. **Configure Service**:
   ```
   Name: enhanced-automata-bot
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables**:
   Add these in the Environment section:
   ```
   BOT_TOKEN=7649782967:AAHHly40Iw9tErvtWfQiRw9ScwUBBwNGQRk
   MONGODB_URI=mongodb+srv://ChoengRayu:C9r6nhxOVLCUkkGd@cluster0.2ott03t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   DEEPSEEK_API_KEY=sk-698124ba5ed24bcea3c8d298b73f2f52
   NODE_ENV=production
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for build and deployment (5-10 minutes)
   - Check logs for any errors

### 4. Verify Deployment ✅

1. **Check Logs**:
   - Look for "✅ Bot is running successfully!"
   - No error messages

2. **Test Bot**:
   - Open Telegram
   - Search for your bot
   - Send `/start`
   - Verify menu appears

3. **Test AI Features**:
   - Try "🧠 AI Help"
   - Ask: "Explain DFA minimization"
   - Verify AI responses work

## Troubleshooting 🔧

### Common Issues:

1. **Build Fails**:
   - Check `package.json` syntax
   - Verify all dependencies are listed
   - Check Node.js version compatibility

2. **Bot Doesn't Respond**:
   - Verify BOT_TOKEN is correct
   - Check webhook settings in Telegram
   - Review deployment logs

3. **Database Connection Fails**:
   - Verify MONGODB_URI format
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

4. **AI Features Don't Work**:
   - Verify DEEPSEEK_API_KEY is correct
   - Check API quota/limits
   - Review error logs for API issues

### Debug Commands:

```bash
# Check logs in Render dashboard
# Or use Render CLI:
render logs -s your-service-name
```

## Monitoring & Maintenance 📊

### Health Checks:
- Monitor response times in Render dashboard
- Check error rates and logs
- Monitor database connections

### Updates:
1. Push changes to GitHub
2. Render auto-deploys from main branch
3. Monitor deployment logs
4. Test functionality after updates

## Cost Optimization 💰

### Free Tier Limits:
- **Render**: 750 hours/month (enough for 24/7)
- **MongoDB Atlas**: 512MB storage
- **DeepSeek**: Check current API limits

### Scaling:
- Upgrade Render plan for more resources
- Use MongoDB paid tier for more storage
- Monitor API usage for DeepSeek

## Security Best Practices 🔒

1. **Environment Variables**:
   - Never commit `.env` to repository
   - Use Render's environment variable system
   - Rotate API keys regularly

2. **Database Security**:
   - Use strong passwords
   - Enable MongoDB authentication
   - Regular backups

3. **Bot Security**:
   - Validate all user inputs
   - Rate limiting (built into Telegraf)
   - Monitor for abuse

## Support & Resources 📚

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Telegraf Docs**: [telegraf.js.org](https://telegraf.js.org)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **DeepSeek API**: [platform.deepseek.com](https://platform.deepseek.com)

---

**Your Enhanced Automata Bot is now ready for deployment! 🎉**

After successful deployment, your bot will be available 24/7 to help users with automata theory, powered by AI assistance.
