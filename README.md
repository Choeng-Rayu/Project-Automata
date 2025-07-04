# Enhanced Automata Bot 🤖

An AI-powered Telegram bot for finite automata theory with DeepSeek integration. This bot helps students and researchers work with Deterministic Finite Automata (DFA), Nondeterministic Finite Automata (NFA), and provides educational support through AI assistance.

## Features ✨

### Core Automata Operations
- 🔧 **Design FA**: Create and analyze finite automata
- 🧪 **Test Input Strings**: Simulate string processing on automata
- 🔍 **Check FA Type**: Determine if an automaton is DFA or NFA
- 🔄 **NFA to DFA Conversion**: Convert using subset construction
- ⚡ **DFA Minimization**: Optimize DFAs by reducing states

### AI-Powered Features
- 🧠 **AI Assistant**: Natural language explanations using DeepSeek AI
- 📚 **Interactive Learning**: Step-by-step tutorials and concept explanations
- 🎯 **Practice Problems**: AI-generated exercises with solutions
- 📊 **Visual Explanations**: Detailed step-by-step process explanations

### User Experience
- 💾 **History Tracking**: Save and retrieve previous work
- 🎨 **Intuitive Interface**: Easy-to-use menu system
- 📱 **Mobile Friendly**: Works seamlessly on all devices
- 🔒 **Secure**: Environment-based configuration

## Installation & Setup 🚀

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Telegram Bot Token
- DeepSeek API Key

### Local Development

1. **Clone and Install**
```bash
cd AutomataBot
npm install
```

2. **Environment Setup**
Create `.env` file:
```env
BOT_TOKEN=your_telegram_bot_token
MONGODB_URI=your_mongodb_connection_string
DEEPSEEK_API_KEY=your_deepseek_api_key
```

3. **Run the Bot**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Deployment on Render.com 🌐

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure all dependencies are in `package.json`
3. Set `"type": "module"` in `package.json`

### Step 2: Create Render Service
1. Go to [Render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### Step 3: Environment Variables
Add these environment variables in Render dashboard:
```
BOT_TOKEN=your_telegram_bot_token
MONGODB_URI=your_mongodb_connection_string
DEEPSEEK_API_KEY=sk-698124ba5ed24bcea3c8d298b73f2f52
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Your bot will be live!

## Usage Guide 📖

### Automaton Input Format
```
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q0
q1,0,q2
q1,1,q0
q2,0,q2
q2,1,q2
Start: q0
Final: q2
```

### Commands
- `/start` - Show main menu
- `/explain [topic]` - Get AI explanation
- `/example [type]` - Get example automata
- `/design [requirement]` - AI-assisted design
- `/practice` - Generate practice problems

### AI Questions Examples
- "Explain DFA minimization"
- "How do I design a DFA that accepts even number of 1s?"
- "What's the difference between DFA and NFA?"
- "Show me step-by-step NFA to DFA conversion"

## Project Structure 📁

```
AutomataBot/
├── bot.js              # Main bot implementation
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
├── README.md          # This file
└── node_modules/      # Dependencies
```

## Key Improvements Made 🔧

1. **AI Integration**: DeepSeek API for explanations and assistance
2. **Enhanced UX**: Better menu system and user flow
3. **Session Management**: Track user state and context
4. **Educational Features**: Learning mode and tutorials
5. **Error Handling**: Robust error management
6. **Deployment Ready**: Configured for Render.com

## Technologies Used 💻

- **Node.js**: Runtime environment
- **Telegraf**: Telegram bot framework
- **MongoDB**: Database for storing user data
- **DeepSeek AI**: AI-powered explanations
- **Axios**: HTTP client for API calls

## Contributing 🤝

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License 📄

MIT License - see LICENSE file for details

## Support 💬

For issues and questions:
- Create GitHub issue
- Contact via Telegram: @YourUsername

---

**Made with ❤️ for automata theory education**
