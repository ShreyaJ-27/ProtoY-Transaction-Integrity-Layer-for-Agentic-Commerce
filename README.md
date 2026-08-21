# ◉ Proto-Y

### Transaction Integrity Layer for Agentic Commerce

> **AI agents can decide what to buy. Proto-Y decides whether that transaction should be allowed to happen.**

[![Live Frontend](https://img.shields.io/badge/Live-Frontend-65E6FF?style=for-the-badge)](https://proto-y.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Render-9B8CFF?style=for-the-badge)](https://protoy-transaction-integrity-layer-for.onrender.com/)
[![Network](https://img.shields.io/badge/Algorand-TestNet-36E0A0?style=for-the-badge)](https://testnet.algoexplorer.io/)
[![License](https://img.shields.io/badge/License-Apache--2.0-EAF2F7?style=for-the-badge)](LICENSE)

---

## ✦ Live Demo

### ◉ Control Room

**https://proto-y.vercel.app/**

### ◉ Backend API

**https://protoy-transaction-integrity-layer-for.onrender.com/**

---

# 01 — What is Proto-Y?

Proto-Y is a **transaction integrity layer for autonomous AI agents**.

As AI agents move from generating recommendations to actually spending money, a new problem appears:

> **How do we make autonomous transactions trustworthy?**

An agent may have a legitimate goal but still:

- misunderstand the user's intent
- select an inappropriate provider
- overspend
- encounter malicious or manipulated instructions
- choose poor economic outcomes
- trigger an unsafe payment
- receive an unreliable result
- fail to verify what happened after payment

Proto-Y sits between the **agent's intention** and the **financial transaction**.

It evaluates the transaction before allowing execution and creates a structured path through:

```text
REASONING
    ↓
INTENT
    ↓
RISK
    ↓
ECONOMICS
    ↓
PROVIDER
    ↓
PAYMENT
    ↓
SETTLEMENT
    ↓
OUTCOME
    ↓
MEMORY
````

The result is an autonomous transaction that is not simply:

> "Agent decided → money moved"

but:

> **"Agent proposed → Proto-Y evaluated → transaction executed → result verified → experience retained."**

---

# 02 — The Core Idea

## Agentic Commerce Needs an Integrity Layer

Traditional payment systems primarily answer:

> **Can this payment be processed?**

Proto-Y asks a broader question:

> **Should this autonomous transaction happen at all?**

The system evaluates the transaction across multiple dimensions before execution.

### Intent

What is the agent actually trying to accomplish?

### Risk

Is the proposed action safe and policy-compliant?

### Economics

Is the transaction economically reasonable?

### Provider

Which provider best satisfies the request?

### Payment

How should the transaction be authorized?

### Settlement

Did the payment actually settle?

### Outcome

Was the requested result successfully delivered?

### Memory

What should the agent learn from the transaction?

---

# 03 — Architecture

```text
                         ┌─────────────────────┐
                         │       AI AGENT      │
                         │                     │
                         │ Goal + Budget       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       PROTO-Y       │
                         │  Integrity Layer    │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
           INTENT                  RISK                ECONOMICS
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                                    ▼
                                PROVIDER
                                    │
                                    ▼
                                  x402
                                    │
                                    ▼
                              ALGORAND
                                    │
                                    ▼
                                 OUTCOME
                                    │
                                    ▼
                                 MEMORY
```

---

# 04 — System Flow

A transaction through Proto-Y follows this lifecycle:

```text
┌─────────────┐
│ Agent Goal  │
└──────┬──────┘
       ↓
┌─────────────┐
│   Intent    │
│   Analysis  │
└──────┬──────┘
       ↓
┌─────────────┐
│     Risk    │
│  Evaluation │
└──────┬──────┘
       ↓
┌─────────────┐
│  Economics  │
│   Check     │
└──────┬──────┘
       ↓
┌─────────────┐
│   Provider  │
│  Selection  │
└──────┬──────┘
       ↓
┌─────────────┐
│    x402     │
│  Payment    │
└──────┬──────┘
       ↓
┌─────────────┐
│  Algorand   │
│  Settlement │
└──────┬──────┘
       ↓
┌─────────────┐
│   Outcome   │
│ Verification│
└──────┬──────┘
       ↓
┌─────────────┐
│   Memory    │
│   Update    │
└─────────────┘
```

---

# 05 — Why Proto-Y?

Autonomous agents introduce a different class of transaction risk.

A human transaction generally has a human directly observing the action.

An autonomous agent can:

```text
interpret
→ decide
→ select
→ pay
→ receive
→ evaluate
```

without requiring a human at every step.

That creates an important infrastructure gap:

### Intent ≠ Authorization

An agent understanding a request does not automatically mean the resulting transaction should be allowed.

### Payment ≠ Success

A successful payment does not guarantee that the requested service was delivered correctly.

### Provider Selection ≠ Provider Quality

The cheapest provider is not necessarily the best provider.

### Settlement ≠ Outcome

Blockchain confirmation proves settlement—not that the requested result was useful.

Proto-Y connects these layers into one transaction integrity workflow.

---

# 06 — Key Capabilities

## 🧠 Intent Analysis

Transforms an agent's natural-language goal into a structured transaction intent.

---

## 🛡 Risk Evaluation

Evaluates the proposed transaction against risk and policy constraints before execution.

---

## 📊 Economic Reasoning

Evaluates whether the proposed transaction is economically sensible within the provided budget.

---

## 🏪 Provider Selection

Evaluates available providers and selects an appropriate provider based on transaction requirements.

---

## 💳 x402 Payment

Uses the x402 payment protocol as part of the machine-to-machine payment flow.

---

## ⛓ Algorand Settlement

Uses Algorand TestNet for transaction settlement and verifiable blockchain state.

---

## 🔍 Outcome Verification

Separates:

**payment success**

from:

**actual task success**

The transaction is evaluated after execution instead of treating payment as the final state.

---

## 🧠 Transaction Memory

Stores useful transaction-level experience so future agent decisions can benefit from previous outcomes.

---

# 07 — The Proto-Y Control Room

The frontend is designed as a **3D transaction operating system** rather than a conventional dashboard.

### Central Integrity Core

The central 3D engine represents Proto-Y's transaction decision layer.

### Transaction Network

The transaction moves through:

```text
GROQ
 ↓
INTENT
 ↓
RISK
 ↓
ECONOMICS
 ↓
PROVIDER
 ↓
x402
 ↓
ALGORAND
 ↓
OUTCOME
 ↓
MEMORY
```

### Live Timeline

The right-side timeline provides a real-time view of transaction progression.

### Execution Console

The operator can provide:

* transaction goal
* budget

and initiate execution through Proto-Y.

### 3D State Visualization

Transaction state is reflected visually through:

* node activation
* transaction particles
* pipeline progression
* core state
* success/failure states

---

# 08 — Frontend

The frontend is built as an interactive 3D control room.

### Stack

| Technology        | Purpose                     |
| ----------------- | --------------------------- |
| React             | Application UI              |
| TypeScript        | Type-safe application logic |
| Vite              | Frontend tooling            |
| React Three Fiber | 3D rendering                |
| Three.js          | 3D engine                   |
| Framer Motion     | UI animation                |
| Tailwind CSS      | Styling                     |
| Lucide React      | Interface icons             |

### Frontend Architecture

```text
frontend/
│
├── src/
│   ├── components/
│   │   ├── three/
│   │   └── ui/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │
│   ├── pages/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── package.json
└── vite.config.ts
```

---

# 09 — Backend

The backend exposes the Proto-Y execution API and orchestrates the transaction lifecycle.

### Backend Stack

| Technology | Purpose                |
| ---------- | ---------------------- |
| Node.js    | Runtime                |
| TypeScript | Backend implementation |
| Hono       | HTTP API               |
| Groq       | LLM reasoning          |
| x402       | Machine payment flow   |
| Algorand   | TestNet settlement     |
| USDC       | Transaction asset      |

### Backend Architecture

```text
backend/
│
├── src/
│   ├── agent/
│   ├── analytics/
│   ├── engines/
│   ├── handlers/
│   ├── middleware/
│   ├── models/
│   ├── orchestrator/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   │
│   ├── config.ts
│   └── index.ts
│
├── package.json
└── tsconfig.json
```

---

# 10 — API

## Health

```http
GET /health
```

Returns backend health and network information.

---

## System Information

```http
GET /info
```

Returns Proto-Y system information and configuration metadata.

---

## Agent Execution

```http
POST /api/agent/execute
```

Primary transaction execution endpoint.

### Example request

```json
{
  "goal": "Find the latest blockchain research",
  "budget": 50000
}
```

### Conceptual execution

```text
Goal
 ↓
Intent
 ↓
Risk
 ↓
Economics
 ↓
Provider
 ↓
Payment
 ↓
Settlement
 ↓
Outcome
 ↓
Memory
```

---

# 11 — Frontend ↔ Backend

The deployed architecture is:

```text
                VERCEL
                  │
                  ▼
        ┌──────────────────┐
        │ Proto-Y Frontend │
        │ React + R3F      │
        └────────┬─────────┘
                 │
                 │ HTTPS
                 ▼
                RENDER
        ┌──────────────────┐
        │ Proto-Y Backend  │
        │ Hono + TypeScript│
        └────────┬─────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
      Groq     x402    Algorand
```

### Production frontend

[https://proto-y.vercel.app/](https://proto-y.vercel.app/)

### Production backend

[https://protoy-transaction-integrity-layer-for.onrender.com/](https://protoy-transaction-integrity-layer-for.onrender.com/)

---

# 12 — Environment Variables

## Frontend

The frontend requires:

```env
VITE_API_BASE_URL=https://protoy-transaction-integrity-layer-for.onrender.com
```

Frontend environment variables should contain only values intended for browser-side use.

---

## Backend

Backend configuration includes:

```env
AGENT_PRIVATE_KEY=
AVM_ADDRESS=

FACILITATOR_URL=
ALGORAND_NODE_URL=
ALGORAND_NETWORK=

USDC_ASA_ID=
USDC_DECIMALS=

PRICE_INTENT_ANALYSIS=
PRICE_ECONOMICS_CHECK=
PRICE_PROVIDER_SELECT=
PRICE_RESEARCH_API=

LLM_PROVIDER=
GROQ_API_KEY=
GROQ_JSON_MODEL=
GROQ_TEXT_MODEL=

PORT=
NODE_ENV=
LOG_LEVEL=

ENABLE_FEE_ABSTRACTION=
```

Never commit private credentials or API keys to the repository.

---

# 13 — Local Development

Clone the repository:

```bash
git clone https://github.com/ViivianREINE/ProtoY-Transaction-Integrity-Layer-for-Agentic-Commerce.git
cd ProtoY-Transaction-Integrity-Layer-for-Agentic-Commerce
```

---

## Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend runs locally on:

```text
http://localhost:4021
```

---

## Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs locally on:

```text
http://localhost:5173
```

---

# 14 — Frontend Environment

Create:

```text
frontend/.env.local
```

Add:

```env
VITE_API_BASE_URL=http://localhost:4021
```

For production:

```env
VITE_API_BASE_URL=https://protoy-transaction-integrity-layer-for.onrender.com
```

---

# 15 — Validation

Before deployment:

```bash
cd frontend

npm run typecheck
npm run lint
npm run build
```

Backend:

```bash
cd backend

npm run typecheck
npm run build
```

The project should pass type checking and production builds before deployment.

---

# 16 — Deployment

## Frontend

The frontend is deployed on Vercel.

```text
https://proto-y.vercel.app/
```

Vercel configuration:

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

Production environment:

```env
VITE_API_BASE_URL=https://protoy-transaction-integrity-layer-for.onrender.com
```

---

## Backend

The backend is deployed on Render.

```text
https://protoy-transaction-integrity-layer-for.onrender.com/
```

The backend handles:

* agent execution
* reasoning
* transaction policy
* risk evaluation
* economics
* provider selection
* payment orchestration
* settlement
* outcome processing
* memory

---

# 17 — Transaction State Model

Proto-Y treats a transaction as a lifecycle rather than a single payment event.

```text
IDLE
 │
 ▼
ANALYZING
 │
 ▼
INTENT
 │
 ▼
RISK
 │
 ├──────────────► BLOCKED
 │
 ▼
ECONOMICS
 │
 ▼
PROVIDER
 │
 ▼
PAYMENT
 │
 ▼
SETTLEMENT
 │
 ▼
OUTCOME
 │
 ▼
MEMORY
 │
 ▼
SUCCESS
```

Failure can occur at any stage.

The frontend reflects these states through the 3D control room.

---

# 18 — Design Philosophy

Proto-Y intentionally avoids the typical:

> "AI + neon gradient + chatbot"

interface.

Instead, the interface is designed around the metaphor of a **transaction control plane**.

### Visual principles

* Dark infrastructure aesthetic
* High information density without clutter
* 3D spatial transaction visualization
* Minimal glass surfaces
* Cyan integrity signals
* Violet reasoning signals
* Emerald successful settlement
* Red policy/failure states
* Monospaced transaction metadata
* Motion that communicates system state

The interface should feel closer to:

**AI infrastructure × financial terminal × transaction observability**

than a traditional SaaS dashboard.

---

# 19 — Why This Matters

The next phase of commerce is increasingly agent-mediated.

Standards such as the Agentic Commerce Protocol focus on enabling buyers, agents, and businesses to complete purchases, while payment protocols such as x402 address machine-to-machine payment flows. ([GitHub][2])

Proto-Y focuses on a complementary problem:

> **What happens between an agent deciding to transact and the transaction becoming final?**

That layer needs to reason about:

```text
INTENT
RISK
ECONOMICS
PROVIDER
PAYMENT
SETTLEMENT
OUTCOME
MEMORY
```

Proto-Y is designed as that missing control plane.

---

# 20 — Example

An autonomous agent receives:

```text
"Find the latest blockchain research."
```

with a budget of:

```text
50,000 microUSDC
```

Instead of immediately spending:

```text
Agent
  ↓
Payment
```

Proto-Y evaluates:

```text
Agent Goal
    ↓
Intent Analysis
    ↓
Risk Evaluation
    ↓
Economic Validation
    ↓
Provider Selection
    ↓
Payment Authorization
    ↓
x402
    ↓
Algorand Settlement
    ↓
Outcome Verification
    ↓
Transaction Memory
```

The user can see this entire lifecycle through the Proto-Y Control Room.

---

# 21 — Project Structure

```text
ProtoY-Transaction-Integrity-Layer-for-Agentic-Commerce/
│
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   ├── analytics/
│   │   ├── engines/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── orchestrator/
│   │   ├── routes/
│   │   ├── tests/
│   │   └── utils/
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── three/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── LICENSE
├── README.md
└── .gitignore
```

---

# 22 — Technology Overview

```text
┌──────────────────────────────────────────────────┐
│                    PROTO-Y                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  Frontend                                        │
│  React • TypeScript • Vite • Three.js • R3F     │
│                                                  │
│  AI                                               │
│  Groq                                             │
│                                                  │
│  Transaction Layer                                │
│  Intent • Risk • Economics • Provider            │
│                                                  │
│  Payment                                          │
│  x402                                             │
│                                                  │
│  Settlement                                       │
│  Algorand TestNet                                 │
│                                                  │
│  Asset                                            │
│  USDC                                             │
│                                                  │
│  Backend                                          │
│  Node.js • TypeScript • Hono                     │
│                                                  │
│  Deployment                                       │
│  Vercel • Render                                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

# 23 — Roadmap

### ✓ Phase 1 — Transaction Integrity Core

* Intent analysis
* Risk evaluation
* Economic reasoning
* Provider selection
* Payment orchestration
* Settlement
* Outcome verification
* Memory

### ✓ Phase 2 — Agentic Payment Rail

* x402 integration
* USDC transaction flow
* Algorand TestNet settlement

### ✓ Phase 3 — 3D Control Room

* Interactive transaction network
* Integrity Core
* Transaction particle
* Live pipeline
* State visualization

### ✓ Phase 4 — Production Web Deployment

* Vercel frontend
* Render backend
* Production API integration

### → Future

* Agent identity and authorization
* Persistent transaction ledger
* Advanced fraud detection
* Provider reputation learning
* Multi-chain settlement
* Policy authoring interface
* Transaction replay and audit trails
* Human-in-the-loop approval policies
* Production-grade authentication and authorization

---

# 24 — Project Philosophy

Proto-Y is built around one principle:

> **Autonomy should not mean opacity.**

An autonomous agent should be able to act quickly without making its transactions impossible to understand.

Every important transaction should have:

```text
an intent
a risk assessment
an economic rationale
a provider decision
a payment path
a settlement state
an outcome
and a memory
```

That is the purpose of Proto-Y.

---

# 25 — License

This project is licensed under the **Apache License 2.0**.

See [`LICENSE`](LICENSE) for the complete license text.

---

# 26 — Links

### ◉ Live Application

[https://proto-y.vercel.app/](https://proto-y.vercel.app/)

### ◉ Backend API

[https://protoy-transaction-integrity-layer-for.onrender.com/](https://protoy-transaction-integrity-layer-for.onrender.com/)

### ◉ Repository

[https://github.com/ViivianREINE/ProtoY-Transaction-Integrity-Layer-for-Agentic-Commerce](https://github.com/ViivianREINE/ProtoY-Transaction-Integrity-Layer-for-Agentic-Commerce)

---

# 27 — Built For Agentic Commerce

Proto-Y explores what the infrastructure between **AI autonomy and financial execution** could look like.

Not another chatbot.

Not another payment button.

A transaction integrity layer.

**Agent decides.
Proto-Y verifies.
The transaction settles.
The outcome is remembered.**
