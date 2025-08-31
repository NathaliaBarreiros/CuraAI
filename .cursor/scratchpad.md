# CuraAI Development Plan - Project Scratchpad

## Background and Motivation

**Project:** CuraAI - Privacy-First Voice Agent for Telehealth Onboarding

**Core Mission:** Build a voice-based AI agent that streamlines patient intake for telehealth with a privacy-first architecture. The system allows patients to fill out a short form and interact with an AI voice agent that asks about symptoms, provides guidance, and generates structured summaries.

**Key Value Propositions:**
- Privacy-first architecture using cutting-edge encryption technologies
- Streamlined patient intake process reducing healthcare administrative burden
- Emergency escalation capabilities for severe cases
- Comprehensive patient data protection through multiple layers of encryption

**Target Audience:** Healthcare providers, telehealth platforms, patients requiring remote medical consultations

**Hackathon Context:** This is a hackathon project targeting multiple tracks: Lisk, Zama, Filecoin, v0 by Vercel, and Phala (TEE)

## Key Challenges and Analysis

### Technical Architecture Challenges
1. **Multi-Platform Integration**: Seamlessly integrating 5+ different technologies (Privy, Phala TEE, Zama FHE, Filecoin, Lisk)
2. **Privacy Compliance**: Ensuring HIPAA compliance while maintaining usability
3. **Real-time Voice Processing**: Implementing reliable voice AI with OpenAI Realtime API + Twilio
4. **Encryption Key Management**: Secure per-user key derivation and management through Privy
5. **Session Ephemeral Security**: Ensuring voice AI sessions are truly ephemeral in TEE environment

### Implementation Priorities
1. **Core User Flow**: Basic form → voice call → encrypted summary → retrieval
2. **Privacy Infrastructure**: Wallet-based identity, encryption at rest and in transit
3. **Integration Points**: Each technology must work seamlessly with others
4. **Demo Readiness**: Must be functional for hackathon presentation

### Success Metrics
- Functional end-to-end patient onboarding flow
- Successful integration of all 5 privacy technologies
- Demo-ready UI with good UX
- Encrypted data storage and retrieval working
- Mock provider dashboard for healthcare professionals

## High-level Task Breakdown

### Phase 1: Foundation Setup (Priority: Critical)
- [ ] **Task 1.1**: Initialize Next.js project with v0/Vercel integration
  - Success Criteria: `npm run dev` works, basic routing setup, Tailwind configured
  - Dependencies: Node.js, v0 CLI
  
- [ ] **Task 1.2**: Configure project structure and dependencies
  - Success Criteria: All required packages installed, TypeScript configured, folder structure organized
  - Dependencies: package.json with all integrations listed

- [ ] **Task 1.3**: Setup environment configuration
  - Success Criteria: .env.example created with all required API keys, configuration management system
  - Dependencies: API key placeholders for all services

### Phase 2: Core Authentication & Privacy Infrastructure (Priority: Critical)
- [ ] **Task 2.1**: Implement Privy wallet-based authentication
  - Success Criteria: Users can login with Gmail, wallet creation works, key derivation functional
  - Dependencies: Privy API key, authentication flow tested

- [ ] **Task 2.2**: Setup Zama FHE for demographic encryption
  - Success Criteria: Age, location, gender data encrypted before aggregation
  - Dependencies: Zama SDK integration, encryption/decryption functions

- [ ] **Task 2.3**: Configure Filecoin storage integration
  - Success Criteria: Can store and retrieve encrypted patient summaries
  - Dependencies: SynapseSDK integration, Filecoin Calibration Testnet access

### Phase 3: Frontend User Interface (Priority: High)
- [ ] **Task 3.1**: Build patient onboarding form
  - Success Criteria: 4-question form (name, DOB, location, gender) with validation
  - Dependencies: Form validation, UI components

- [ ] **Task 3.2**: Create voice call initiation interface
  - Success Criteria: UI to start voice session, connection status indicators
  - Dependencies: Twilio integration ready

- [ ] **Task 3.3**: Implement patient dashboard
  - Success Criteria: Users can view their encrypted summaries after retrieval
  - Dependencies: Decryption functionality, data display components

### Phase 4: Voice AI Integration (Priority: High)
- [ ] **Task 4.1**: Setup Twilio voice integration
  - Success Criteria: Can initiate voice calls, audio routing works
  - Dependencies: Twilio account, phone number configuration

- [ ] **Task 4.2**: Integrate OpenAI Realtime API
  - Success Criteria: AI can conduct symptom interviews, generate structured responses
  - Dependencies: OpenAI API key, voice processing pipeline

- [ ] **Task 4.3**: Implement Phala TEE simulation
  - Success Criteria: Voice processing appears to run in secure enclave (mock for demo)
  - Dependencies: TEE integration understanding, security indicators

### Phase 5: Blockchain & Payment Integration (Priority: Medium)
- [ ] **Task 5.1**: Setup Lisk blockchain integration
  - Success Criteria: Smart contract for session receipts, micropayment functionality
  - Dependencies: Lisk scaffold starter, contract deployment

- [ ] **Task 5.2**: Implement session payment flow
  - Success Criteria: Users can pay for sessions, receipts stored on-chain
  - Dependencies: Lisk integration, payment UI

### Phase 6: Provider Dashboard (Priority: Medium)
- [ ] **Task 6.1**: Create mock provider interface
  - Success Criteria: Healthcare providers can view patient summaries (mock data)
  - Dependencies: UI mockups, basic provider authentication

- [ ] **Task 6.2**: Implement emergency escalation UI
  - Success Criteria: Severe cases trigger visible alerts in provider dashboard
  - Dependencies: Severity detection logic, alert system

### Phase 7: Integration & Testing (Priority: High)
- [ ] **Task 7.1**: End-to-end flow testing
  - Success Criteria: Complete user journey works from form to summary retrieval
  - Dependencies: All previous phases completed

- [ ] **Task 7.2**: Privacy security validation
  - Success Criteria: Data encryption verified at each step, key management tested
  - Dependencies: Security testing tools, encryption verification

### Phase 8: Demo Preparation (Priority: Critical)
- [ ] **Task 8.1**: Create demo data and scenarios
  - Success Criteria: Compelling demo scenarios prepared, mock patient data ready
  - Dependencies: Demo script, test cases

- [ ] **Task 8.2**: Deploy to production environment
  - Success Criteria: Application deployed on Vercel, all integrations working in production
  - Dependencies: Production deployment pipeline

- [ ] **Task 8.3**: Prepare presentation materials
  - Success Criteria: Architecture diagrams, demo flow documentation, pitch deck ready
  - Dependencies: Documentation complete, demo tested

## Project Status Board

### Currently In Progress
- [ ] Zama FHE integration planning and setup

### Pending Tasks
- [ ] All original phases pending - awaiting main development
- [ ] Zama integration phases (see zama-integration.md)

### Completed Tasks
- [x] Project repository setup and .gitignore configuration
- [x] Initial project planning and task breakdown
- [x] Zama FHE integration documentation and planning

### Blocked Tasks
- None currently

## Executor's Feedback or Assistance Requests

*This section will be populated by the Executor as work progresses.*

### Current Status / Progress Tracking
- **Overall Progress**: 5% (Planning phase complete)
- **Current Phase**: Foundation Setup (Phase 1)
- **Next Milestone**: Next.js project initialization with v0 integration
- **Estimated Timeline**: 2-3 weeks for full implementation (hackathon timeline)

### Required Resources
- API Keys needed: Privy, Twilio, OpenAI, Filecoin Calibration Testnet access
- Development environment: Node.js, npm, Git
- Deployment: Vercel account for hosting

### Technical Decisions Made
- Frontend: Next.js + Tailwind via v0 by Vercel
- Voice: Twilio + OpenAI Realtime API
- Storage: Filecoin via SynapseSDK
- Blockchain: Lisk scaffold starter
- Authentication: Privy wallet-based

### Risk Assessment
- **High Risk**: Integration complexity between 5 different technologies
- **Medium Risk**: TEE implementation (using mock for hackathon)
- **Low Risk**: Frontend development with v0
- **Mitigation**: Prioritize core flow first, add complexity incrementally

## Lessons

### User Specified Lessons
- Include info useful for debugging in the program output
- Read the file before you try to edit it
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command

### Project-Specific Lessons
*To be populated as development progresses*

---

**Next Action Required**: Executor should begin with Phase 1, Task 1.1 - Initialize Next.js project with v0/Vercel integration.
