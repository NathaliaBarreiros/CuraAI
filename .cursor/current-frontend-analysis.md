# CuraAI Current Frontend Analysis

## Overview
CuraAI frontend is built with **Next.js 14**, **Privy Auth**, and **Wagmi** for wallet integration. It follows a simple flow: Login → Onboarding → Main → Dashboard.

## Current Architecture

### **Authentication Stack**
- **Privy Provider** (`providers/PrivyProvider.js`)
  - Supports: Email, Google, Wallet login
  - Creates embedded wallets automatically
  - Configured for Mainnet + Sepolia
  - App ID: `cmey8r7xh00gcl80bojtalleb`

### **User Flow**
1. **Login Screen** → Privy authentication
2. **Onboarding Form** → Collect demographics (name, age, nationality, gender)
3. **Main Screen** → Profile summary + "Init Medical AI Agent" button
4. **Dashboard** → Session history + Quick actions

### **Key Components**

#### **1. OnboardingForm (`components/onboarding-form.tsx`)**
**Current Data Collection:**
```typescript
type User = {
  email: string,
  name: string,
  age: string,        // 18-120 validation
  nationality: string, // Dropdown with countries
  gender: string      // Female/Male/Non-binary/Prefer not to say
}
```

**Current Process:**
- Form validation (age 18-120, required fields)
- Derives encryption key from wallet signature
- Stores data in React state (NOT encrypted)
- TODO comment: `//TODO connectWithZama()`

**Key Functions:**
- `handleDerive()` - Creates encryption key from wallet signature
- `deriveEncryptionKeyFromSignature()` - Uses wallet address + signature

#### **2. Dashboard (`components/dashboard.tsx`)**
**Current Features:**
- Displays user profile (name, email)
- Shows wallet address
- Mock session history
- "Init Medical AI Agent" button
- Quick actions (Schedule, Update Profile, etc.)

**Current Limitations:**
- No real data persistence
- No encrypted data handling
- Mock session data only

#### **3. Main App (`app/page.tsx`)**
**State Management:**
- Simple React state for user data
- View routing: login → onboarding → main → dashboard
- Privy authentication hooks

### **Current Data Flow**
```
1. User logs in with Privy (email/Google/wallet)
2. If new user → OnboardingForm
3. Form collects: name, age, nationality, gender
4. Derives encryption key from wallet signature
5. Stores in React state (plain text)
6. Navigates to Main → Dashboard
```

## Current Limitations for Zama Integration

### **1. No Blockchain Integration**
- Data stored only in React state
- No smart contract interaction
- No persistent storage

### **2. No FHE Encryption**
- Form data stored as plain text
- Encryption key derived but not used
- No Zama SDK integration

### **3. No Statistics**
- No aggregated data collection
- No provider dashboard
- No encrypted analytics

### **4. Missing Infrastructure**
- No Hardhat setup in main project
- No smart contract deployment
- No FHEVM integration

## Current Strengths for Integration

### **1. Wallet Integration Ready**
- Privy + Wagmi already configured
- Wallet address available via `useAccount()`
- Signature capability for FHE authentication

### **2. Clean Component Structure**
- Modular components easy to modify
- Clear separation of concerns
- TypeScript throughout

### **3. Form Data Structure**
- Already collecting the right demographic data
- Validation in place
- Ready for encryption

### **4. UI/UX Complete**
- Professional design
- Responsive layout
- Good user experience flow

## Integration Points Identified

### **1. OnboardingForm Modifications Needed**
- Replace plain text storage with FHE encryption
- Add Zama SDK integration
- Submit encrypted data to smart contract
- Cache decrypted data locally

### **2. Dashboard Enhancements Needed**
- Add statistics section
- Decrypt user data on load
- Display aggregated demographics
- Provider view for statistics

### **3. New Infrastructure Needed**
- Smart contract deployment setup
- FHEVM SDK integration
- Contract interaction hooks
- Local data caching strategy

### **4. State Management Updates**
- Add encrypted data handling
- Contract interaction state
- Statistics data management
- Error handling for FHE operations
