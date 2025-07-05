# 📊 UML Diagrams for Enhanced Automata Bot

This document contains PlantUML scripts for various UML diagrams representing the Enhanced Automata Bot system architecture and workflows.

## 🎯 Use Case Diagram

```plantuml
@startuml UseCaseDiagram
!theme plain
title Enhanced Automata Bot - Use Case Diagram

left to right direction

actor "Student" as student
actor "Researcher" as researcher
actor "Educator" as educator
actor "DeepSeek AI" as ai
actor "MongoDB" as db

package "Enhanced Automata Bot System" {
  usecase "Design Finite Automaton" as UC1
  usecase "Convert NFA to DFA" as UC2
  usecase "Minimize DFA" as UC3
  usecase "Check FA Type" as UC4
  usecase "Test Input Strings" as UC5
  usecase "Get AI Explanations" as UC6
  usecase "Access Learning Mode" as UC7
  usecase "View History" as UC8
  usecase "Get Examples" as UC9
  usecase "Practice Problems" as UC10
  usecase "Natural Language Help" as UC11
  usecase "Save Operations" as UC12
  usecase "Generate Explanations" as UC13
}

' User relationships
student --> UC1
student --> UC2
student --> UC3
student --> UC4
student --> UC5
student --> UC6
student --> UC7
student --> UC8
student --> UC9
student --> UC10
student --> UC11

researcher --> UC1
researcher --> UC2
researcher --> UC3
researcher --> UC4
researcher --> UC5
researcher --> UC6
researcher --> UC8

educator --> UC1
educator --> UC2
educator --> UC3
educator --> UC4
educator --> UC5
educator --> UC6
educator --> UC7
educator --> UC10

' System relationships
UC6 --> ai : requests
UC11 --> ai : requests
UC13 --> ai : requests
UC7 --> ai : requests
UC10 --> ai : requests

UC8 --> db : queries
UC12 --> db : stores

' Include relationships
UC1 ..> UC12 : <<include>>
UC2 ..> UC12 : <<include>>
UC3 ..> UC12 : <<include>>
UC2 ..> UC13 : <<include>>
UC3 ..> UC13 : <<include>>
UC5 ..> UC13 : <<include>>

' Extend relationships
UC6 ..> UC1 : <<extend>>
UC6 ..> UC2 : <<extend>>
UC6 ..> UC3 : <<extend>>
UC6 ..> UC4 : <<extend>>
UC6 ..> UC5 : <<extend>>

@enduml
```

## 🔄 Activity Diagram - NFA to DFA Conversion

```plantuml
@startuml ActivityDiagram_NFAtoDFA
!theme plain
title Enhanced Automata Bot - NFA to DFA Conversion Activity

start

:User clicks "🔄 NFA→DFA" button;
:System displays NFA examples and format guide;
:User inputs NFA definition;

if (Valid NFA format?) then (yes)
  :Parse NFA input;
  :Check if already DFA;
  
  if (Is DFA?) then (yes)
    :Notify user "Already a DFA";
    stop
  else (no)
    :Apply subset construction algorithm;
    :Generate DFA states;
    :Create DFA transitions;
    :Identify DFA final states;
    
    fork
      :Save conversion to database;
    fork again
      :Request AI explanation from DeepSeek;
      :Generate step-by-step explanation;
    end fork
    
    :Format result with AI explanation;
    :Send converted DFA to user;
    :Update user session with new DFA;
  endif
  
else (no)
  :Display format error with examples;
  :Ask user to try again;
endif

stop

@enduml
```

## 📈 Activity Diagram - DFA Minimization

```plantuml
@startuml ActivityDiagram_DFAMinimization
!theme plain
title Enhanced Automata Bot - DFA Minimization Activity

start

:User clicks "⚡ Minimize DFA" button;
:System displays DFA examples;
:User inputs DFA definition;

if (Valid DFA format?) then (yes)
  :Parse DFA input;
  :Check FA type;
  
  if (Is NFA?) then (yes)
    :Convert NFA to DFA first;
    :Apply minimization to converted DFA;
  else (no)
    :Apply partition refinement algorithm;
  endif
  
  :Create initial partitions (final/non-final);
  :Refine partitions iteratively;
  
  repeat
    :For each symbol in alphabet;
    :Check state transitions;
    :Split partitions if needed;
  repeat while (Partitions changed?)
  
  :Build minimized DFA from partitions;
  :Remap state names;
  
  fork
    :Save minimization to database;
  fork again
    :Request AI explanation;
    :Generate minimization steps;
  end fork
  
  :Format result with explanation;
  :Send minimized DFA to user;
  
else (no)
  :Display format error;
  :Show examples;
endif

stop

@enduml
```

## 🔄 Sequence Diagram - User Interaction with AI

```plantuml
@startuml SequenceDiagram_AIInteraction
!theme plain
title Enhanced Automata Bot - AI-Powered User Interaction

participant "User" as user
participant "Telegram Bot" as bot
participant "Command Handler" as handler
participant "AI Service" as ai
participant "DeepSeek API" as deepseek
participant "Database" as db
participant "Message Formatter" as formatter

user -> bot : Sends natural language question\n"Explain DFA minimization"

bot -> handler : Route to handleNaturalLanguageQuestion()
activate handler

handler -> ai : handleAIQuestion(question)
activate ai

ai -> deepseek : POST /v1/chat/completions\n{model: "deepseek-chat", messages: [...]}
activate deepseek

deepseek --> ai : AI response with explanation
deactivate deepseek

ai --> handler : Formatted AI response
deactivate ai

handler -> formatter : formatAIResponse(response)
activate formatter

formatter --> handler : Formatted message
deactivate formatter

handler -> bot : Send formatted response
deactivate handler

bot --> user : 🧠 **AI Assistant:**\nDetailed explanation of DFA minimization...

note right of user
  User can now ask follow-up
  questions or try examples
end note

@enduml
```

## 🔄 Sequence Diagram - Automaton Processing

```plantuml
@startuml SequenceDiagram_AutomatonProcessing
!theme plain
title Enhanced Automata Bot - Automaton Processing Flow

participant "User" as user
participant "Telegram Bot" as bot
participant "Menu Handler" as menu
participant "Operation Handler" as op
participant "Automata Utils" as utils
participant "DFA Algorithm" as algo
participant "AI Service" as ai
participant "Database" as db
participant "Session Manager" as session

user -> bot : Clicks "⚡ Minimize DFA"

bot -> menu : handleMinimizeDFA()
activate menu

menu -> session : getUserSession(userId)
activate session
session --> menu : User session object
deactivate session

menu -> session : updateUserSession(userId, {waitingFor: 'dfa_minimization'})

menu --> bot : Display examples and instructions
deactivate menu

bot --> user : Shows DFA examples and format

user -> bot : Sends DFA definition

bot -> op : handleSessionOperation(ctx, session, text)
activate op

op -> op : handleDFAMinimization(ctx, session, text)

op -> utils : parseDFAInput(text)
activate utils
utils --> op : Parsed DFA object
deactivate utils

op -> utils : checkFAType(dfa)
activate utils
utils --> op : "DFA" or "NFA"
deactivate utils

alt If NFA
  op -> utils : nfaToDfa(nfa)
  activate utils
  utils --> op : Converted DFA
  deactivate utils
end

op -> algo : minimizeDFA(dfa)
activate algo
algo --> op : Minimized DFA
deactivate algo

par Parallel Processing
  op -> db : saveToDatabase(userId, input, output, operation)
  activate db
  db --> op : Save confirmation
  deactivate db
and
  op -> ai : explainAutomataStep(dfa, 'minimize')
  activate ai
  ai --> op : AI explanation
  deactivate ai
end

op -> bot : sendFormattedResult(ctx, minimizedDFA, title, explanation)
deactivate op

bot --> user : ✨ **Minimized DFA**\nResult with AI explanation

@enduml
```

## 🏗️ Class Diagram - System Architecture

```plantuml
@startuml ClassDiagram
!theme plain
title Enhanced Automata Bot - Class Diagram

package "Main Application" {
  class TelegramBot {
    -botToken: string
    -bot: Telegraf
    +start(): void
    +setupHandlers(): void
    +launch(): void
  }
}

package "Handlers" {
  class CommandHandlers {
    +handleStart(ctx): void
    +handleExplainCommand(ctx): void
    +handleExampleCommand(ctx): void
    +handleDesignCommand(ctx): void
    +handlePracticeCommand(ctx): void
    +handleExamplesCommand(ctx): void
    +handleNaturalLanguageQuestion(ctx, question): void
  }

  class MenuHandlers {
    +handleDesignFA(ctx): void
    +handleTestInput(ctx): void
    +handleCheckFAType(ctx): void
    +handleNFAToDFA(ctx): void
    +handleMinimizeDFA(ctx): void
    +handleAIHelp(ctx): void
    +handleLearnMode(ctx): void
    +handleMyHistory(ctx): void
    +handleHelp(ctx): void
  }

  class OperationHandlers {
    +handleFADefinition(ctx, session, text): void
    +handleTestInput(ctx, session, text): void
    +handleFATypeCheck(ctx, session, text): void
    +handleNFAConversion(ctx, session, text): void
    +handleDFAMinimization(ctx, session, text): void
    +handleSessionOperation(ctx, session, text): void
  }
}

package "Services" {
  class AIService {
    -apiKey: string
    +callDeepSeekAI(prompt, systemMessage): Promise<string>
    +explainAutomataStep(fa, operation, userInput): Promise<string>
    +handleAIQuestion(question): Promise<string>
    +generateLearningContent(topic): Promise<string>
  }
}

package "Algorithms" {
  class DFAMinimization {
    +minimizeDFA(dfa): FiniteAutomaton
    -createInitialPartitions(dfa): Set[]
    -refinePartitions(partitions, alphabet, transitions): Set[]
    -buildMinimizedDFA(partitions, dfa): FiniteAutomaton
  }
}

package "Utils" {
  class AutomataUtils {
    +parseDFAInput(text): FiniteAutomaton
    +checkFAType(fa): string
    +simulateFA(fa, input): boolean
    +nfaToDfa(nfa): FiniteAutomaton
  }

  class SessionManager {
    -userSessions: Map
    +getUserSession(userId): UserSession
    +updateUserSession(userId, updates): void
    +clearUserSession(userId): void
  }

  class MessageFormatter {
    +sendFormattedResult(ctx, fa, title, explanation): void
    +formatErrorMessage(error, suggestion): string
    +formatTestResult(input, result, explanation): string
    +formatHistoryMessage(history): string
  }
}

package "Config" {
  class Database {
    -db: MongoClient
    +connectDB(): Promise<Db>
    +saveToDatabase(userId, input, output, operation): void
    +getUserHistory(userId, limit): Promise<Array>
  }
}

package "Models" {
  class FiniteAutomaton {
    +states: string[]
    +alphabet: string[]
    +transitions: Transition[]
    +startState: string
    +finalStates: string[]
  }

  class Transition {
    +from: string
    +symbol: string
    +to: string
  }

  class UserSession {
    +currentFA: FiniteAutomaton
    +waitingFor: string
    +lastOperation: string
    +history: Array
  }
}

' Relationships
TelegramBot --> CommandHandlers
TelegramBot --> MenuHandlers
TelegramBot --> OperationHandlers

CommandHandlers --> AIService
MenuHandlers --> SessionManager
OperationHandlers --> AutomataUtils
OperationHandlers --> DFAMinimization
OperationHandlers --> AIService
OperationHandlers --> Database
OperationHandlers --> MessageFormatter

AutomataUtils --> FiniteAutomaton
DFAMinimization --> FiniteAutomaton
SessionManager --> UserSession
Database --> FiniteAutomaton

FiniteAutomaton --> Transition
UserSession --> FiniteAutomaton

@enduml
```

## 🧩 Component Diagram - System Components

```plantuml
@startuml ComponentDiagram
!theme plain
title Enhanced Automata Bot - Component Diagram

package "Enhanced Automata Bot System" {

  component "Telegram Bot Interface" as TelegramBot {
    port "User Commands" as UC
    port "Menu Interactions" as MI
    port "Text Messages" as TM
  }

  component "Handler Layer" as Handlers {
    component "Command Handlers" as CH
    component "Menu Handlers" as MH
    component "Operation Handlers" as OH

    port "Command Processing" as CP
    port "Menu Processing" as MP
    port "Operation Processing" as OP
  }

  component "Business Logic Layer" as BusinessLogic {
    component "Automata Utils" as AU
    component "DFA Algorithms" as DA
    component "Session Manager" as SM

    port "Automata Operations" as AO
    port "Algorithm Processing" as AP
    port "Session Management" as SMP
  }

  component "Service Layer" as Services {
    component "AI Service" as AIS
    component "Message Formatter" as MF

    port "AI Processing" as AIP
    port "Message Formatting" as MFP
  }

  component "Data Layer" as DataLayer {
    component "Database Config" as DC

    port "Data Persistence" as DP
  }
}

package "External Systems" {
  component "DeepSeek AI API" as DeepSeekAPI
  component "MongoDB Database" as MongoDB
  component "Telegram API" as TelegramAPI
}

' Internal connections
TelegramBot::UC --> Handlers::CP
TelegramBot::MI --> Handlers::MP
TelegramBot::TM --> Handlers::OP

Handlers::CP --> CH
Handlers::MP --> MH
Handlers::OP --> OH

CH --> Services::AIP
MH --> BusinessLogic::SMP
OH --> BusinessLogic::AO
OH --> BusinessLogic::AP
OH --> Services::AIP
OH --> DataLayer::DP

BusinessLogic::AO --> AU
BusinessLogic::AP --> DA
BusinessLogic::SMP --> SM

Services::AIP --> AIS
Services::MFP --> MF

DataLayer::DP --> DC

' External connections
TelegramBot --> TelegramAPI : "Bot API Calls"
AIS --> DeepSeekAPI : "AI Requests"
DC --> MongoDB : "Database Operations"

note top of DeepSeekAPI
  Provides AI-powered explanations
  and natural language processing
end note

note top of MongoDB
  Stores user history and
  automaton operations
end note

note top of TelegramAPI
  Handles user interactions
  and message delivery
end note

@enduml
```

## 🚀 Deployment Diagram - System Deployment

```plantuml
@startuml DeploymentDiagram
!theme plain
title Enhanced Automata Bot - Deployment Diagram

node "User Devices" {
  artifact "Telegram App" as TelegramApp
}

node "Render.com Cloud Platform" {
  artifact "Enhanced Automata Bot" as AutomataBot {
    component "Node.js Runtime" as NodeJS
    component "Bot Application" as BotApp
    component "Environment Variables" as EnvVars
  }
}

node "MongoDB Atlas Cloud" {
  database "MongoDB Database" as MongoDB {
    component "User History Collection" as UserHistory
    component "Operations Collection" as Operations
  }
}

node "DeepSeek AI Platform" {
  component "DeepSeek API" as DeepSeekAPI {
    component "Chat Completions" as ChatAPI
    component "AI Model" as AIModel
  }
}

node "Telegram Servers" {
  component "Telegram Bot API" as TelegramAPI
}

' Connections
TelegramApp --> TelegramAPI : "HTTPS/WebSocket"
TelegramAPI --> AutomataBot : "Webhook/Polling"
AutomataBot --> MongoDB : "MongoDB Protocol\n(Encrypted)"
AutomataBot --> DeepSeekAPI : "HTTPS REST API"

' Deployment specifications
note right of AutomataBot
  **Deployment Specs:**
  - Platform: Render.com
  - Runtime: Node.js 18+
  - Memory: 512MB
  - Auto-scaling enabled
  - Environment variables secured
end note

note right of MongoDB
  **Database Specs:**
  - MongoDB Atlas Free Tier
  - 512MB storage
  - Automatic backups
  - Global clusters
end note

note right of DeepSeekAPI
  **AI Service Specs:**
  - RESTful API
  - Rate limiting applied
  - Secure API key authentication
  - Global CDN
end note

@enduml
```

## 🔄 State Diagram - User Session States

```plantuml
@startuml StateDiagram
!theme plain
title Enhanced Automata Bot - User Session State Diagram

[*] --> Idle : User starts bot

state Idle {
  Idle : User sees main menu
  Idle : No active operation
  Idle : Can ask AI questions
}

state WaitingForInput {
  state "Waiting for FA Definition" as WaitingFA
  state "Waiting for Test String" as WaitingTest
  state "Waiting for Type Check" as WaitingType
  state "Waiting for NFA Conversion" as WaitingNFA
  state "Waiting for DFA Minimization" as WaitingMin
}

state Processing {
  state "Parsing Input" as Parsing
  state "Running Algorithm" as Algorithm
  state "Getting AI Explanation" as AIExplain
  state "Saving to Database" as Saving
  state "Formatting Result" as Formatting
}

state LearningMode {
  state "Showing Tutorial" as Tutorial
  state "Generating Examples" as Examples
  state "Practice Problems" as Practice
}

' Transitions from Idle
Idle --> WaitingFA : Click "🔧 Design FA"
Idle --> WaitingTest : Click "🧪 Test Input"
Idle --> WaitingType : Click "🔍 Check FA Type"
Idle --> WaitingNFA : Click "🔄 NFA→DFA"
Idle --> WaitingMin : Click "⚡ Minimize DFA"
Idle --> LearningMode : Click "📚 Learn Mode"
Idle --> Idle : Ask AI question

' Transitions from Waiting states
WaitingFA --> Processing : Valid FA input
WaitingTest --> Processing : Valid test string
WaitingType --> Processing : Valid FA input
WaitingNFA --> Processing : Valid NFA input
WaitingMin --> Processing : Valid DFA input

WaitingForInput --> Idle : Invalid input / Error
WaitingForInput --> Idle : Cancel operation

' Processing flow
Processing --> Parsing
Parsing --> Algorithm : Valid format
Parsing --> Idle : Invalid format

Algorithm --> AIExplain : Algorithm complete
AIExplain --> Saving : Explanation ready
Saving --> Formatting : Data saved
Formatting --> Idle : Result sent

' Learning mode transitions
LearningMode --> Tutorial : Select topic
LearningMode --> Examples : Request examples
LearningMode --> Practice : Request practice
LearningMode --> Idle : Back to main menu

Tutorial --> LearningMode : Topic complete
Examples --> LearningMode : Examples shown
Practice --> LearningMode : Practice complete

' Error handling
Processing --> Idle : Error occurred
LearningMode --> Idle : Error occurred

Idle --> [*] : User stops bot

note right of Processing
  All processing includes
  parallel AI explanation
  generation and database
  operations for efficiency
end note

@enduml
```

## 📋 How to Use These Diagrams

### 🌐 **Online Rendering**
1. Go to [PlantUML.com](http://www.plantuml.com/plantuml/uml/)
2. Copy any diagram script from above
3. Paste into the text area
4. Click "Submit" to generate the diagram

### 💻 **Local Rendering**
1. Install PlantUML locally
2. Save script to `.puml` file
3. Run: `plantuml filename.puml`

### 📊 **Diagram Types Included**
- **Use Case Diagram**: Shows system functionality and user interactions
- **Activity Diagrams**: Show workflow for NFA→DFA and DFA minimization
- **Sequence Diagrams**: Show interaction flows between components
- **Class Diagram**: Shows system architecture and relationships
- **Component Diagram**: Shows modular system structure
- **Deployment Diagram**: Shows system deployment on cloud platforms
- **State Diagram**: Shows user session state transitions

### 🎯 **Purpose of Each Diagram**
- **Use Case**: Understanding system requirements and user roles
- **Activity**: Understanding business processes and workflows
- **Sequence**: Understanding component interactions and message flow
- **Class**: Understanding code structure and relationships
- **Component**: Understanding system modularity and interfaces
- **Deployment**: Understanding production environment setup
- **State**: Understanding user session lifecycle

These diagrams provide comprehensive documentation of your Enhanced Automata Bot system architecture and behavior! 🎉
