# Zama FHE (Fully Homomorphic Encryption) - Technical Explanation

## Overview

**Zama FHE** allows you to perform computations on encrypted data without ever decrypting it. The data stays encrypted on the blockchain, but you can still do math operations on it.

## Key Concepts

### 1. **Encrypted Data Types**
```solidity
euint8   // Encrypted 8-bit unsigned integer (0-255)
euint16  // Encrypted 16-bit unsigned integer (0-65535)  
euint32  // Encrypted 32-bit unsigned integer
ebool    // Encrypted boolean (true/false)
eaddress // Encrypted Ethereum address
```

### 2. **The Magic: Math on Encrypted Data**
```solidity
euint32 a = TFHE.asEuint32(5);     // Encrypt number 5
euint32 b = TFHE.asEuint32(3);     // Encrypt number 3
euint32 result = TFHE.add(a, b);   // result = encrypted(8) - NEVER decrypted!
```

## Smart Contract Implementation (FHECounter.sol)

### **Core Structure**
```solidity
contract FHECounter is SepoliaConfig {
    euint32 private _count;  // ← This NEVER exists as plaintext on-chain
    
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // 1. Convert frontend-encrypted data to internal format
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
        
        // 2. Add to encrypted counter (math on encrypted data!)
        _count = FHE.add(_count, encryptedEuint32);
        
        // 3. Set permissions - who can decrypt this data
        FHE.allowThis(_count);        // Contract can access
        FHE.allow(_count, msg.sender); // User can decrypt their own data
    }
}
```

### **Key Functions Explained**

#### **1. FHE.fromExternal()**
- Converts encrypted data from frontend to internal blockchain format
- Validates the cryptographic proof that the data is properly encrypted
- **Input**: `externalEuint32` + `inputProof` (from frontend)
- **Output**: `euint32` (internal encrypted format)

#### **2. FHE.add() / FHE.sub()**
- Performs addition/subtraction on encrypted numbers
- **The numbers are NEVER decrypted during this operation**
- Result is also encrypted

#### **3. FHE.allow() / FHE.allowThis()**
- **Access Control List (ACL)** - who can decrypt what data
- `FHE.allowThis(_count)` → Contract can access the encrypted value
- `FHE.allow(_count, msg.sender)` → User can decrypt their own data
- **Without permission, decryption fails**

## Frontend Implementation (React + FHEVM SDK)

### **1. Encryption Process (Frontend → Blockchain)**
```typescript
// Create encrypted input for the contract
const encryptedInput = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(valueToEncrypt)  // Encrypt a 32-bit number
  .encrypt();             // Generate cryptographic proof

// Send to smart contract
await contract.increment(
  encryptedInput.handles[0],    // Encrypted data
  encryptedInput.inputProof     // Proof of valid encryption
);
```

**What happens:**
1. **FHEVM SDK encrypts the number** using the contract's public key
2. **Generates a cryptographic proof** that the encryption is valid
3. **Sends both encrypted data + proof** to the smart contract
4. **Smart contract validates the proof** before accepting the data

### **2. Decryption Process (Blockchain → Frontend)**
```typescript
// Get encrypted handle from contract
const encryptedHandle = await contract.getCount();

// Create decryption signature (user authentication)
const sig = await FhevmDecryptionSignature.loadOrSign(
  instance,
  [contractAddress],
  ethersSigner,
  storage
);

// Decrypt using user's private key
const decryptedValue = await instance.userDecrypt(
  [{ handle: encryptedHandle, contractAddress }],
  sig.privateKey,
  sig.publicKey, 
  sig.signature,
  sig.contractAddresses,
  sig.userAddress,
  sig.startTimestamp,
  sig.durationDays
);
```

**What happens:**
1. **Contract returns encrypted handle** (not the actual value)
2. **User signs a decryption request** with their private key
3. **FHEVM validates ACL permissions** (can this user decrypt this data?)
4. **If authorized, returns the decrypted value** to the user

## Advanced FHE Operations

### **Conditional Logic (No Traditional If/Else)**
```solidity
// ❌ This doesn't work - can't branch on encrypted data
if (encryptedAge > 18) { ... }

// ✅ This works - conditional selection
euint8 result = TFHE.select(
  TFHE.gt(encryptedAge, TFHE.asEuint8(18)),  // condition
  TFHE.asEuint8(1),                          // if true
  TFHE.asEuint8(0)                           // if false
);
```

### **Comparison Operations**
```solidity
ebool isEqual = TFHE.eq(a, b);        // a == b
ebool isGreater = TFHE.gt(a, b);      // a > b  
ebool isLess = TFHE.lt(a, b);         // a < b
ebool isGreaterEq = TFHE.ge(a, b);    // a >= b
```

### **Logical Operations**
```solidity
ebool result = TFHE.and(condition1, condition2);  // AND
ebool result = TFHE.or(condition1, condition2);   // OR
ebool result = TFHE.not(condition1);              // NOT
```

## For CuraAI Patient Demographics

### **Smart Contract Structure**
```solidity
struct EncryptedPatientData {
    euint8 age;           // Encrypted age (0-255)
    euint8 gender;        // Encrypted gender (0=unknown, 1=male, 2=female, 3=other)
    euint16 cityCode;     // Encrypted city identifier 
    euint16 countryCode;  // Encrypted country identifier
}

mapping(address => EncryptedPatientData) private patients;
```

### **Statistical Operations (Without Decryption)**
```solidity
// Count patients by gender without revealing individual data
function countPatientsByGender(euint8 targetGender) external view returns (euint32) {
    euint32 count = TFHE.asEuint32(0);
    
    for (uint i = 0; i < patientAddresses.length; i++) {
        // Compare encrypted gender with target (never decrypted)
        ebool matches = TFHE.eq(patients[patientAddresses[i]].gender, targetGender);
        
        // Add 1 if matches, 0 if not (conditional addition)
        count = TFHE.add(
            count,
            TFHE.select(matches, TFHE.asEuint32(1), TFHE.asEuint32(0))
        );
    }
    
    return count; // Returns encrypted count
}
```

### **Frontend Integration for CuraAI**
```typescript
// Encrypt patient form data
const encryptedInput = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add8(age)        // Encrypt age
  .add8(gender)     // Encrypt gender  
  .add16(cityCode)  // Encrypt city
  .add16(countryCode) // Encrypt country
  .encrypt();

// Submit to contract
await contract.submitPatientData(
  encryptedInput.handles[0], // age
  encryptedInput.handles[1], // gender
  encryptedInput.handles[2], // city
  encryptedInput.handles[3], // country
  encryptedInput.inputProof
);
```

## Key Advantages for Healthcare

### **1. Privacy-First**
- Patient data **never exists as plaintext** on the blockchain
- Only authorized parties can decrypt specific data
- Statistics can be computed without exposing individual records

### **2. HIPAA Compliance**
- Data is encrypted at rest and in transit
- Granular access control through ACL system
- Audit trail of all operations on blockchain

### **3. Computational Privacy**
- Can compute averages, counts, distributions on encrypted data
- Results are also encrypted until authorized decryption
- No need to trust a central authority with plaintext data

## Important Limitations

### **1. No Loops in Production**
- FHE operations are computationally expensive
- Each operation consumes "HCU" (FHE Computation Units)
- Loops can exceed transaction gas limits

### **2. No Traditional Branching**
- Can't use `if/else` on encrypted data
- Must use `TFHE.select()` for conditional logic

### **3. Limited Data Types**
- Only specific encrypted types supported
- No encrypted strings (use numeric codes instead)

## Summary for CuraAI Implementation

**What you need to understand:**
1. **Data stays encrypted on-chain** - never as plaintext
2. **Math operations work on encrypted data** - no decryption needed
3. **ACL system controls who can decrypt what** - granular permissions
4. **Frontend encrypts before sending** - backend never sees plaintext
5. **Statistics possible without revealing individual data** - privacy-preserving analytics

This enables CuraAI to store patient demographics securely while still computing useful statistics for healthcare providers.
