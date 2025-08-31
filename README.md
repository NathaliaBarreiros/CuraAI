# CuraAI – Privacy-First Voice Agent for Telehealth Onboarding

## Overview
**CuraAI** is a **voice-based AI agent** that streamlines patient intake for telehealth, built with a privacy-first architecture.  
Patients fill out a short form (name, date of birth, location, gender) and interact with an AI voice agent that asks about symptoms, provides guidance, and generates structured summaries.  
Severe cases trigger escalation (e.g., emergency alerts or scheduling).  

### Privacy Architecture
- **Privy** → wallet-based identity & per-user key management  
- **Phala TEE** → ephemeral, in-session inference (voice AI runs in secure enclave; session dies after use)  
- **Zama FHE** → encrypted aggregation of demographic data (age, location, gender)  
- **v0 by Vercel** → rapid frontend build (onboarding, call initiation, dashboard)  

*(Note: Lisk and Filecoin integrations are deferred to **post-hackathon future work**. The current MVP focuses on the AI, TEE, Zama, and v0 components.)*  

---

## Implemented in MVP (Hackathon Achievements)
- **Zama integration** for encrypted demographic stats (live demo).  
- **Frontend in v0 by Vercel** with onboarding, call initiation, and dashboard.  
- **Voice AI agent** with:  
  - Real voice input via Twilio + websocket streaming.  
  - Symptom discernment + follow-up questioning.  
  - Diagnosis suggestions powered by PubMed queries + natural language models.  
- **End-to-end demo flow**: onboarding → AI call → diagnosis summary → encrypted demographic stats.  

---

## Planned Future Work
- **Lisk:** micropayments + session receipts.  
- **Filecoin:** encrypted long-term storage of patient summaries.  
- **Zama:** expand to symptom-trend statistics (beyond demographics).  
- **Phala:** deploy full AI agent inside a real TEE instead of mock.  
- **Provider dashboard:** expand inbox demo into a functional portal.  

---

## Hackathon Tracks
- AI / Privacy (main track)  
- Zama (FHE demo on demographic data)  
- v0 by Vercel (frontend build)  
- Phala (TEE demo for AI agent)  

---

## Tech Stack
- **Frontend:** v0 (Next.js + Tailwind, deployed on Vercel)  
- **Voice AI:** Twilio + OpenAI Realtime API (with websocket component)  
- **Privacy/Encryption:** Privy, Zama FHE, Phala TEE (mock demo)  

---

## Demo Walkthrough
1. User logs in via Gmail → Privy wallet created.  
2. Fills 4-question form → demographics encrypted & aggregated via Zama.  
3. Starts AI call (Twilio/websocket).  
4. AI agent collects symptoms, asks follow-ups, and returns diagnosis probabilities (PubMed-backed).  
5. Dashboard shows encrypted stats + summary of diagnosis output.  

---

## Quickstart (Hackathon Demo Setup)
> Lightweight guide for hackathon demo purposes. Some steps may be placeholders.  

### Prerequisites
- Node.js + npm  
- Git + GitHub account  
- Privy API key  
- Twilio account + number  
- Access to Zama FHE demo template  

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

## Architecture Diagram (textual)
```
User → Form (V0) → Zama FHE (encrypted stats)
    → Voice Call (Twilio/Websocket) → Phala TEE (AI inference)
    → Diagnosis Summary → Displayed on Dashboard (mock storage)
```

---

## Team
- Nathalia – Backend/Privacy  
- Fernando – Frontend (v0)  
- Mauro – AI & Fullstack  
- Nathaniel – Product Lead  

---

In summary: **CuraAI = privacy-first telehealth intake agent, combining TEEs, FHE, v0 frontend, and a live PubMed-powered AI voice agent into a secure, demo-ready flow.**
