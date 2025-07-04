# 📝 Input Format Examples for Enhanced Automata Bot

This guide provides detailed examples of how to format your input for each type of operation supported by the bot.

## 📋 General Input Format

All automata should follow this structure:
```
States: [comma-separated list of states]
Alphabet: [comma-separated list of symbols]
Transitions:
[from_state,symbol,to_state]
[from_state,symbol,to_state]
...
Start: [start_state]
Final: [comma-separated list of final states]
```

---

## 🔄 **NFA to DFA Conversion Examples**

### Example 1: Simple NFA with ε-transitions (represented as multiple transitions)
**Use Case**: Convert NFA that accepts strings ending with "01"

**Input Format**:
```
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q0
q0,0,q1
q0,1,q0
q1,1,q2
q2,0,q2
q2,1,q2
Start: q0
Final: q2
```

**How to send**: 
1. Click "🔄 NFA→DFA" button
2. Send the above text exactly as formatted

### Example 2: NFA with multiple final states
**Use Case**: NFA that accepts strings containing "11" or "00"

**Input Format**:
```
States: q0,q1,q2,q3,q4
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q3
q1,0,q2
q1,1,q0
q2,0,q2
q2,1,q2
q3,0,q0
q3,1,q4
q4,0,q4
q4,1,q4
Start: q0
Final: q2,q4
```

---

## ⚡ **DFA Minimization Examples**

### Example 1: DFA that can be minimized
**Use Case**: DFA with redundant states

**Input Format**:
```
States: q0,q1,q2,q3,q4
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q2
q1,0,q3
q1,1,q4
q2,0,q4
q2,1,q3
q3,0,q3
q3,1,q3
q4,0,q4
q4,1,q4
Start: q0
Final: q3
```

**How to send**:
1. Click "⚡ Minimize DFA" button
2. Send the above text

### Example 2: Already minimal DFA
**Use Case**: DFA that accepts even number of 1s

**Input Format**:
```
States: q0,q1
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q1
q1,0,q1
q1,1,q0
Start: q0
Final: q0
```

---

## 🔍 **Check FA Type Examples**

### Example 1: Deterministic FA (DFA)
**Input Format**:
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

**How to send**:
1. Click "🔍 Check FA Type" button
2. Send the above text
3. Bot will respond: "This automaton is a DFA"

### Example 2: Nondeterministic FA (NFA)
**Input Format**:
```
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q0
q0,1,q1
q1,0,q2
Start: q0
Final: q2
```

**Expected Response**: "This automaton is a NFA"

---

## 🧪 **Test Input String Examples**

### Step 1: First define an automaton
**Click "🔧 Design FA" and send**:
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

### Step 2: Test strings
**Click "🧪 Test Input" and send one of these**:
- `00` → Should be ACCEPTED
- `01` → Should be REJECTED  
- `100` → Should be ACCEPTED
- `11` → Should be REJECTED
- `0101` → Should be REJECTED

---

## 🔧 **Design FA Examples**

### Example 1: DFA accepting strings with even number of 0s
**Input Format**:
```
States: even,odd
Alphabet: 0,1
Transitions:
even,0,odd
even,1,even
odd,0,even
odd,1,odd
Start: even
Final: even
```

### Example 2: DFA accepting strings ending with "01"
**Input Format**:
```
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q0
q1,0,q1
q1,1,q2
q2,0,q1
q2,1,q0
Start: q0
Final: q2
```

### Example 3: DFA accepting strings containing "101"
**Input Format**:
```
States: q0,q1,q2,q3
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q1
q1,0,q2
q1,1,q1
q2,0,q0
q2,1,q3
q3,0,q3
q3,1,q3
Start: q0
Final: q3
```

---

## 🎯 **Common Use Cases with Examples**

### 1. **Binary strings with specific patterns**

**Strings ending with "11"**:
```
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q1
q1,0,q0
q1,1,q2
q2,0,q0
q2,1,q2
Start: q0
Final: q2
```

**Strings with odd length**:
```
States: even,odd
Alphabet: 0,1
Transitions:
even,0,odd
even,1,odd
odd,0,even
odd,1,even
Start: even
Final: odd
```

### 2. **Mathematical properties**

**Even number of 1s**:
```
States: even,odd
Alphabet: 0,1
Transitions:
even,0,even
even,1,odd
odd,0,odd
odd,1,even
Start: even
Final: even
```

**Divisible by 3 (binary numbers)**:
```
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q0
q0,1,q1
q1,0,q2
q1,1,q0
q2,0,q1
q2,1,q2
Start: q0
Final: q0
```

---

## 💡 **Tips for Success**

### ✅ **Do's**:
- Use exact format with colons and commas
- Put each transition on a separate line
- Use consistent state names
- Include all required sections

### ❌ **Don'ts**:
- Don't use spaces in state names (use q0, not "q 0")
- Don't forget the "Start:" and "Final:" lines
- Don't mix up the order of from,symbol,to in transitions
- Don't use undefined states in transitions

### 🔧 **Troubleshooting**:
- If you get "Invalid Format" error, check for typos
- Make sure all states in transitions are defined in States line
- Verify alphabet symbols match those used in transitions
- Ask the bot: "Show me an example automaton" for help

---

## 🤖 **AI-Powered Help**

You can also ask the bot in natural language:
- "How do I create a DFA that accepts even number of 1s?"
- "Show me an example of NFA to DFA conversion"
- "What's the format for defining transitions?"
- "Give me a practice problem"

The bot will provide step-by-step guidance and examples!
