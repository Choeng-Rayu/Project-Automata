// Telegram Bot for DFA Minimization
import dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';
import { MongoClient } from 'mongodb';

const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

const bot = new Telegraf(BOT_TOKEN);
let db;

// DFA Minimization Logic (adapted from React)
function minimizeDFA(dfa) {
  const { states, alphabet, transitions, startState, finalStates } = dfa;
  let P = [new Set(finalStates), new Set(states.filter(s => !finalStates.includes(s)))];
  let W = [new Set(finalStates)];
  const setsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
  while (W.length > 0) {
    const A = W.pop();
    for (let symbol of alphabet) {
      const X = new Set();
      for (let { from, symbol: sym, to } of transitions) {
        if (sym === symbol && A.has(to)) X.add(from);
      }
      for (let Y of P.slice()) {
        const intersection = new Set([...Y].filter(x => X.has(x)));
        const difference = new Set([...Y].filter(x => !X.has(x)));
        if (intersection.size > 0 && difference.size > 0) {
          P = P.filter(s => !setsEqual(s, Y));
          P.push(intersection, difference);
          if (W.some(set => setsEqual(set, Y))) {
            W = W.filter(set => !setsEqual(set, Y));
            W.push(intersection, difference);
          } else {
            if (intersection.size <= difference.size) {
              W.push(intersection);
            } else {
              W.push(difference);
            }
          }
        }
      }
    }
  }
  const stateMap = new Map();
  P.forEach((set, i) => set.forEach(s => stateMap.set(s, `q${i}`)));
  const newStates = P.map((_, i) => `q${i}`);
  const startStatePartition = P.findIndex(set => set.has(startState));
  const newStartState = `q0`;
  const remappedStates = newStates.map((state, index) => {
    if (index === startStatePartition) return `q0`;
    return `q${index < startStatePartition ? index + 1 : index}`;
  });
  const remappedStateMap = new Map();
  remappedStates.forEach((state, index) => {
    stateMap.forEach((mappedState, originalState) => {
      if (mappedState === `q${index}`) {
        remappedStateMap.set(originalState, state);
      }
    });
  });
  const newFinalStates = P.reduce((acc, set, i) => {
    if ([...set].some(s => finalStates.includes(s))) {
      acc.push(remappedStates[i]);
    }
    return acc;
  }, []);
  const newTransitionsSet = new Set();
  P.forEach((set, i) => {
    set.forEach(s => {
      alphabet.forEach(symbol => {
        const transition = transitions.find(t => t.from === s && t.symbol === symbol);
        if (transition) {
          const newFrom = remappedStateMap.get(s);
          const newTo = remappedStateMap.get(transition.to);
          if (newFrom && newTo) {
            newTransitionsSet.add(`${newFrom},${symbol},${newTo}`);
          }
        }
      });
    });
  });
  const newTransitions = Array.from(newTransitionsSet).map(t => {
    const [from, symbol, to] = t.split(',');
    return { from, symbol, to };
  });
  return {
    states: remappedStates,
    alphabet,
    transitions: newTransitions,
    startState: newStartState,
    finalStates: newFinalStates
  };
}

// Parse DFA input from user text
function parseDFAInput(text) {
  // Expected format:
  // States: q0,q1,q2\nAlphabet: 0,1\nTransitions: q0,0,q1\nq0,1,q2\n...\nStart: q0\nFinal: q2
  const lines = text.split('\n');
  let states = [], alphabet = [], transitions = [], startState = '', finalStates = [];
  for (let line of lines) {
    if (line.startsWith('States:')) states = line.replace('States:', '').split(',').map(s => s.trim());
    else if (line.startsWith('Alphabet:')) alphabet = line.replace('Alphabet:', '').split(',').map(s => s.trim());
    else if (line.startsWith('Transitions:')) {
      // transitions start from next lines
      const idx = lines.indexOf(line);
      for (let t of lines.slice(idx + 1)) {
        if (t.startsWith('Start:') || t.startsWith('Final:')) break;
        const [from, symbol, to] = t.split(',').map(s => s.trim());
        if (from && symbol && to) transitions.push({ from, symbol, to });
      }
    }
    else if (line.startsWith('Start:')) startState = line.replace('Start:', '').trim();
    else if (line.startsWith('Final:')) finalStates = line.replace('Final:', '').split(',').map(s => s.trim());
  }
  return { states, alphabet, transitions, startState, finalStates };
}

// MongoDB connection
async function connectDB() {
  if (db) return db;
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  await client.connect();
  db = client.db();
  return db;
}

// FA Type Checker
function checkFAType(fa) {
  // DFA: exactly one transition for each symbol from each state
  // NFA: may have multiple or missing transitions for a symbol from a state
  const { states, alphabet, transitions } = fa;
  const transitionMap = {};
  for (const state of states) {
    transitionMap[state] = {};
  }
  for (const t of transitions) {
    if (!transitionMap[t.from][t.symbol]) {
      transitionMap[t.from][t.symbol] = [];
    }
    transitionMap[t.from][t.symbol].push(t.to);
  }
  for (const state of states) {
    for (const symbol of alphabet) {
      const targets = transitionMap[state][symbol] || [];
      if (targets.length !== 1) return 'NFA';
    }
  }
  return 'DFA';
}

// NFA to DFA conversion (subset construction)
function nfaToDfa(nfa) {
  const { states, alphabet, transitions, startState, finalStates } = nfa;
  const getTargets = (stateSet, symbol) => {
    const targets = new Set();
    for (const state of stateSet) {
      for (const t of transitions) {
        if (t.from === state && t.symbol === symbol) {
          targets.add(t.to);
        }
      }
    }
    return Array.from(targets);
  };
  const dfaStates = [];
  const dfaTransitions = [];
  const dfaFinalStates = [];
  const stateMap = {};
  let queue = [];
  const startSet = [startState];
  queue.push(startSet);
  stateMap[startSet.join(',')] = 'Q0';
  dfaStates.push('Q0');
  if (startSet.some(s => finalStates.includes(s))) dfaFinalStates.push('Q0');
  let stateCount = 1;
  while (queue.length > 0) {
    const currentSet = queue.shift();
    const currentName = stateMap[currentSet.join(',')];
    for (const symbol of alphabet) {
      const targetSet = getTargets(currentSet, symbol);
      if (targetSet.length === 0) continue;
      const key = targetSet.sort().join(',');
      if (!stateMap[key]) {
        stateMap[key] = `Q${stateCount++}`;
        dfaStates.push(stateMap[key]);
        if (targetSet.some(s => finalStates.includes(s))) dfaFinalStates.push(stateMap[key]);
        queue.push(targetSet);
      }
      dfaTransitions.push({ from: currentName, symbol, to: stateMap[key] });
    }
  }
  return {
    states: dfaStates,
    alphabet,
    transitions: dfaTransitions,
    startState: 'Q0',
    finalStates: dfaFinalStates
  };
}

// Simulate input string on FA (works for DFA and NFA)
function simulateFA(fa, input) {
  const { states, alphabet, transitions, startState, finalStates } = fa;
  let currentStates = new Set([startState]);
  for (const symbol of input) {
    const nextStates = new Set();
    for (const state of currentStates) {
      for (const t of transitions) {
        if (t.from === state && t.symbol === symbol) {
          nextStates.add(t.to);
        }
      }
    }
    currentStates = nextStates;
    if (currentStates.size === 0) break;
  }
  for (const state of currentStates) {
    if (finalStates.includes(state)) return true;
  }
  return false;
}

// Add main menu with buttons
bot.start((ctx) => {
  ctx.reply(
    'Welcome to the Finite Automata Bot!\nChoose an action or send your automaton definition:',
    {
      reply_markup: {
        keyboard: [
          [{ text: 'Design FA' }],
          [{ text: 'Test Input String' }],
          [{ text: 'Check FA Type' }],
          [{ text: 'Convert NFA to DFA' }],
          [{ text: 'Minimize DFA' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    }
  );
});

// Handle button presses
bot.hears('Design FA', (ctx) => {
  ctx.reply('Send your automaton definition in this format:\nStates: q0,q1\nAlphabet: 0,1\nTransitions:\nq0,0,q1\n...\nStart: q0\nFinal: q1');
});
bot.hears('Test Input String', (ctx) => {
  ctx.reply('To test an input string, use:\n/simulate <input string>\n<FA definition>');
});
bot.hears('Check FA Type', (ctx) => {
  ctx.reply('To check FA type, use:\n/type\n<FA definition>');
});
bot.hears('Convert NFA to DFA', (ctx) => {
  ctx.reply('To convert NFA to DFA, use:\n/nfa2dfa\n<NFA definition>');
});
bot.hears('Minimize DFA', (ctx) => {
  ctx.reply('To minimize a DFA, just send the DFA definition as a message.');
});

// Bot command: handle DFA input
bot.on('text', async (ctx) => {
  try {
    const dfa = parseDFAInput(ctx.message.text);
    if (!dfa.states.length || !dfa.alphabet.length || !dfa.transitions.length || !dfa.startState || !dfa.finalStates.length) {
      ctx.reply('Invalid DFA format. Please follow the example.');
      return;
    }
    const minimized = minimizeDFA(dfa);
    // Save to MongoDB
    const database = await connectDB();
    await database.collection('dfa_minimizations').insertOne({ user: ctx.from.id, input: dfa, minimized, date: new Date() });
    // Reply with minimized DFA
    let reply = 'Minimized DFA:\n';
    reply += `States: ${minimized.states.join(', ')}\n`;
    reply += `Alphabet: ${minimized.alphabet.join(', ')}\n`;
    reply += 'Transitions:\n';
    minimized.transitions.forEach(t => {
      reply += `${t.from},${t.symbol},${t.to}\n`;
    });
    reply += `Start: ${minimized.startState}\n`;
    reply += `Final: ${minimized.finalStates.join(', ')}\n`;
    ctx.reply(reply);
  } catch (e) {
    ctx.reply('Error processing DFA. Please check your input.');
  }
});

// Bot command: /type - check FA type
bot.command('type', (ctx) => {
  try {
    const fa = parseDFAInput(ctx.message.text.replace('/type', '').trim());
    const type = checkFAType(fa);
    ctx.reply(`This automaton is a ${type}.`);
  } catch (e) {
    ctx.reply('Error checking FA type.');
  }
});

// Bot command: /nfa2dfa - convert NFA to DFA
bot.command('nfa2dfa', (ctx) => {
  try {
    const nfa = parseDFAInput(ctx.message.text.replace('/nfa2dfa', '').trim());
    const dfa = nfaToDfa(nfa);
    let reply = 'Converted DFA:\n';
    reply += `States: ${dfa.states.join(', ')}\n`;
    reply += `Alphabet: ${dfa.alphabet.join(', ')}\n`;
    reply += 'Transitions:\n';
    dfa.transitions.forEach(t => {
      reply += `${t.from},${t.symbol},${t.to}\n`;
    });
    reply += `Start: ${dfa.startState}\n`;
    reply += `Final: ${dfa.finalStates.join(', ')}\n`;
    ctx.reply(reply);
  } catch (e) {
    ctx.reply('Error converting NFA to DFA.');
  }
});

// Bot command: /simulate - test input string
bot.command('simulate', (ctx) => {
  try {
    // Format: /simulate <input string>\n<FA definition>
    const lines = ctx.message.text.split('\n');
    const input = lines[0].replace('/simulate', '').trim();
    const fa = parseDFAInput(lines.slice(1).join('\n'));
    const accepted = simulateFA(fa, input);
    ctx.reply(accepted ? 'Accepted.' : 'Rejected.');
  } catch (e) {
    ctx.reply('Error simulating input string.');
  }
});

// Start the bot
bot.launch();