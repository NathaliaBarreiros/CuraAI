# Zama + Privy Integration Plan for CuraAI (2-Hour Sprint)

## Integration Strategy

### **Core Approach: Hybrid Architecture**
- **Privy**: Authentication + wallet management
- **Zama FHE**: Encrypted data storage + statistics
- **Local Cache**: Decrypted user data for dashboard
- **Smart Contract**: PatientDemographics with aggregated stats

## Phase 1: Smart Contract Setup (30 minutes)

### **1.1 Create PatientDemographics Contract**
**Location**: `contracts/PatientDemographics.sol`

```solidity
contract PatientDemographics is SepoliaConfig {
    // Individual encrypted data
    mapping(address => EncryptedPatientData) private patients;
    
    // Aggregated statistics (encrypted counters updated in real-time)
    euint32 public totalPatients;
    
    // Gender statistics
    euint32 public maleCount;
    euint32 public femaleCount;
    euint32 public nonBinaryCount;
    euint32 public preferNotToSayCount;
    
    // Age group statistics
    euint32 public ageGroup15_20;  // 15-20 years
    euint32 public ageGroup21_30;  // 21-30 years
    euint32 public ageGroup31_40;  // 31-40 years
    euint32 public ageGroup41_50;  // 41-50 years
    euint32 public ageGroup51_60;  // 51-60 years
    euint32 public ageGroup61Plus; // 61+ years
    
    // Country statistics (top countries)
    mapping(uint16 => euint32) public countryStats; // countryCode => count
    
    struct EncryptedPatientData {
        euint8 age;           // 18-120
        euint8 gender;        // 1=Female, 2=Male, 3=Non-binary, 4=Prefer not to say
        euint16 countryCode;  // Country mapping
        bool exists;
    }
    
    function submitPatientData(...) external {
        // Store individual data
        patients[msg.sender] = EncryptedPatientData({...});
        
        // 🔥 UPDATE STATISTICS IN REAL-TIME
        if (!patients[msg.sender].exists) {
            // Increment total patients
            totalPatients = FHE.add(totalPatients, FHE.asEuint32(1));
            
            // Update gender statistics
            updateGenderStats(gender);
            
            // Update age group statistics
            updateAgeGroupStats(age);
            
            // Update country statistics
            updateCountryStats(countryCode);
        }
    }
    
    function updateGenderStats(euint8 gender) private {
        femaleCount = FHE.add(femaleCount,
            FHE.select(FHE.eq(gender, FHE.asEuint8(1)), FHE.asEuint32(1), FHE.asEuint32(0))
        );
        maleCount = FHE.add(maleCount,
            FHE.select(FHE.eq(gender, FHE.asEuint8(2)), FHE.asEuint32(1), FHE.asEuint32(0))
        );
        nonBinaryCount = FHE.add(nonBinaryCount,
            FHE.select(FHE.eq(gender, FHE.asEuint8(3)), FHE.asEuint32(1), FHE.asEuint32(0))
        );
        preferNotToSayCount = FHE.add(preferNotToSayCount,
            FHE.select(FHE.eq(gender, FHE.asEuint8(4)), FHE.asEuint32(1), FHE.asEuint32(0))
        );
    }
    
    function updateAgeGroupStats(euint8 age) private {
        // Age 15-20
        ageGroup15_20 = FHE.add(ageGroup15_20,
            FHE.select(FHE.and(FHE.ge(age, FHE.asEuint8(15)), FHE.le(age, FHE.asEuint8(20))), 
                       FHE.asEuint32(1), FHE.asEuint32(0))
        );
        
        // Age 21-30
        ageGroup21_30 = FHE.add(ageGroup21_30,
            FHE.select(FHE.and(FHE.ge(age, FHE.asEuint8(21)), FHE.le(age, FHE.asEuint8(30))), 
                       FHE.asEuint32(1), FHE.asEuint32(0))
        );
        
        // Age 31-40
        ageGroup31_40 = FHE.add(ageGroup31_40,
            FHE.select(FHE.and(FHE.ge(age, FHE.asEuint8(31)), FHE.le(age, FHE.asEuint8(40))), 
                       FHE.asEuint32(1), FHE.asEuint32(0))
        );
        
        // Age 41-50
        ageGroup41_50 = FHE.add(ageGroup41_50,
            FHE.select(FHE.and(FHE.ge(age, FHE.asEuint8(41)), FHE.le(age, FHE.asEuint8(50))), 
                       FHE.asEuint32(1), FHE.asEuint32(0))
        );
        
        // Age 51-60
        ageGroup51_60 = FHE.add(ageGroup51_60,
            FHE.select(FHE.and(FHE.ge(age, FHE.asEuint8(51)), FHE.le(age, FHE.asEuint8(60))), 
                       FHE.asEuint32(1), FHE.asEuint32(0))
        );
        
        // Age 61+
        ageGroup61Plus = FHE.add(ageGroup61Plus,
            FHE.select(FHE.ge(age, FHE.asEuint8(61)), FHE.asEuint32(1), FHE.asEuint32(0))
        );
    }
    
    function updateCountryStats(euint16 countryCode) private {
        countryStats[countryCode] = FHE.add(countryStats[countryCode], FHE.asEuint32(1));
        }
    }
}
```

### **1.2 Hardhat Setup in Main Project**
- Copy Hardhat config from zama-template
- Install FHEVM dependencies
- Deploy script for PatientDemographics

### **1.3 Quick Deploy**
- Deploy to local Hardhat node
- Generate ABIs for frontend

## How Statistics Work (Real-time Updates)

### **🔥 Key Concept: Statistics Update Automatically**
Every time a new user submits their data via `submitPatientData()`, the encrypted counters are updated **immediately**:

```solidity
function submitPatientData(encryptedAge, encryptedGender, ...) external {
    // 1. Check if this is a new user
    bool isNewUser = !patients[msg.sender].exists;
    
    if (isNewUser) {
        // 2. Increment total counter
        totalPatients = FHE.add(totalPatients, FHE.asEuint32(1));
        
        // 3. Update gender-specific counters using FHE conditional logic
        // If gender == 1 (Female), add 1 to femaleCount, else add 0
        femaleCount = FHE.add(femaleCount,
            FHE.select(FHE.eq(gender, FHE.asEuint8(1)), FHE.asEuint32(1), FHE.asEuint32(0))
        );
        
        // If gender == 2 (Male), add 1 to maleCount, else add 0
        maleCount = FHE.add(maleCount,
            FHE.select(FHE.eq(gender, FHE.asEuint8(2)), FHE.asEuint32(1), FHE.asEuint32(0))
        );
        
        // Same logic for non-binary, age groups, countries, etc.
    }
    
    // 4. Store individual encrypted data
    patients[msg.sender] = EncryptedPatientData({...});
}
```

### **📊 Frontend Statistics Display**
```typescript
const loadCommunityStats = async () => {
    // This will only work if user has submitted data (onlyRegisteredUser modifier)
    const encryptedStats = await contract.getStatistics();
    
    // Decrypt all the aggregated counters
    const decrypted = await fhevmInstance.userDecrypt([
        // Gender stats
        { handle: encryptedStats.totalPatients, contractAddress },
        { handle: encryptedStats.femaleCount, contractAddress },
        { handle: encryptedStats.maleCount, contractAddress },
        { handle: encryptedStats.nonBinaryCount, contractAddress },
        { handle: encryptedStats.preferNotToSayCount, contractAddress },
        
        // Age group stats
        { handle: encryptedStats.ageGroup15_20, contractAddress },
        { handle: encryptedStats.ageGroup21_30, contractAddress },
        { handle: encryptedStats.ageGroup31_40, contractAddress },
        { handle: encryptedStats.ageGroup41_50, contractAddress },
        { handle: encryptedStats.ageGroup51_60, contractAddress },
        { handle: encryptedStats.ageGroup61Plus, contractAddress }
    ], signature);
    
    return {
        // Gender distribution
        totalPatients: decrypted[0],
        genderStats: {
            female: decrypted[1],
            male: decrypted[2], 
            nonBinary: decrypted[3],
            preferNotToSay: decrypted[4]
        },
        
        // Age distribution
        ageStats: {
            "15-20": decrypted[5],
            "21-30": decrypted[6],
            "31-40": decrypted[7],
            "41-50": decrypted[8],
            "51-60": decrypted[9],
            "61+": decrypted[10]
        }
    };
};

// Get country statistics separately (dynamic mapping)
const loadCountryStats = async () => {
    const topCountries = [1, 2, 3, 4, 5]; // US, CA, UK, AU, DE codes
    const countryPromises = topCountries.map(async (countryCode) => {
        const encryptedCount = await contract.countryStats(countryCode);
        const decrypted = await fhevmInstance.userDecrypt([
            { handle: encryptedCount, contractAddress }
        ], signature);
        return { countryCode, count: decrypted[0] };
    });
    
    return Promise.all(countryPromises);
};
```

## Phase 2: Frontend Integration (60 minutes)

### **2.1 Install Zama Dependencies**
```bash
npm install @zama-fhe/relayer-sdk
```

### **2.2 Copy FHEVM Hooks**
**From**: `zama-template/packages/site/fhevm/`
**To**: `lib/fhevm/`

Key files:
- `useFhevm.tsx` - Main FHEVM hook
- `FhevmDecryptionSignature.ts` - User authentication
- `fhevmTypes.ts` - Type definitions

### **2.3 Modify OnboardingForm**

**Current Flow:**
```typescript
// Plain text submission
onComplete({
  name: formData.name,
  age: formData.age,
  nationality: formData.nationality,
  gender: formData.gender,
})
```

**New Flow:**
```typescript
// FHE encrypted submission
const submitEncryptedData = async (formData) => {
  // 1. Initialize FHEVM
  const fhevmInstance = await initFhevm()
  
  // 2. Encrypt form data
  const encryptedInput = await fhevmInstance
    .createEncryptedInput(contractAddress, userAddress)
    .add8(parseInt(formData.age))           // Age as euint8
    .add8(mapGenderToCode(formData.gender)) // Gender as euint8
    .add16(mapCountryToCode(formData.nationality)) // Country as euint16
    .encrypt()
  
  // 3. Submit to smart contract
  await contract.submitPatientData(
    encryptedInput.handles[0], // age
    encryptedInput.handles[1], // gender
    encryptedInput.handles[2], // country
    encryptedInput.inputProof
  )
  
  // 4. Cache decrypted data locally
  localStorage.setItem('userDemographics', JSON.stringify({
    age: formData.age,
    gender: formData.gender,
    nationality: formData.nationality
  }))
}
```

### **2.4 Create Contract Interaction Hook**
**File**: `hooks/usePatientContract.ts`

```typescript
export const usePatientContract = () => {
  const { address } = useAccount()
  const { instance: fhevmInstance } = useFhevm()
  
  const submitPatientData = async (data) => {
    // Encryption + submission logic
  }
  
  const getMyEncryptedData = async () => {
    // Retrieve and decrypt user's own data
  }
  
  const getStatistics = async () => {
    // Get aggregated statistics
  }
  
  return { submitPatientData, getMyEncryptedData, getStatistics }
}
```

## Phase 3: Dashboard Enhancement (30 minutes)

### **3.1 Add Statistics Section**
**Modify**: `components/dashboard.tsx`

```typescript
const Dashboard = ({ userData }) => {
  const [stats, setStats] = useState(null)
  const { getStatistics } = usePatientContract()
  
  useEffect(() => {
    loadStatistics()
  }, [])
  
  const loadStatistics = async () => {
    const encryptedStats = await getStatistics()
    const decrypted = await decryptStatistics(encryptedStats)
    setStats(decrypted)
  }
  
  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* New Statistics Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Community Demographics</h3>
        
        {/* Total Users */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-cyan-600">{stats?.totalPatients}</div>
          <div className="text-gray-600">Total Registered Users</div>
        </div>
        
        {/* Gender Distribution */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Gender Distribution</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-xl font-bold text-pink-600">{stats?.genderStats?.female}</div>
              <div className="text-sm text-gray-600">Female</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{stats?.genderStats?.male}</div>
              <div className="text-sm text-gray-600">Male</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{stats?.genderStats?.nonBinary}</div>
              <div className="text-sm text-gray-600">Non-binary</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-600">{stats?.genderStats?.preferNotToSay}</div>
              <div className="text-sm text-gray-600">Prefer not to say</div>
            </div>
          </div>
        </div>
        
        {/* Age Distribution */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Age Distribution</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-bold text-green-600">{stats?.ageStats?.["15-20"]}</div>
              <div className="text-xs text-gray-600">15-20</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="font-bold text-yellow-600">{stats?.ageStats?.["21-30"]}</div>
              <div className="text-xs text-gray-600">21-30</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="font-bold text-orange-600">{stats?.ageStats?.["31-40"]}</div>
              <div className="text-xs text-gray-600">31-40</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-bold text-red-600">{stats?.ageStats?.["41-50"]}</div>
              <div className="text-xs text-gray-600">41-50</div>
            </div>
            <div className="text-center p-2 bg-indigo-50 rounded">
              <div className="font-bold text-indigo-600">{stats?.ageStats?.["51-60"]}</div>
              <div className="text-xs text-gray-600">51-60</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold text-gray-600">{stats?.ageStats?.["61+"]}</div>
              <div className="text-xs text-gray-600">61+</div>
            </div>
          </div>
        </div>
        
        {/* Top Countries */}
        <div>
          <h4 className="font-semibold mb-3">Top Countries</h4>
          <div className="space-y-2">
            {countryStats?.map(({ countryCode, count }) => (
              <div key={countryCode} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{getCountryName(countryCode)}</span>
                <span className="font-bold text-cyan-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### **3.2 User Data Loading**
```typescript
const loadUserData = async () => {
  // Try cache first
  const cached = localStorage.getItem('userDemographics')
  if (cached && isRecentCache(cached)) {
    return JSON.parse(cached)
  }
  
  // If no cache, decrypt from blockchain
  const encryptedData = await contract.getMyEncryptedData()
  const decrypted = await decryptUserData(encryptedData)
  
  // Update cache
  localStorage.setItem('userDemographics', JSON.stringify(decrypted))
  return decrypted
}
```

## Implementation Details

### **Data Mapping Functions**
```typescript
const mapGenderToCode = (gender: string): number => {
  switch (gender) {
    case 'Female': return 1
    case 'Male': return 2
    case 'Non-binary': return 3
    case 'Prefer not to say': return 4
    default: return 0
  }
}

const mapCountryToCode = (country: string): number => {
  const countryMap = {
    'US': 1, 'CA': 2, 'UK': 3, 'AU': 4, 'DE': 5,
    'FR': 6, 'JP': 7, 'Other': 999
  }
  return countryMap[country] || 999
}
```

### **Error Handling Strategy**
```typescript
const handleFHEError = (error: Error) => {
  console.error('FHE Operation failed:', error)
  
  // Fallback to local storage for demo
  if (error.message.includes('network')) {
    return loadFromLocalStorage()
  }
  
  // Show user-friendly error
  toast.error('Encryption service temporarily unavailable')
}
```

### **Caching Strategy**
```typescript
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const isRecentCache = (cached: string) => {
  const data = JSON.parse(cached)
  return Date.now() - data.timestamp < CACHE_DURATION
}

const cacheUserData = (data: any) => {
  localStorage.setItem('userDemographics', JSON.stringify({
    ...data,
    timestamp: Date.now()
  }))
}
```

## File Structure After Integration

```
CuraAI/
├── contracts/
│   └── PatientDemographics.sol
├── lib/
│   ├── fhevm/                 # Copied from zama-template
│   │   ├── useFhevm.tsx
│   │   ├── FhevmDecryptionSignature.ts
│   │   └── fhevmTypes.ts
│   └── utils.ts               # Existing + mapping functions
├── hooks/
│   └── usePatientContract.ts  # New contract interaction hook
├── components/
│   ├── onboarding-form.tsx    # Modified for FHE
│   └── dashboard.tsx          # Enhanced with statistics
├── hardhat.config.js          # New Hardhat setup
└── package.json               # Updated with Zama dependencies
```

## Success Criteria (2 Hours)

### **Must Have:**
- ✅ PatientDemographics contract deployed locally
- ✅ OnboardingForm encrypts and submits data to blockchain
- ✅ Dashboard shows user's own data (decrypted from cache)
- ✅ Dashboard displays community statistics

### **Nice to Have:**
- ✅ Error handling for FHE operations
- ✅ Loading states during encryption/decryption
- ✅ Responsive statistics visualization

### **Demo Flow:**
1. User logs in with Privy
2. Fills onboarding form → Data encrypted with FHE → Stored on blockchain
3. Views dashboard → Own data from cache + Community stats from blockchain (only if user has submitted data)
4. Statistics update in real-time as more users join
5. **Access Control**: Only users who have submitted their data can view community statistics

This plan maintains the existing Privy authentication while adding Zama FHE for data privacy and statistics, creating a seamless user experience with strong privacy guarantees.
