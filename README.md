# Proto-Y — Autonomous Transaction Integrity Layer for Agentic Commerce

> **Making autonomous payments safer, economically rational, and outcome-aware.**

Proto-Y is an **AI-powered transaction integrity layer for agentic commerce**.

It sits between an AI agent and paid services, giving the agent the ability to:

- Understand what it is trying to accomplish
- Evaluate transaction risk before spending
- Compare providers based on cost, reputation, and reliability
- Execute payments through the **x402 protocol**
- Settle payments on **Algorand**
- Verify whether the paid service actually delivered a useful result
- Update provider reputation based on real outcomes
- Store transaction experiences as agent memory
- Use those experiences to make better future decisions

Proto-Y is designed around one core principle:

> **Groq proposes. Proto-Y verifies. The payment only happens when the transaction passes the integrity checks.**

---

## 🚀 Project Status

### Current implementation

| Layer | Status |
|---|---|
| AI Agent / Groq | ✅ Implemented |
| Intent Analysis | ✅ Implemented |
| Risk Engine | ✅ Implemented |
| Economic Optimization | ✅ Implemented |
| Provider Selection | ✅ Implemented |
| x402 Protocol | ✅ Implemented |
| Real Algorand TestNet Settlement | ✅ Verified |
| Outcome Verification | ✅ Implemented |
| Reputation Tracking | ✅ Implemented |
| Agent Memory | ✅ Implemented |
| Full Agent Orchestration | ✅ Implemented |
| End-to-End Tests | ✅ Passing |
| Frontend | ⏳ Not included in this version |
| Algorand MainNet | ⏳ Planned |

---

# 🧠 The Problem

AI agents are increasingly capable of acting autonomously.

They can:

- call APIs,
- purchase services,
- retrieve information,
- execute workflows,
- and make payments.

But autonomous payment introduces a fundamental problem:

### An agent can successfully pay for something without knowing whether the transaction was actually good.

A traditional payment flow looks like:

```text
Agent
  ↓
Find API
  ↓
Pay
  ↓
Receive Response
````

There is very little intelligence between the agent's intention and its spending decision.

The agent may:

* choose an expensive provider,
* pay a low-reputation service,
* repeat failed transactions,
* spend too much,
* interact with a suspicious request,
* or pay successfully for a poor-quality result.

Proto-Y introduces a transaction integrity layer between the agent and the payment.

---

# 💡 The Proto-Y Approach

Proto-Y transforms:

```text
Agent → Pay → Hope
```

into:

```text
Agent Goal
    ↓
AI Intent Understanding
    ↓
Risk Evaluation
    ↓
Economic Analysis
    ↓
Provider Selection
    ↓
x402 Payment Authorization
    ↓
Algorand Settlement
    ↓
Service Execution
    ↓
Outcome Verification
    ↓
Reputation Update
    ↓
Agent Memory
    ↓
Better Future Decisions
```

The transaction is therefore evaluated **before, during, and after payment**.

---

# 🏗️ Architecture

```text
                         USER / AI AGENT
                               │
                               ▼
                     ┌───────────────────┐
                     │   Groq AI Agent   │
                     │                   │
                     │ Goal → Intent     │
                     │ Decision Summary  │
                     └─────────┬─────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │  Intent Engine    │
                     └─────────┬─────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │   Risk Engine     │
                     │                   │
                     │ Budget            │
                     │ Frequency         │
                     │ Injection         │
                     │ Parameters        │
                     └─────────┬─────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                  DENY                   ALLOW
                    │                     │
                    ▼                     ▼
                  BLOCK             Economics Engine
                                          │
                                          ▼
                                  Provider Selection
                                          │
                                          ▼
                                  x402 Payment Layer
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │ Algorand TestNet     │
                              │                      │
                              │ USDC ASA Transfer    │
                              │ GoPlausible          │
                              │ Facilitator          │
                              └──────────┬───────────┘
                                         │
                                         ▼
                                  Service Execution
                                         │
                                         ▼
                                Outcome Verification
                                         │
                                         ▼
                                Reputation Engine
                                         │
                                         ▼
                                  Agent Memory
                                         │
                                         ▼
                                  Future Decisions
```

---

# 🤖 AI Agent Layer

Proto-Y uses **Groq** as the reasoning layer for agent interaction.

The AI agent receives a user goal and relevant transaction information such as:

```text
Goal
Budget
Parameters
Transaction Context
```

The agent extracts structured intent and produces decision-oriented information for the Proto-Y pipeline.

However, the LLM does **not** have authority to bypass Proto-Y's deterministic safety controls.

### Security principle

```text
                 GROQ
                  │
                  │ proposes
                  ▼
        ┌─────────────────────┐
        │      PROTO-Y        │
        │                     │
        │ Intent              │
        │ Risk                │
        │ Budget              │
        │ Economics           │
        │ Provider            │
        │ Policy              │
        └──────────┬──────────┘
                   │
              approves/denies
                   │
                   ▼
                PAYMENT
```

This separation prevents an LLM from simply deciding:

> "Yes, make the payment."

Instead:

> **The AI proposes. The integrity layer decides.**

---

# 🔍 1. Intent Engine

The Intent Engine determines what the agent is actually trying to accomplish.

Supported intent categories include:

```text
QUERY
ANALYSIS
EXECUTION
PAYMENT
```

The engine combines AI-extracted intent with deterministic classification.

It also considers transaction parameters and estimated budget.

This creates a structured representation of the agent's goal before money is involved.

---

# 🛡️ 2. Risk Engine

The Risk Engine evaluates whether the transaction should proceed.

It performs multiple checks including:

### Budget risk

Transactions exceeding defined thresholds receive additional risk.

### Request frequency

Rapid repeated requests can increase risk.

### Injection detection

Suspicious patterns such as SQL injection attempts are detected.

### Parameter anomalies

Unexpected or suspicious transaction parameters contribute to the risk score.

The system uses a risk score:

```text
0 ─────────────────────────────── 100
│          │          │
LOW       ESCALATE    DENY
```

Current policy:

```text
0 – 50    → ALLOW
51 – 75   → ESCALATE
76 – 100  → DENY
```

A denied transaction is stopped **before payment authorization**.

---

# 💰 3. Economics Engine

Passing the risk layer does not automatically mean the transaction is economically optimal.

Proto-Y evaluates provider economics using:

* base price
* provider reputation
* volume discounts
* value ratio
* potential savings

The system calculates adjusted pricing and ranks available providers.

A provider with a lower raw price is therefore not automatically considered better.

Instead:

```text
Provider Value
=
Reputation / Adjusted Price
```

This allows the agent to reason about:

> **What am I getting for what I am paying?**

---

# 🏪 4. Provider Selection

Proto-Y maintains provider-level information including:

* reputation
* success rate
* SLA compliance
* latency
* transaction history

Provider scoring currently uses:

```text
Provider Score =
    (Adjusted Reputation × 0.6)
  + (Success Rate × 0.3)
  + (SLA Compliance × 0.1)
```

Providers are then ranked according to their calculated reliability and value.

A minimum SLA requirement is also enforced.

Current minimum SLA:

```text
95%
```

---

# 💳 5. Real x402 Payment Layer

Proto-Y implements a real **x402 payment flow on Algorand TestNet**.

The payment lifecycle is:

```text
Client
  │
  │ GET /api/v1/research
  ▼
Service
  │
  │ HTTP 402 Payment Required
  ▼
Client receives payment requirements
  │
  │ Creates signed payment payload
  ▼
x402 Client
  │
  │ payment-signature
  ▼
GoPlausible Facilitator
  │
  │ verifies / facilitates
  ▼
Algorand TestNet
  │
  │ USDC ASA transfer
  ▼
Settlement
  │
  │ payment-response
  ▼
Service
  │
  │ HTTP 200
  ▼
Client
```

This is not a simulated payment.

A real Algorand TestNet transaction is created and settled through the x402 facilitator.

---

# 🔗 x402 Configuration

Current TestNet configuration:

```env
ALGORAND_NETWORK=testnet
USDC_ASA_ID=10458941
FACILITATOR_URL=https://facilitator.goplausible.xyz
```

The protected research endpoint is:

```text
GET /api/v1/research?query=...
```

When payment is missing, the endpoint responds:

```http
HTTP/1.1 402 Payment Required
```

The response contains the x402 payment requirements, including:

```text
x402Version
scheme
network
amount
asset
payTo
maxTimeoutSeconds
feePayer
```

---

# ⚡ Real TestNet Settlement

The real x402 flow has been independently verified.

### Verified transaction

```text
TxID:
U3HXD63XE6C4M2IWFUOZUALA2AAWJEEA4FAFK737VQ2MZIS3EXKA
```

### Payment details

```text
Network:
Algorand TestNet

Asset:
10458941

Amount:
50000 microUSDC

Payer:
TRE22HE6KQXBA5X5TX75VP2PZCSAESXX6RO3LBTBNCHIO5773OULFOYG7E

Receiver:
QOLY2G6YEBQ4CXVOCA3CK4FOPWHORDXTCRJF56UK35JJM7OCWFDAUYVALQ
```

The transaction was independently queried against the Algorand TestNet indexer and confirmed.

The resulting request returned:

```text
HTTP 200
success: true
```

This proves that the current implementation performs an actual x402 settlement rather than merely simulating the protocol.

---

# 🔐 Payment Security

Private keys are never hardcoded into the application.

The agent wallet is supplied through:

```env
AGENT_PRIVATE_KEY=...
```

Groq credentials are supplied through:

```env
GROQ_API_KEY=...
```

Secrets must remain in `.env` and must never be committed to Git.

The architecture follows the principle:

> **No payment should occur until Proto-Y has approved the transaction.**

---

# 🧪 6. Outcome Verification

Payment success alone does not mean transaction success.

Proto-Y therefore evaluates the service response after payment.

The Outcome Verifier evaluates:

| Metric          |  Weight |
| --------------- | ------: |
| Schema validity |      25 |
| Freshness       |      20 |
| Query matching  |      30 |
| SLA compliance  |      15 |
| Errors          |      10 |
| **Total**       | **100** |

The result is converted into:

```text
TRUST
CONDITIONAL
DISTRUST
```

This allows Proto-Y to answer a much more important question:

> **Did the agent actually receive something worth paying for?**

---

# 🧬 7. Reputation Engine

Provider reputation is not static.

Proto-Y updates reputation after verified outcomes.

Current reputation update model:

```text
New Reputation
=
(0.7 × Old Reputation)
+
(0.3 × Outcome Score)
```

This means recent performance matters while historical reputation is still retained.

Repeated good outcomes therefore strengthen a provider's reputation.

Poor outcomes reduce it.

---

# 🧠 8. Agent Memory

Every transaction can become an experience.

Proto-Y stores information such as:

```text
Agent
Provider
Intent
Transaction
Payment
Outcome
Quality Score
Latency
Success / Failure
Lesson
```

The memory layer allows the system to move from:

```text
Stateless Agent
```

toward:

```text
Experience-Aware Agent
```

The goal is that future transactions can take previous experiences into account.

---

# 🔄 Complete Agent Flow

The complete Proto-Y architecture is:

```text
User Goal + Budget
        │
        ▼
    Groq Agent
        │
        ▼
 Intent Extraction
        │
        ▼
  Intent Engine
        │
        ▼
   Risk Engine
        │
   ┌────┴────┐
   │         │
 DENY       ALLOW
   │         │
   │         ▼
   │    Economics
   │         │
   │         ▼
   │   Provider Selection
   │         │
   │         ▼
   │     x402 402
   │         │
   │         ▼
   │  Signed Payment
   │         │
   │         ▼
   │ GoPlausible Facilitator
   │         │
   │         ▼
   │ Algorand TestNet
   │         │
   │         ▼
   │ Settlement TxID
   │         │
   │         ▼
   │ Service Execution
   │         │
   │         ▼
   │ Outcome Verification
   │         │
   │         ▼
   │ Reputation Update
   │         │
   │         ▼
   │ Agent Memory
   │         │
   │         ▼
   │   Future Decisions
   │
 BLOCKED
```

---

# 🧩 Master Agent Endpoint

The primary agent endpoint is:

```http
POST /api/agent/execute
```

The endpoint connects the AI layer with the Proto-Y transaction integrity pipeline.

Conceptually:

```json
{
  "goal": "Find the latest blockchain research",
  "budget": 50000
}
```

The request passes through:

```text
Groq
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
Service
 ↓
Outcome
 ↓
Reputation
 ↓
Memory
```

---

# 🌐 API Reference

## Health

```http
GET /health
```

Returns system status including:

* network
* USDC ASA
* receiver address
* Groq availability

---

## System Information

```http
GET /info
```

Returns Proto-Y architecture and system metadata.

---

## AI Agent Execution

```http
POST /api/agent/execute
```

Runs the complete agent-driven transaction workflow.

---

## Agent Status

```http
GET /api/agent/status
```

Returns agent subsystem status.

---

## Protected Research API

```http
GET /api/v1/research?query=blockchain
```

Protected by real x402 payment requirements.

---

## Deterministic Orchestrator

```http
POST /api/orchestrate
```

Provides access to the underlying Proto-Y orchestration pipeline.

---

# 📁 Project Structure

```text
backend/
│
├── src/
│   │
│   ├── agent/
│   │   ├── agent.ts
│   │   ├── groq-client.ts
│   │   ├── prompts.ts
│   │   └── decision-parser.ts
│   │
│   ├── engines/
│   │   ├── intent-engine.ts
│   │   ├── risk-engine.ts
│   │   ├── economics-engine.ts
│   │   ├── provider-engine.ts
│   │   ├── outcome-verifier.ts
│   │   └── reputation-engine.ts
│   │
│   ├── models/
│   │   ├── request-history.ts
│   │   ├── pricing-model.ts
│   │   ├── provider-memory.ts
│   │   ├── payment-storage.ts
│   │   ├── outcome-storage.ts
│   │   └── agent-memory.ts
│   │
│   ├── middleware/
│   │   └── x402-real-middleware.ts
│   │
│   ├── orchestrator/
│   │   └── proto-y-orchestrator.ts
│   │
│   ├── routes/
│   │   ├── agent.ts
│   │   ├── paid-endpoints.ts
│   │   ├── orchestrator.ts
│   │   ├── analysis.ts
│   │   ├── economics.ts
│   │   ├── provider.ts
│   │   ├── verification.ts
│   │   └── memory.ts
│   │
│   ├── handlers/
│   │   └── research-handler.ts
│   │
│   ├── analytics/
│   │   └── provider-analytics.ts
│   │
│   ├── utils/
│   │   ├── x402-client.ts
│   │   ├── facilitator-client.ts
│   │   ├── payment-processor.ts
│   │   ├── crypto-utils.ts
│   │   ├── response-validator.ts
│   │   └── provider-validator.ts
│   │
│   ├── config.ts
│   ├── logger.ts
│   ├── types.ts
│   └── index.ts
│
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

---

# ⚙️ Technology Stack

### Runtime

* Node.js
* TypeScript

### Backend

* Hono
* Axios

### AI

* Groq API
* `openai/gpt-oss-20b`

### Blockchain

* Algorand
* Algorand TestNet
* Algorand USDC ASA
* `algosdk`

### Payments

* x402 Protocol
* `@x402-avm/core`
* `@x402-avm/avm`
* `@x402-avm/hono`
* Exact AVM payment scheme
* GoPlausible facilitator

### Security / Verification

* SHA-256 response proofs
* Schema validation
* Freshness validation
* Query matching
* SLA validation
* Risk scoring

### Development

* TypeScript compiler
* tsx
* npm
* Git

---

# 🧪 Testing

Proto-Y includes multiple levels of testing.

## Engine Tests

```bash
npm run test:engines
```

Tests the individual decision engines.

---

## HTTP Tests

```bash
npm run test:http
```

Tests the live HTTP server and payment-protected endpoints.

---

## End-to-End Tests

```bash
npm run test:e2e
```

The current deterministic E2E suite validates:

```text
✓ Low-risk transaction
✓ High-risk transaction blocking
✓ Excessive budget handling
✓ Outcome verification
✓ Dynamic reputation updates
✓ Full orchestration latency
✓ USDC ASA configuration
```

---

# ⚡ Real x402 Verification

The real payment client can be executed against the protected endpoint.

The flow is:

```text
1. GET protected endpoint
2. Receive HTTP 402
3. Decode payment requirements
4. Construct Algorand payment
5. Sign payment
6. Send payment payload
7. Retry request
8. Facilitator verifies payment
9. Algorand settles transaction
10. Receive settlement proof
11. Receive HTTP 200
```

The implementation also handles the canonical x402 payment header emitted by the current SDK.

---

# 🛠️ Local Development

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:4021
```

Check health:

```bash
curl.exe http://localhost:4021/health
```

Expected response:

```json
{
  "status": "ok",
  "network": "testnet",
  "usdcAsaId": 10458941,
  "groqAvailable": true
}
```

---

# 🔐 Environment Configuration

Create a `.env` file:

```env
ALGORAND_NETWORK=testnet

USDC_ASA_ID=10458941

FACILITATOR_URL=https://facilitator.goplausible.xyz

AGENT_PRIVATE_KEY=<YOUR_ALGORAND_PRIVATE_KEY>

AVM_ADDRESS=<YOUR_PAYMENT_RECEIVER_ADDRESS>

GROQ_API_KEY=<YOUR_GROQ_API_KEY>

GROQ_JSON_MODEL=openai/gpt-oss-20b
GROQ_TEXT_MODEL=openai/gpt-oss-20b
```

### Important

Never commit:

```text
.env
.env.local
private keys
API keys
mnemonics
seed phrases
```

to Git.

---

# 🔒 Security Architecture

Proto-Y deliberately separates **AI reasoning** from **transaction authorization**.

### Groq can:

```text
Understand goals
Extract intent
Generate reasoning
Summarize decisions
```

### Groq cannot:

```text
Override risk policy
Bypass budget controls
Force a payment
Approve a denied transaction
Modify private keys
```

The deterministic Proto-Y layer remains the final authority.

---

# 🏆 Why Proto-Y Is Different

Most agentic payment systems focus on:

```text
Can the agent pay?
```

Proto-Y focuses on:

```text
Should the agent pay?
```

And then goes one step further:

```text
Was the payment worth it?
```

And finally:

```text
What did the agent learn from the transaction?
```

This creates a feedback loop:

```text
             ┌───────────────────────┐
             │                       │
             ▼                       │
       Agent Decision                │
             │                       │
             ▼                       │
          Payment                   │
             │                       │
             ▼                       │
          Outcome                  │
             │                       │
             ▼                       │
        Reputation                  │
             │                       │
             ▼                       │
        Agent Memory                │
             │                       │
             └──── Better Decision ──┘
```

Proto-Y therefore treats payment as a **closed-loop transaction**, rather than a one-time financial event.

---

# 🎯 Hackathon Demo Flow

The intended demonstration is:

### 1. Agent receives a goal

```text
"Find reliable blockchain research."
```

### 2. Groq interprets the goal

```text
Intent:
QUERY / RESEARCH
```

### 3. Proto-Y evaluates risk

```text
Risk:
LOW

Decision:
ALLOW
```

### 4. Economics engine evaluates providers

```text
Provider A
Provider B
Provider C
```

The system selects the best provider based on value and reputation.

### 5. x402 requests payment

```text
HTTP 402 Payment Required
```

### 6. Agent signs payment

```text
50000 microUSDC
```

### 7. GoPlausible facilitates settlement

```text
Algorand TestNet
```

### 8. Real transaction settles

```text
TxID: <real Algorand transaction>
```

### 9. Service responds

```text
HTTP 200
```

### 10. Proto-Y verifies the outcome

```text
Quality Score: XX/100
```

### 11. Reputation changes

```text
Provider reputation:
previous → updated
```

### 12. Agent remembers

```text
Lesson stored
```

The result is not simply:

> "Payment succeeded."

It becomes:

> **"The agent paid, verified the outcome, evaluated the provider, updated its belief, and learned from the transaction."**

---

# 📊 Current Validation

The implementation has successfully demonstrated a real TestNet payment lifecycle.

### Verified

```text
HTTP 402
      ↓
Payment Requirements
      ↓
Signed Algorand Payment
      ↓
GoPlausible Facilitator
      ↓
Algorand TestNet
      ↓
Confirmed Transaction
      ↓
Settlement Response
      ↓
HTTP 200
```

The verified TestNet transaction transferred:

```text
50,000 microUSDC
```

using:

```text
USDC ASA: 10458941
```

and produced a real Algorand transaction ID.

---

# 🗺️ Current Scope & Next Stage

This repository currently focuses on the **backend transaction-integrity system**.

Implemented:

```text
AI Agent
    ↓
Proto-Y
    ↓
x402
    ↓
Algorand TestNet
    ↓
Outcome
    ↓
Reputation
    ↓
Memory
```

Future stages include:

```text
                 CURRENT
                    │
                    ▼
          TestNet Backend
                    │
                    ▼
             ┌─────────────┐
             │   NEXT      │
             │             │
             │ Frontend    │
             │ MainNet     │
             └─────────────┘
```

Frontend and MainNet deployment are intentionally outside the scope of this version.

---

# 📜 License

Copyright 2026 Shreya Jha

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at:

[https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

See `LICENSE` for the complete Apache License 2.0 text.

---

# 🚀 Proto-Y

> **Don't just let agents pay.**
>
> **Make them earn the right to pay.**

[1]: https://www-eu.apache.org/legal/apply-license?utm_source=chatgpt.com "Applying the Apache license, version 2.0 | Apache Software Foundation"
