# Proto-Y

### Transaction Integrity Layer for Agentic Commerce

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![Algorand](https://img.shields.io/badge/Blockchain-Algorand-000000.svg)](https://algorand.com/)
[![x402](https://img.shields.io/badge/Payments-x402-purple.svg)](https://www.x402.org/)
[![TypeScript](https://img.shields.io/badge/Backend-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

> **Proto-Y is a transaction-integrity layer for autonomous AI agents that need to discover services, evaluate payment risk, execute x402 payments, verify real outcomes, update provider reputation, and learn from every transaction.**

---

## Overview

As AI agents become capable of acting autonomously, they increasingly need to interact with paid APIs and services.

The problem is not simply **"Can an agent pay?"**

The harder problem is:

> **Should the agent pay, how much should it pay, which provider should it trust, and did the service actually deliver what was paid for?**

Proto-Y sits between an autonomous agent and paid services to provide a structured transaction-integrity layer.

Instead of allowing an AI model to directly decide and execute a payment, Proto-Y separates:

1. **AI-generated intent**
2. **Deterministic transaction analysis**
3. **Risk and budget enforcement**
4. **Provider selection**
5. **x402 payment execution**
6. **Settlement verification**
7. **Service execution**
8. **Outcome verification**
9. **Provider reputation updates**
10. **Agent memory and learning**

This creates an auditable transaction lifecycle where the AI proposes an action, but deterministic controls remain responsible for authorizing payment.

---

# Core Principle

## AI proposes. Proto-Y decides. The blockchain settles. The outcome teaches the agent.

Groq is used for structured agent reasoning and proposal generation.

However, the model **does not have authority to authorize or bypass payment controls**.

The final transaction decision is produced by Proto-Y's deterministic engines.

This creates a hard boundary between:

```text
AI reasoning
     ↓
Agent Proposal
     ↓
Proto-Y deterministic evaluation
     ↓
ALLOW / ESCALATE / DENY
     ↓
x402 payment
     ↓
Service execution
     ↓
Outcome verification
     ↓
Reputation + Memory
```

---

# What Has Been Implemented

The current backend implementation contains the complete agent transaction lifecycle.

### Agent execution

The `/api/agent/execute` route now acts as the master orchestration entry point.

It connects:

* Groq agent reasoning
* Intent classification
* Risk analysis
* Economic evaluation
* Provider selection
* x402 payment execution
* Service execution
* Outcome verification
* Reputation updates
* Agent memory

The route uses the existing deterministic engines rather than duplicating their logic.

---

# Architecture

```text
                         ┌──────────────────────┐
                         │      AI Agent        │
                         │   Groq / GPT-OSS     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Agent Proposal     │
                         │ Goal / Budget /      │
                         │ Parameters / Intent  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │          Proto-Y              │
                    │     Deterministic Layer       │
                    └──────────────┬────────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
       Intent Engine         Risk Engine          Economics Engine
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   ▼
                         ┌──────────────────────┐
                         │ Provider Selection   │
                         │ Reputation + Memory  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Payment Decision     │
                         │ ALLOW / ESCALATE /   │
                         │ DENY                 │
                         └──────────┬───────────┘
                                    │
                           Only ALLOW continues
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       x402           │
                         │ HTTP 402 → Payment   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Algorand TestNet     │
                         │ Settlement           │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Protected Service    │
                         │ / Research API       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Outcome Verification │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
              Reputation Update              Agent Memory
```

---

# Agent Proposal Layer

Groq generates a structured proposal describing what the agent wants to accomplish.

The proposal can contain:

* Agent identity
* Goal
* Budget
* Parameters
* Requested service
* Proposed transaction context

The AI model is intentionally kept at the **proposal layer**.

It cannot directly execute a payment.

This distinction is critical because an LLM output should not itself be treated as a financial authorization.

---

# Deterministic Proto-Y Decision Layer

After the proposal is generated, Proto-Y evaluates it using deterministic engines.

## 1. Intent Classification

The system classifies the requested action.

Example:

```text
ANALYSIS
```

The intent becomes part of the transaction decision rather than relying exclusively on the LLM's interpretation.

---

## 2. Risk Evaluation

The risk engine evaluates transaction risk.

The resulting risk score contributes to the final payment decision.

Example verified transaction:

```text
Risk Score: 0
Decision: ALLOW
```

---

## 3. Economic Evaluation

Proto-Y evaluates the requested transaction against the supplied budget and economic constraints.

This prevents the AI from freely spending outside the permitted transaction boundary.

---

## 4. Provider Selection

Proto-Y selects the service provider using the existing provider-selection logic.

Provider reputation and stored agent memory can influence the selection.

The verified transaction selected:

```text
Provider: ai-research
```

---

# Payment Authorization Boundary

Proto-Y introduces an explicit authorization boundary:

```text
ALLOW
ESCALATE
DENY
```

### ALLOW

The transaction can proceed to payment.

### ESCALATE

The transaction is blocked from autonomous payment and requires additional handling.

### DENY

The transaction is rejected before payment.

The AI model cannot override these deterministic decisions.

This is one of the core security properties of the implementation.

---

# x402 Payment Flow

Proto-Y is integrated with the x402 payment flow.

The protected service initially responds with:

```text
HTTP 402 Payment Required
```

The Proto-Y payment client then:

1. Receives the payment requirement.
2. Decodes the required payment metadata.
3. Creates the required payment authorization.
4. Signs the Algorand transaction.
5. Submits the payment through the x402 flow.
6. Waits for settlement.
7. Retries the protected request with the payment proof.
8. Accepts the service response only after successful settlement.

Conceptually:

```text
Agent
  │
  ▼
Proto-Y
  │
  ▼
Protected API
  │
  └── HTTP 402
        │
        ▼
   Payment Requirement
        │
        ▼
   Algorand Payment
        │
        ▼
   x402 Facilitator
        │
        ▼
    Settlement
        │
        ▼
   Protected API
        │
        ▼
     HTTP 200
```

---

# Settlement Verification

Proto-Y does not treat a locally generated transaction object as proof of successful payment.

The payment lifecycle requires actual settlement.

The verified implementation successfully produced a real TestNet transaction and independently confirmed it through the Algorand TestNet indexer.

### Verified transaction

```text
TxID:
4P3JYHZKSSI5CDIUJTCABVTLMVJ5327NYQOSBMKUECIDFDP5UGXQ

Network:
Algorand TestNet

Asset:
10458941

Amount:
50,000 microUSDC

Round:
66,498,361
```

The transaction was independently verified on-chain with the expected payer, receiver, asset and amount.

---

# Service Execution

Payment settlement is only one part of transaction integrity.

After settlement, Proto-Y executes the protected service request.

For the verified flow:

```text
Payment Required
      ↓
Signed Payment
      ↓
Settlement
      ↓
Service Request
      ↓
HTTP 200
      ↓
Service Result
```

The system therefore distinguishes between:

* payment attempted
* payment settled
* service executed
* useful outcome delivered

---

# Outcome Verification

Proto-Y evaluates the result returned by the service after payment.

This prevents the transaction from being considered successful merely because the blockchain payment succeeded.

The verified transaction produced:

```text
Outcome Score: 100 / 100
Outcome: TRUST
```

This allows Proto-Y to evaluate the actual value delivered by the provider.

---

# Provider Reputation

Provider reputation is updated after the transaction outcome is known.

For the verified TestNet transaction:

```text
Before: 0.88
After:  0.92
```

This means provider selection can become increasingly informed by observed transaction history rather than relying solely on static assumptions.

---

# Agent Memory

Proto-Y stores transaction lessons after execution.

The memory layer allows the system to retain useful information from previous interactions.

The intended lifecycle is:

```text
Transaction
     ↓
Outcome
     ↓
Lesson Extraction
     ↓
Memory
     ↓
Future Provider / Decision Context
```

This creates the foundation for an agent that can improve its transaction behavior over time.

---

# Failure Handling

The transaction lifecycle explicitly handles failures at multiple stages.

## Payment Failure

If payment fails:

```text
Payment Failure
      ↓
STOP
      ↓
No false success
      ↓
No successful outcome/reputation update
```

Proto-Y does not report a successful transaction when settlement has not occurred.

---

## Service Failure After Settlement

A particularly important case is:

```text
Payment succeeds
       ↓
Service fails
```

Proto-Y does not discard this information.

Instead, the transaction can continue through outcome evaluation so that:

* the outcome reflects the failed service
* provider reputation can be affected
* a lesson can be stored in agent memory

This preserves the distinction between **payment success** and **service success**.

---

# API

## Execute an Agent Transaction

```http
POST /api/agent/execute
Content-Type: application/json
```

Example request:

```json
{
  "agentId": "agent-phase23",
  "goal": "Find the best blockchain research API",
  "budget": 100000,
  "parameters": {
    "detailLevel": "standard"
  }
}
```

The endpoint orchestrates the complete transaction lifecycle.

Conceptually, the response contains information about:

```text
Agent Proposal
Intent
Risk
Economics
Provider
Payment
Settlement
Service Result
Outcome
Reputation
Memory
```

---

# Health Check

The backend exposes:

```http
GET /health
```

This is used to verify that the service is running and that the relevant runtime configuration is available.

---

# Project Structure

The implementation is organized around the agent, orchestration route, deterministic engines, payment client, and test suites.

A simplified structure is:

```text
backend/
├── src/
│   ├── agent/
│   │   └── agent.ts
│   │
│   ├── routes/
│   │   └── agent.ts
│   │
│   ├── engines/
│   │   ├── intent/
│   │   ├── risk/
│   │   ├── economics/
│   │   ├── provider/
│   │   ├── outcome/
│   │   └── reputation/
│   │
│   ├── utils/
│   │   └── x402-client.ts
│   │
│   ├── test-agent-e2e.ts
│   └── test-http.ts
│
├── package.json
└── ...
```

> The exact directory contents may evolve as the frontend and deployment layers are added.

---

# Technology Stack

| Layer              | Technology                              |
| ------------------ | --------------------------------------- |
| Runtime            | Node.js                                 |
| Language           | TypeScript                              |
| AI Agent           | Groq                                    |
| Model              | `openai/gpt-oss-20b`                    |
| Payment Protocol   | x402                                    |
| Blockchain         | Algorand                                |
| Test Payment Asset | ASA `10458941`                          |
| Payment Asset      | USDC                                    |
| Network            | Algorand TestNet                        |
| API                | HTTP / REST                             |
| Testing            | Project test suites + TypeScript checks |

---

# Environment Configuration

The backend uses environment configuration for runtime values such as:

```text
Groq API credentials
Algorand configuration
Wallet credentials
Receiver address
ASA configuration
x402 configuration
Port
```

### Security

**Never commit private keys, mnemonics, API keys, or other secrets to Git.**

Use environment variables or a secure secret manager.

The verified implementation did not print or add secrets to source code.

---

# Running the Backend

From the backend directory:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Or start the TypeScript entry point directly where configured:

```bash
npx tsx src/index.ts
```

---

# Verification

The implementation was validated using the following checks.

## TypeScript

```bash
npm run typecheck
```

**PASS**

---

## Production Build

```bash
npm run build
```

**PASS**

---

## Engine Tests

```bash
npm run test:engines
```

**PASS**

---

## HTTP Tests

```bash
npm run test:http
```

**PASS**

The HTTP smoke tests were also repaired to target the current `/api/v1/research` route rather than removed `/api/test` routes.

---

## Existing E2E Tests

```bash
npm run test:e2e
```

**PASS — 7/7**

---

## Agent E2E Tests

```bash
npm run test:agent-e2e
```

**PASS — 5/5**

---

# End-to-End Verification

The most important validation was not a mocked payment.

A complete HTTP request was executed through:

```text
/api/agent/execute
```

with Groq enabled.

The resulting flow was:

```text
Groq Proposal
      ↓
Intent Classification
      ↓
Risk Evaluation
      ↓
Economics Evaluation
      ↓
Provider Selection
      ↓
ALLOW
      ↓
HTTP 402
      ↓
Signed Algorand Payment
      ↓
x402 Settlement
      ↓
HTTP 200
      ↓
Outcome Verification
      ↓
Reputation Update
      ↓
Agent Memory
```

The real TestNet transaction was then independently checked through the Algorand indexer.

---

# Verified Result

```text
Agent:
agent-phase23

Goal:
Find the best blockchain research API

Intent:
ANALYSIS

Risk:
0

Decision:
ALLOW

Provider:
ai-research

Payment:
50,000 microUSDC

Asset:
10458941

Outcome:
100 / 100

Trust:
TRUST

Reputation:
0.88 → 0.92

Memory:
Stored with lessons
```

This demonstrates that Proto-Y is not merely an AI recommendation layer or payment wrapper.

It connects:

> **reasoning → deterministic authorization → payment → settlement → service → outcome → reputation → memory**

into one transaction lifecycle.

---

# Security Model

Proto-Y is designed around the principle of **bounded agent autonomy**.

The AI agent is allowed to:

* interpret goals
* generate proposals
* reason about possible actions

But it is not trusted to independently authorize financial transactions.

Deterministic Proto-Y components enforce:

* intent constraints
* risk thresholds
* budget constraints
* provider selection
* payment authorization
* settlement verification

Therefore:

```text
LLM
 │
 │ proposes
 ▼
Proto-Y
 │
 │ authorizes
 ▼
Payment
```

rather than:

```text
LLM
 │
 │ directly controls
 ▼
Wallet
```

---

# Design Philosophy

## 1. Separate intelligence from authorization

AI is useful for reasoning, but financial authorization should remain deterministic.

## 2. Payment is not success

A successful blockchain transaction does not automatically mean that a service delivered useful value.

## 3. Outcomes matter

The service result must be evaluated independently from the payment.

## 4. Reputation should be earned

Provider reputation changes based on observed transaction outcomes.

## 5. Agents should learn from transactions

Every completed transaction can contribute information to future decision-making.

## 6. Fail safely

Failed payments and failed services must not be represented as successful transactions.

---

# Current Status

### Backend

**COMPLETE**

The backend master flow has been integrated and verified.

### TestNet

**VERIFIED**

A real x402 payment was successfully executed and independently confirmed on Algorand TestNet.

### Frontend

**NEXT**

The frontend will expose the transaction lifecycle through a polished user interface.

### Mainnet

**NEXT**

Mainnet configuration and a deliberately small real transaction remain to be performed.

### Deployment

**NEXT**

Production deployment and final end-to-end verification remain.

---

# Roadmap

```text
[x] Agent orchestration
[x] Groq agent proposal
[x] Intent engine
[x] Risk engine
[x] Economics engine
[x] Provider selection
[x] Payment authorization boundary
[x] x402 integration
[x] Algorand TestNet payment
[x] Settlement verification
[x] Service execution
[x] Outcome verification
[x] Reputation update
[x] Agent memory
[x] Failure handling
[x] Agent E2E tests
[x] HTTP tests
[x] Build verification

[ ] Production frontend
[ ] Mainnet configuration
[ ] Dedicated Mainnet wallet funding
[ ] Tiny Mainnet payment
[ ] Production backend deployment
[ ] Production frontend deployment
[ ] Final deployed E2E verification
```

---

# Why Proto-Y?

Autonomous agents are moving from **generating information** toward **taking actions**.

Once an agent can spend money, access paid services, and make decisions independently, a new question emerges:

> **How do we know that the transaction itself was trustworthy?**

Proto-Y provides an integrity layer around that transaction.

It does not attempt to replace the agent.

It makes the agent **safer to trust**.

```text
        AI Agent
           │
           ▼
     ┌─────────────┐
     │   Proto-Y   │
     │             │
     │ Think       │
     │ Evaluate    │
     │ Authorize   │
     │ Verify      │
     │ Learn       │
     └──────┬──────┘
            │
            ▼
      Paid Services
            │
            ▼
       Real Outcomes
```

---

# License

This project is licensed under the **Apache License, Version 2.0**.

A copy of the license should be included in the repository root as:

```text
LICENSE
```

The full license text is available from the Apache Software Foundation:

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0?utm_source=chatgpt.com)

Apache's official guidance recommends including the full license in a root `LICENSE` file when applying Apache-2.0 to a software distribution.

---

## Apache License 2.0 Notice

```text
Copyright 2026 Shreya Jha

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

# Acknowledgements

Proto-Y builds upon open technologies and protocols including:

* **Algorand** for blockchain settlement
* **x402** for HTTP-native payment flows
* **Groq** for agent reasoning
* **TypeScript** for backend implementation

---

<p align="center">
  <strong>Proto-Y</strong><br/>
  <em>Making autonomous transactions safer, verifiable, and learnable.</em>
</p>
