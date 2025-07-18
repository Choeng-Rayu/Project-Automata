## algorithm/ dfaMinization.js
So, what does this file do?
Input: You give it a DFA (with states, transitions, etc.)
It finds which states are doing the same job (we call them "equivalent").
It merges them.
It builds a new, smaller DFA.
Output: It gives you back the minimized DFA.

## config/database.js
This JavaScript module handles MongoDB database operations for a DFA (Deterministic Finite Automaton) web application.

## handlers/commandHandlers.js
This file contains command handlers for a Telegram bot that teaches and assists users with finite automata theory through AI, visuals, and examples.

## handlers/MenuHandlers
You implemented 6 main interactive menu options that guide users through finite automata theory tasks,

## handlers/operationHandlers
This code implements the core backend logic for processing user inputs and automata operations for your Automata Bot. It covers parsing, validating, simulating, converting, minimizing, and session management.

## services/aiService
This module connects your bot to the DeepSeek AI API and provides powerful features for automata theory support, like answering questions, generating visual diagrams, and educational explanations.

## service/imageservice
This JavaScript module provides all the visual drawing logic for finite automata — including:
DFA/NFA diagrams
Comparison before vs. after (like DFA minimization)
Simulation steps
Highlighted transition paths.

## service/trainAI
Loads API config using dotenv (DEEPSEEK_API_KEY and DEEPSEEK_API_URL).
Defines team info (leader, members, project purpose).
Builds a system prompt that tells the AI how to behave (friendly, educational, expert in automata).
The prompt includes credit to all team member.

## utils/automataUntils
-- parseDFAInput(text)
Parses user text input into an automaton object with:
states (array)
alphabet (array)
transitions (array of {from, symbol, to})
startState (string)
finalStates (array)
Supports DFA and NFA inputs.

-- checkFAType(fa)
Checks if the automaton is a DFA or NFA by verifying if every state has exactly one transition per symbol (DFA requirement). Returns 'DFA' or 'NFA'.

-- simulateFA(fa, input)
Simulates the input string on the automaton, handling nondeterminism by tracking all current active states. Returns true if the input is accepted (any active state is final), else false.

-- nfaToDfa(nfa)
Converts an NFA to an equivalent DFA using subset construction:
Each DFA state corresponds to a set of NFA states.
Transitions computed for each symbol from those sets.
Tracks new sets until no new DFA states are found.
Returns the constructed DFA automaton object.

## utils/message
They format and structure messages sent to users in a clear, consistent, and user-friendly way. This ensures:
Automaton details are easy to read and understand.
Errors and suggestions are clearly communicated.
Help, learning content, and AI responses have consistent styling.
Large or complex info is broken down to fit messaging platform limits.
Simulation and test results are presented with clarity.
User history summaries are organized and informative.

## utils/sessionManager
This session management code's main purpose is to store and manage user-specific data during interactions with the automata bot. It enables:
Tracking each user’s current automaton, operation state, and history
Maintaining multi-step workflows by remembering what the bot is waiting for from the user
Updating session data dynamically as users proceed
Clearing sessions to free memory or reset state
Optionally cleaning up old sessions to avoid memory bloat
Providing utilities to query active sessions
Overall, it supports stateful, personalized conversations and smooth user experiences in the bot.

## bot.js
This bot is a powerful educational and practical tool for automata theory on Telegram, combining:
Classical automata algorithms (parse, check, simulate, convert, minimize)
AI-enhanced assistance and explanations
Rich user interface with command/menu support
Persistent user data and session tracking
Robust error handling and operational maintenance