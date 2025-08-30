# CuraAI – Privacy-First Voice Agent for Telehealth Onboarding

## Overview
**CuraAI** is a **voice-based AI agent** that streamlines patient intake for telehealth, built with a privacy-first architecture.  
Patients fill out a short form (name, date of birth, location, gender) and interact with an AI voice agent that asks about symptoms, provides guidance, and generates structured summaries.  
Severe cases trigger escalation (e.g., emergency alerts or scheduling).  

### Privacy Architecture
- **Privy** → wallet-based identity & per-user key management  
- **Phala TEE** → ephemeral, in-session inference (voice AI runs in secure enclave; session dies after use)  
- **Zama FHE** → encrypted aggregation of demographic data (age, location, gender)  
- **Filecoin** → encrypted storage of patient summaries (symptoms, probabilities of illness, advice)  
- **Lisk** → micropayments + session receipts  
- **v0 by Vercel** → rapid frontend build (onboarding, call initiation, dashboard)  

---

## Hackathon Tracks
- Lisk  
- Zama  
- Filecoin  
- v0 by Vercel  
- Phala (TEE)  

---

## Tech Stack
- **Frontend:** v0 (Next.js + Tailwind, deployed on Vercel)  
- **Voice AI:** Twilio + OpenAI Realtime API  
- **Privacy/Encryption:** Privy, Zama FHE, Phala TEE (mock)  
- **Storage:** Filecoin (via SynapseSDK)  
- **Blockchain:** Lisk (scaffold-lisk starter)  

---

## Quickstart (Hackathon Demo Setup)
> ⚠️ This is a lightweight guide for hackathon demo purposes. Some steps may be placeholders.  

### Prerequisites
- Node.js + npm  
- Git + GitHub account  
- Privy API key  
- Twilio account + number  
- Access to Filecoin Calibration Testnet  
- Lisk scaffold starter  

### Setup
```bash
# Clone repo
git clone https://github.com/<your-org>/curaai.git
cd curaai

# Install deps
npm install

# Run frontend (V0/Next.js)
npm run dev

# Deploy to Vercel (optional)
vercel deploy
```

---

## Usage
1. **Onboarding:** Login via Gmail → Privy wallet created → fill 4-question form.  
2. **Call Session:** User initiates AI call via Twilio → processed in Phala TEE (mock).  
3. **Summary:** AI generates structured record → encrypted w/ Privy key → stored on Filecoin.  
4. **Retrieval:** User logs back in → Privy re-derives key → fetch + decrypt summary.  
5. **Provider Demo:** Mock inbox UI (screenshot shown in demo).  

---

## Architecture Diagram (textual)
```
User → Form (V0) → Zama FHE (encrypted stats)
    → Voice Call (Twilio) → Phala TEE (AI inference)
    → Session Summary → Encrypted w/ Privy Key → Filecoin Storage
    → Lisk Contract → Payment + Receipt
```
---

## Future Work
- Expand Zama FHE usage to include **symptom-trend statistics** (not just demographics).  
- Deploy AI agent fully inside Phala TEE instead of mocked enclave.  
- Expand provider dashboard into fully functional portal.  

---

## Team
- Nathalia – Backend/Privacy  
- Fernando – Frontend (v0)  
- Mauro – AI & Fullstack  
- Nathaniel – Product Lead  

---

In summary: **CuraAI = privacy-first telehealth intake agent, combining TEEs, FHE, Filecoin, Lisk, and rapid v0 frontend into a single demo-ready flow.**
