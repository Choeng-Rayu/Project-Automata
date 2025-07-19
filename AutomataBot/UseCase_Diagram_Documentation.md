# AutomataBot - Use Case Diagram Documentation

## Overview
The Use Case Diagram illustrates the functional requirements and interactions within the AutomataBot system, showing what the system does from the user's perspective. It demonstrates how different types of users interact with the six core features and supporting functionalities of this educational Telegram bot for finite automata theory.

## System Actors

### Primary Actor: User
The **User** represents all individuals who interact with AutomataBot, encompassing:
- **Students** learning automata theory and formal languages
- **Instructors** teaching courses and creating educational content
- **Researchers** analyzing automata patterns and conducting studies
- **Self-learners** exploring computational theory concepts

### External System Actors
- **AI Service**: DeepSeek AI API providing natural language processing and educational explanations
- **Database**: MongoDB system storing user sessions, operation history, and automata definitions

## Core Use Cases (Six Main Features)

### 🔧 Design FA (UC1)
**Description**: Allows users to create finite automata using a structured input format.

**Primary Flow**:
- User provides automaton definition with states, alphabet, transitions, start state, and final states
- System parses and validates the input structure
- System stores the automaton in the user's session
- System generates AI-powered explanations of the automaton's behavior
- System provides visual diagram representation

**Input Format Example**:
```
States: q0,q1,q2
Alphabet: 0,1
Transitions:
q0,0,q1
q0,1,q2
Start: q0
Final: q2
```

**Value**: Forms the foundation for all other operations, enabling users to create both DFAs and NFAs.

### 🧪 Test Input (UC2)
**Description**: Simulates string processing on previously defined automata to determine acceptance or rejection.

**Primary Flow**:
- User selects a test string to process
- System executes step-by-step simulation through automaton states
- System displays execution trace showing state transitions
- System provides ACCEPT/REJECT result with detailed explanation
- System offers AI-generated insights about the simulation process

**Dependencies**: Requires an existing automaton from Design FA (UC1)

**Value**: Helps users understand how automata process strings and validate their designs.

### 🔍 Check FA Type (UC3)
**Description**: Analyzes automaton structure to classify it as deterministic (DFA) or nondeterministic (NFA).

**Primary Flow**:
- System examines transition function for determinism properties
- System checks for multiple transitions per state-symbol pair
- System classifies automaton as DFA or NFA
- System explains key characteristics that determine the classification
- System highlights specific examples of deterministic/nondeterministic behavior

**Dependencies**: Requires an existing automaton from Design FA (UC1)

**Value**: Educates users about fundamental differences between DFA and NFA.

### 🔄 Convert NFA→DFA (UC4)
**Description**: Transforms nondeterministic finite automata into equivalent deterministic automata using subset construction.

**Primary Flow**:
- System applies subset construction algorithm
- System creates power set of states for new DFA states
- System builds comprehensive transition table
- System generates equivalent DFA that recognizes the same language
- System provides side-by-side comparison of original NFA and resulting DFA
- System explains each step of the conversion process

**Dependencies**: Requires an existing automaton from Design FA (UC1), preferably an NFA

**Value**: Demonstrates important theoretical concept with practical implementation.

### ⚡ Minimize DFA (UC5)
**Description**: Optimizes deterministic finite automata by merging equivalent states using partition refinement.

**Primary Flow**:
- System applies Hopcroft's partition refinement algorithm
- System identifies equivalent states that can be merged
- System creates minimized DFA with reduced state count
- System shows optimization results and state reduction statistics
- System compares original and minimized versions
- System explains why certain states were equivalent and merged

**Dependencies**: Requires an existing DFA from Design FA (UC1) or converted from NFA→DFA (UC4)

**Value**: Shows optimization techniques and helps users understand state equivalence.

### 🧠 AI Help (UC6)
**Description**: Provides intelligent educational assistance through natural language processing.

**Primary Flow**:
- User asks questions in plain English about automata theory
- System processes queries using DeepSeek AI integration
- System generates contextual educational explanations
- System creates visual diagrams when design requests are detected
- System provides step-by-step algorithmic explanations
- System offers practice problems and interactive tutorials

**Value**: Makes complex theoretical concepts accessible through conversational AI.

## Supporting Use Cases

### Start Bot Session (UC7)
**Description**: Initializes user interaction and displays main menu with available features.
- Establishes user session and context
- Presents six core features with clear navigation
- Provides welcome information and usage instructions

### View History (UC8)
**Description**: Retrieves and displays user's previous operations and automata definitions.
- Accesses stored data from database
- Shows chronological history of user activities
- Enables users to track their learning progress

### Get Examples (UC9)
**Description**: Provides pre-built automaton examples for common patterns and educational purposes.
- Offers examples for even/odd counters, string patterns, and language recognition
- Demonstrates proper input formatting
- Supports learning through concrete examples

## Use Case Relationships

### Include Relationships (<<include>>)
- **UC2, UC3, UC4, UC5 include UC1**: All analysis operations require an existing automaton from Design FA
- **UC6 includes UC9**: AI Help often provides examples to support explanations

### External Dependencies
- **UC6 → AI Service**: AI Help requests explanations from DeepSeek API
- **UC8 → Database**: View History retrieves data from MongoDB
- **UC1 → Database**: Design FA saves automata definitions for persistence

## System Benefits

### Educational Value
- **Interactive Learning**: Hands-on experience with automata theory concepts
- **Visual Understanding**: Diagram generation aids comprehension
- **Step-by-Step Guidance**: AI explanations break down complex algorithms
- **Immediate Feedback**: Real-time validation and error correction

### Technical Features
- **Session Management**: Maintains user context across operations
- **Input Validation**: Ensures proper automaton format and structure
- **Algorithm Implementation**: Provides working examples of theoretical concepts
- **AI Integration**: Makes advanced concepts accessible through natural language

### User Experience
- **Telegram Integration**: Familiar, mobile-friendly interface
- **Menu-Driven Navigation**: Intuitive feature selection
- **Error Handling**: Clear guidance when operations fail
- **Progressive Complexity**: Users can start simple and advance to complex operations

## Conclusion

The Use Case Diagram demonstrates that AutomataBot serves as a comprehensive educational platform for finite automata theory. By providing six core features supported by AI explanations and visual aids, the system transforms abstract theoretical concepts into interactive, understandable experiences. The clear separation between core operations and supporting features ensures scalability while maintaining focus on educational objectives.
