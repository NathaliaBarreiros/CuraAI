# CuraAI FHE Architecture - Data Access Patterns

## Two Different Use Cases

### 1. **Individual User Data** (Private Dashboard)
**Purpose**: User sees their own data in their dashboard
**Access**: Only the user can decrypt their own data

### 2. **Aggregated Statistics** (Public/Provider Dashboard)  
**Purpose**: Healthcare providers see population statistics
**Access**: Anyone can see aggregated stats (but not individual data)

## Architecture Design

### **Smart Contract Structure**
```solidity
contract PatientDemographics is SepoliaConfig {
    // Individual encrypted patient data (private to each user)
    mapping(address => EncryptedPatientData) private patients;
    
    // Aggregated statistics (public, but encrypted)
    euint32 public totalPatients;
    euint32 public maleCount;
    euint32 public femaleCount;
    euint32 public otherGenderCount;
    
    // Age group counters
    euint32 public ageGroup0_18;   // 0-18 years
    euint32 public ageGroup19_35;  // 19-35 years  
    euint32 public ageGroup36_50;  // 36-50 years
    euint32 public ageGroup51Plus; // 51+ years
    
    // Country/city counters (top 10 most common)
    mapping(uint16 => euint32) public countryStats;
    mapping(uint16 => euint32) public cityStats;
    
    struct EncryptedPatientData {
        euint8 age;
        euint8 gender;
        euint16 cityCode;
        euint16 countryCode;
        bool exists;
    }
}
```

## 1. Individual User Data Access

### **Problem**: Is FHE decryption too heavy for dashboard?
**Answer**: Yes, it can be expensive for frequent access.

### **Solution**: Hybrid Approach
```solidity
// Store both encrypted (for privacy) and hash (for verification)
struct PatientData {
    euint8 age;           // Encrypted for statistics
    euint8 gender;        // Encrypted for statistics  
    euint16 cityCode;     // Encrypted for statistics
    euint16 countryCode;  // Encrypted for statistics
    
    // Hash for quick verification (not encrypted)
    bytes32 dataHash;     // keccak256(age, gender, city, country)
    bool exists;
}

// User can decrypt their data when needed
function getMyEncryptedData() external view returns (
    euint8 age,
    euint8 gender, 
    euint16 city,
    euint16 country
) {
    require(patients[msg.sender].exists, "No data found");
    PatientData memory data = patients[msg.sender];
    return (data.age, data.gender, data.cityCode, data.countryCode);
}
```

### **Frontend Strategy for User Dashboard**
```typescript
// Option 1: Decrypt once, cache locally (recommended)
const decryptAndCache = async () => {
    const encryptedData = await contract.getMyEncryptedData();
    
    // Decrypt once
    const decrypted = await instance.userDecrypt([
        { handle: encryptedData.age, contractAddress },
        { handle: encryptedData.gender, contractAddress },
        { handle: encryptedData.city, contractAddress },
        { handle: encryptedData.country, contractAddress }
    ], privateKey, publicKey, signature);
    
    // Cache in localStorage/sessionStorage
    localStorage.setItem('userDemographics', JSON.stringify(decrypted));
};

// Option 2: Store in Privy's encrypted storage
// This way data is encrypted with user's Privy key, not FHE
```

## 2. Aggregated Statistics Implementation

### **The Challenge**: Aggregate data from ALL users
**Solution**: Update counters when each user submits data

```solidity
function submitPatientData(
    externalEuint8 encryptedAge,
    bytes calldata ageProof,
    externalEuint8 encryptedGender, 
    bytes calldata genderProof,
    externalEuint16 encryptedCity,
    bytes calldata cityProof,
    externalEuint16 encryptedCountry,
    bytes calldata countryProof
) external {
    // Convert to internal encrypted format
    euint8 age = FHE.fromExternal(encryptedAge, ageProof);
    euint8 gender = FHE.fromExternal(encryptedGender, genderProof);
    euint16 cityCode = FHE.fromExternal(encryptedCity, cityProof);
    euint16 countryCode = FHE.fromExternal(encryptedCountry, countryProof);
    
    // Check if new patient
    bool isNewPatient = !patients[msg.sender].exists;
    
    if (isNewPatient) {
        // Increment total patients
        totalPatients = FHE.add(totalPatients, FHE.asEuint32(1));
        
        // Update gender statistics
        updateGenderStats(gender);
        
        // Update age group statistics  
        updateAgeGroupStats(age);
        
        // Update location statistics
        updateLocationStats(cityCode, countryCode);
    }
    
    // Store individual data
    patients[msg.sender] = EncryptedPatientData({
        age: age,
        gender: gender,
        cityCode: cityCode,
        countryCode: countryCode,
        exists: true
    });
    
    // Set ACL permissions
    FHE.allowThis(age);
    FHE.allow(age, msg.sender);
    // ... same for other fields
}

function updateGenderStats(euint8 gender) private {
    // Increment male counter if gender == 1
    maleCount = FHE.add(
        maleCount,
        FHE.select(
            FHE.eq(gender, FHE.asEuint8(1)),
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        )
    );
    
    // Increment female counter if gender == 2  
    femaleCount = FHE.add(
        femaleCount,
        FHE.select(
            FHE.eq(gender, FHE.asEuint8(2)),
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        )
    );
    
    // Increment other counter if gender == 3
    otherGenderCount = FHE.add(
        otherGenderCount,
        FHE.select(
            FHE.eq(gender, FHE.asEuint8(3)),
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        )
    );
}

function updateAgeGroupStats(euint8 age) private {
    // Age 0-18
    ageGroup0_18 = FHE.add(
        ageGroup0_18,
        FHE.select(
            FHE.le(age, FHE.asEuint8(18)),
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        )
    );
    
    // Age 19-35
    ageGroup19_35 = FHE.add(
        ageGroup19_35,
        FHE.select(
            FHE.and(
                FHE.ge(age, FHE.asEuint8(19)),
                FHE.le(age, FHE.asEuint8(35))
            ),
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        )
    );
    
    // Age 36-50
    ageGroup36_50 = FHE.add(
        ageGroup36_50,
        FHE.select(
            FHE.and(
                FHE.ge(age, FHE.asEuint8(36)),
                FHE.le(age, FHE.asEuint8(50))
            ),
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        )
    );
    
    // Age 51+
    ageGroup51Plus = FHE.add(
        ageGroup51Plus,
        FHE.select(
            FHE.gt(age, FHE.asEuint8(50)),
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        )
    );
}
```

## 3. Statistics Access Control

### **Who Can See Statistics?**

```solidity
// Public statistics (anyone can decrypt)
function getPublicStatistics() external view returns (
    euint32 total,
    euint32 males,
    euint32 females,
    euint32 others
) {
    return (totalPatients, maleCount, femaleCount, otherGenderCount);
}

// Provider-only statistics (more detailed)
mapping(address => bool) public authorizedProviders;

modifier onlyProvider() {
    require(authorizedProviders[msg.sender], "Not authorized provider");
    _;
}

function getDetailedStatistics() external view onlyProvider returns (
    euint32 age0_18,
    euint32 age19_35,
    euint32 age36_50,
    euint32 age51Plus
) {
    return (ageGroup0_18, ageGroup19_35, ageGroup36_50, ageGroup51Plus);
}
```

## 4. Frontend Implementation

### **User Dashboard** (Individual Data)
```typescript
// Decrypt once, cache locally
const loadUserDashboard = async () => {
    // Check cache first
    const cached = localStorage.getItem('userDemographics');
    if (cached) {
        return JSON.parse(cached);
    }
    
    // If not cached, decrypt from blockchain
    const encryptedData = await contract.getMyEncryptedData();
    const decrypted = await instance.userDecrypt([...], signature);
    
    // Cache for future use
    localStorage.setItem('userDemographics', JSON.stringify(decrypted));
    return decrypted;
};
```

### **Statistics Dashboard** (Aggregated Data)
```typescript
// Anyone can see these statistics
const loadPublicStats = async () => {
    const encryptedStats = await contract.getPublicStatistics();
    
    // Decrypt aggregated statistics
    const decrypted = await instance.userDecrypt([
        { handle: encryptedStats.total, contractAddress },
        { handle: encryptedStats.males, contractAddress },
        { handle: encryptedStats.females, contractAddress },
        { handle: encryptedStats.others, contractAddress }
    ], signature);
    
    return {
        totalPatients: decrypted[0],
        maleCount: decrypted[1],
        femaleCount: decrypted[2],
        otherCount: decrypted[3]
    };
};
```

## 5. Gas Optimization Strategy

### **Problem**: FHE operations are expensive
### **Solution**: Batch updates and efficient conditionals

```solidity
// Instead of multiple separate updates, batch them
function updateAllStats(euint8 age, euint8 gender) private {
    // Single transaction updates all relevant counters
    euint32 increment = FHE.asEuint32(1);
    
    // Update total (always)
    totalPatients = FHE.add(totalPatients, increment);
    
    // Update gender stats (3 operations in parallel)
    maleCount = FHE.add(maleCount, 
        FHE.select(FHE.eq(gender, FHE.asEuint8(1)), increment, FHE.asEuint32(0))
    );
    femaleCount = FHE.add(femaleCount,
        FHE.select(FHE.eq(gender, FHE.asEuint8(2)), increment, FHE.asEuint32(0))
    );
    otherGenderCount = FHE.add(otherGenderCount,
        FHE.select(FHE.eq(gender, FHE.asEuint8(3)), increment, FHE.asEuint32(0))
    );
}
```

## Summary

### **For Individual Data (User Dashboard)**:
- **Decrypt once, cache locally** (not every time)
- **Use Privy for non-sensitive caching**
- **FHE only for initial load**

### **For Statistics (Provider Dashboard)**:
- **Update counters on each submission** (real-time aggregation)
- **Public access to aggregated stats** (encrypted but accessible)
- **Provider-only access to detailed breakdowns**

### **Access Control**:
- **Individual data**: Only user can decrypt
- **Aggregated stats**: Anyone can decrypt (but data is still protected)
- **Detailed stats**: Only authorized providers

This approach gives you **privacy for individuals** while enabling **useful statistics for healthcare providers**.
