# 🚀 Quick Reference - Input Formats

## 📝 **Basic Format Template**
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

## 🔄 **NFA to DFA Example**
**Pattern**: Strings ending with "01"
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
**Usage**: Click "🔄 NFA→DFA" → Send above text

## ⚡ **DFA Minimization Example**
**Pattern**: Even number of 1s (already minimal)
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
**Usage**: Click "⚡ Minimize DFA" → Send above text

## 🔍 **Check FA Type Example**
**DFA Example**:
```
States: q0,q1
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q0
q1,0,q0
q1,1,q1
Start: q0
Final: q1
```
**Usage**: Click "🔍 Check FA Type" → Send above text

## 🧪 **Test Input Example**
1. **First define FA** (click "🔧 Design FA"):
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

2. **Then test strings** (click "🧪 Test Input"):
- Send: `00` → ACCEPTED
- Send: `01` → REJECTED
- Send: `100` → ACCEPTED

## 🎯 **Common Patterns**

### **Strings ending with "11"**:
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

### **Even number of 0s**:
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

### **Contains substring "101"**:
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

## 💡 **Quick Tips**
- ✅ Each transition: `from_state,symbol,to_state`
- ✅ No spaces in state names
- ✅ All states must be defined
- ✅ Use exact format with colons
- ❌ Don't forget Start: and Final: lines

## 🤖 **AI Help Commands**
- `/explain DFA minimization`
- `/example NFA`
- `/design DFA that accepts even number of 1s`
- `/practice` - Get practice problems

## 🆘 **Need Help?**
Ask in natural language:
- "How do I create a DFA?"
- "Show me NFA to DFA example"
- "What's wrong with my format?"
