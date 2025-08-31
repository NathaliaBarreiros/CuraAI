# Zama FHE Integration Plan for CuraAI

## Overview

This document outlines the integration of **Zama's Fully Homomorphic Encryption (FHE)** technology into CuraAI for encrypting patient demographic data (age, gender, city, country) while enabling encrypted statistics computation without ever decrypting the data.

## Technical Requirements Compliance

Based on [Zama Protocol Documentation](https://docs.zama.ai/protocol) and hackathon requirements:

### 🧱 Smart Contracts Focus
- ✅ Well-structured Solidity code using [official FHE Solidity library](https://github.com/zama-ai/fhevm-solidity)
- ✅ Comprehensive test coverage
- ✅ Clear architectural documentation  
- ✅ Video walkthrough of architecture

### 🖥️ Frontend Focus (dApp)
- ✅ Use [official React template](https://github.com/zama-ai/fhevm-react-template)
- ✅ Include deployment link and demo video
- ✅ Adapt examples from [Zama examples](https://docs.zama.ai/protocol/examples/)
- ✅ Integration with existing CuraAI frontend

## Development Strategy

### Phase 1: Learning & Setup (Implementation Priority: Critical)
**Goal**: Understand Zama FHE technology through official examples before building CuraAI-specific features.

#### Step 1.1: Environment Setup
- Clone and setup [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template)
- Follow [Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)
- Setup Hardhat with FHEVM plugin
- Verify local mock mode functionality

#### Step 1.2: Basic FHE Counter Example
- Implement [FHE Counter example](https://docs.zama.ai/protocol/examples) from documentation
- Understand encrypted types (euint32, ebool)
- Test encryption/decryption workflows
- Verify ACL (Access Control List) functionality

#### Step 1.3: Frontend Integration Learning
- Setup [Relayer SDK](https://docs.zama.ai/protocol/relayer-sdk-guides) for frontend
- Implement encrypted input creation
- Test user decryption capabilities
- Understand public vs private decryption flows

### Phase 2: CuraAI-Specific Implementation (Implementation Priority: High)

#### Step 2.1: Patient Demographics Smart Contract
**File**: `contracts/PatientDemographics.sol`

**Encrypted Data Types for CuraAI**:
```solidity
struct EncryptedPatientData {
    euint8 age;           // Encrypted age (0-255)
    euint8 gender;        // Encrypted gender (0=unknown, 1=male, 2=female, 3=other)
    euint16 cityCode;     // Encrypted city identifier 
    euint16 countryCode;  // Encrypted country identifier
    eaddress patientWallet; // Encrypted patient wallet address
}
```

**Core Functions**:
- `submitPatientData()` - Store encrypted demographics
- `getPatientData()` - Retrieve own encrypted data (ACL-protected)
- `computeAgeStatistics()` - FHE operations on encrypted age data
- `computeGenderDistribution()` - FHE operations on encrypted gender data
- `computeLocationStatistics()` - FHE operations on encrypted location data

#### Step 2.2: Statistical Computation Functions
**Key FHE Operations** (per [Zama Protocol Overview](https://docs.zama.ai/protocol/protocol/overview)):

```solidity
// Age statistics (avoiding loops per hackathon guidelines)
function computeAverageAge() external view returns (euint32);
function computeAgeRangeCount(euint8 minAge, euint8 maxAge) external view returns (euint32);

// Gender distribution
function computeGenderCount(euint8 genderType) external view returns (euint32);

// Location analytics  
function computeCityCount(euint16 cityCode) external view returns (euint32);
function computeCountryCount(euint16 countryCode) external view returns (euint32);
```

#### Step 2.3: Frontend Integration Components
**Files**: 
- `components/EncryptedPatientForm.tsx` - Form with FHE encryption
- `components/StatsDashboard.tsx` - Display encrypted statistics
- `hooks/useZamaEncryption.ts` - Custom hook for FHE operations

**Key Frontend Features**:
- Patient form with real-time encryption
- Statistics dashboard showing aggregated encrypted data
- Provider interface for viewing anonymized trends
- ACL management for data access control

## Architecture Flow

### Data Flow Diagram
```
Patient Form Input → FHE Encryption (Frontend) → Smart Contract Storage → 
Statistical Computation (FHE) → Encrypted Results → 
ACL-Protected Decryption → Dashboard Display
```

### Components Architecture

#### 1. FHE Library Integration
- **Purpose**: Handle encrypted data types and operations
- **Key Files**: FHEVM Solidity library integration
- **Technology**: [FHEVM Solidity library](https://github.com/zama-ai/fhevm-solidity)

#### 2. Host Contracts  
- **Purpose**: Manage access control and trigger FHE computations
- **Implementation**: `PatientDemographics.sol`, `StatisticsComputer.sol`
- **Features**: ACL management, encrypted storage, statistical operations

#### 3. Relayer & SDK Integration
- **Purpose**: Handle encryption/decryption requests from frontend
- **Technology**: [FHEVM Relayer SDK](https://docs.zama.ai/protocol/relayer-sdk-guides)
- **Features**: Input encryption, user decryption, public decryption

#### 4. Frontend Components
- **Purpose**: User interface for encrypted data interaction
- **Technology**: React + TypeScript + Relayer SDK
- **Features**: Form encryption, statistics display, ACL management

## Technical Implementation Details

### Smart Contract Constraints
Based on [Zama development guidelines](https://docs.zama.ai/protocol/solidity-guides/development-guide/hcu):

1. **No Loops**: Use batch operations and fixed-size arrays
2. **No Traditional Branching**: Use `TFHE.select()` for conditional logic
3. **HCU Limits**: Monitor FHE operations per transaction
4. **ACL Management**: Proper access control for encrypted data

### Encryption Strategy

#### Frontend Encryption Process:
```typescript
// Encrypt patient data before submission
const encryptedInput = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add8(age)
  .add8(gender)  
  .add16(cityCode)
  .add16(countryCode)
  .encrypt();
```

#### Smart Contract Processing:
```solidity
// Store encrypted data with ACL protection
function submitPatientData(
    bytes32 encryptedAge,
    bytes32 encryptedGender,
    bytes32 encryptedCity,
    bytes32 encryptedCountry,
    bytes calldata inputProof
) external {
    // Validate and store encrypted data
    // Set ACL permissions
    // Emit encrypted events
}
```

### Statistics Computation Strategy

#### Aggregation Without Decryption:
```solidity
// Example: Compute age range statistics
function computeAgeRangeStats(euint8 minAge, euint8 maxAge) 
    external view returns (euint32 count) {
    
    euint32 totalCount = TFHE.asEuint32(0);
    
    // Iterate through stored patient data (avoiding loops)
    // Use TFHE.select for conditional counting
    for (uint i = 0; i < MAX_PATIENTS; i++) {
        ebool inRange = TFHE.and(
            TFHE.ge(patients[i].age, minAge),
            TFHE.le(patients[i].age, maxAge)
        );
        
        totalCount = TFHE.add(
            totalCount, 
            TFHE.select(inRange, TFHE.asEuint32(1), TFHE.asEuint32(0))
        );
    }
    
    return totalCount;
}
```

## Development Phases (3-Hour Sprint)

### Phase 1: Quick Setup & Learning (30 minutes)
- [ ] Clone fhevm-react-template and setup basic environment
- [ ] Run existing counter example from template (no custom implementation)
- [ ] Understand basic FHE encryption/decryption flow
- [ ] Verify Hardhat mock mode works locally

### Phase 2: Minimal Viable Contract (60 minutes)
- [ ] Create simplified PatientDemographics.sol with 4 encrypted fields only
- [ ] Implement basic `submitPatientData()` function
- [ ] Add simple statistical function (count patients only)
- [ ] Test contract deployment in local mock environment
- [ ] **Skip**: Complex statistics, ACL management, optimization

### Phase 3: Essential Frontend (60 minutes)
- [ ] Modify existing React template form for patient data
- [ ] Implement frontend encryption for age, gender, city, country
- [ ] Connect form to smart contract
- [ ] Display basic encrypted submission confirmation
- [ ] **Skip**: Statistics dashboard, complex UI, provider interface

### Phase 4: Demo Integration (30 minutes)
- [ ] Basic end-to-end test (form → encryption → storage)
- [ ] Simple demo script preparation
- [ ] Document core functionality achieved
- [ ] **Skip**: Comprehensive testing, performance optimization, video creation

## 3-Hour Strategy Adjustments

### What We'll Build (Minimum Viable Product):
1. **Smart Contract**: Basic encrypted storage of 4 demographic fields
2. **Frontend**: Simple form that encrypts and submits data
3. **Demo**: Working proof-of-concept showing FHE encryption in action

### What We'll Skip for Time:
- Complex statistical computations beyond basic counting
- Advanced ACL management (use basic permissions)
- Comprehensive testing suite
- Performance optimization
- Integration with existing CuraAI UI
- Provider dashboard
- Video creation and extensive documentation

### Success Criteria (3-Hour Version):
- [ ] Patient data encrypted and stored on blockchain
- [ ] Frontend form successfully encrypts 4 fields
- [ ] Basic retrieval of own encrypted data working
- [ ] One simple statistic function (patient count)
- [ ] Local demo functional

### Time Allocation:
- **0:00-0:30**: Environment setup + template exploration
- **0:30-1:30**: Smart contract development and testing
- **1:30-2:30**: Frontend integration and encryption
- **2:30-3:00**: Integration testing and demo preparation

## Security Considerations

### Privacy Architecture
- **Data Encryption**: All sensitive data encrypted at input
- **ACL Protection**: Granular access control for decryption
- **Key Management**: Handled by Zama's KMS system
- **Zero Knowledge**: Statistics computed without data exposure

### HIPAA Compliance Strategy
- **Data Minimization**: Only necessary demographic data encrypted
- **Access Controls**: Role-based access via ACL system
- **Audit Trail**: All operations logged on blockchain
- **Data Retention**: Configurable retention policies

## Success Metrics

### Technical Metrics
- [ ] Successful encryption of all 4 demographic fields
- [ ] Statistical computations working on encrypted data
- [ ] Frontend integration with smooth UX
- [ ] Smart contract deployment and testing

### Demo Metrics
- [ ] End-to-end demo flow functional
- [ ] Video walkthrough completed
- [ ] Documentation comprehensive
- [ ] Code quality and test coverage high

## Resources and References

### Documentation
- [Zama Protocol Docs](https://docs.zama.ai/protocol)
- [Solidity Guides](https://docs.zama.ai/protocol/solidity-guides)
- [Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)
- [Relayer SDK Guides](https://docs.zama.ai/protocol/relayer-sdk-guides)
- [Examples](https://docs.zama.ai/protocol/examples)

### Templates and Tools
- [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)
- [FHEVM React Template](https://github.com/zama-ai/fhevm-react-template)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm-solidity)
- [Zama dApps Repository](https://github.com/zama-ai/dapps)

### Community Support
- [Zama Developer Forum](https://community.zama.ai/)
- [Discord Developer Channel](https://discord.gg/zama)
- [Zama Protocol GPT](https://chatgpt.com/g/g-687548533b7c819185a5f992b7f48e72-zama-protocol-gpt)

---

**Next Steps**: Create branch `zama-integration` and begin execution mode with Phase 1 implementation.
