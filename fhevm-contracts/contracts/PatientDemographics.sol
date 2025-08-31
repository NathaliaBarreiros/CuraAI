// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint16, euint32, eaddress, externalEuint8, externalEuint16, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract PatientDemographics is SepoliaConfig {
    // Individual encrypted patient data (private to each user)
    mapping(address => EncryptedPatientData) private patients;

    // Aggregated statistics (encrypted counters updated in real-time)
    euint32 public totalPatients;

    // Gender statistics
    euint32 public femaleCount; // gender == 1
    euint32 public maleCount; // gender == 2
    euint32 public nonBinaryCount; // gender == 3
    euint32 public preferNotToSayCount; // gender == 4

    // Age group statistics
    euint32 public ageGroup15_20; // 15-20 years
    euint32 public ageGroup21_30; // 21-30 years
    euint32 public ageGroup31_40; // 31-40 years
    euint32 public ageGroup41_50; // 41-50 years
    euint32 public ageGroup51_60; // 51-60 years
    euint32 public ageGroup61Plus; // 61+ years

    // Country statistics (fixed counters for top countries)
    euint32 public ecuadorCount; // countryCode == 1
    euint32 public argentinaCount; // countryCode == 2
    euint32 public brasilCount; // countryCode == 3
    euint32 public usCount; // countryCode == 4
    euint32 public canadaCount; // countryCode == 5
    euint32 public franciaCount; // countryCode == 6

    struct EncryptedPatientData {
        euint8 age; // 15-120
        euint8 gender; // 1=Female, 2=Male, 3=Non-binary, 4=Prefer not to say
        euint16 countryCode; // Country mapping (1=Ecuador, 2=Argentina, 3=Brasil, 4=US, 5=Canada, 6=Francia)
        bool exists; // Track if data exists for this patient
    }

    // Events
    event PatientDataSubmitted(address indexed patient);
    event StatisticsUpdated(uint32 totalPatients);

    constructor() {
        // Initialize all counters to 0
        totalPatients = FHE.asEuint32(0);

        // Gender counters
        femaleCount = FHE.asEuint32(0);
        maleCount = FHE.asEuint32(0);
        nonBinaryCount = FHE.asEuint32(0);
        preferNotToSayCount = FHE.asEuint32(0);

        // Age group counters
        ageGroup15_20 = FHE.asEuint32(0);
        ageGroup21_30 = FHE.asEuint32(0);
        ageGroup31_40 = FHE.asEuint32(0);
        ageGroup41_50 = FHE.asEuint32(0);
        ageGroup51_60 = FHE.asEuint32(0);
        ageGroup61Plus = FHE.asEuint32(0);

        // Country counters
        ecuadorCount = FHE.asEuint32(0);
        argentinaCount = FHE.asEuint32(0);
        brasilCount = FHE.asEuint32(0);
        usCount = FHE.asEuint32(0);
        canadaCount = FHE.asEuint32(0);
        franciaCount = FHE.asEuint32(0);
    }

    function submitPatientData(
        externalEuint32 encryptedData,
        bytes calldata inputProof
    ) external {
        // Check if this is a new patient (prevent double counting)
        require(!patients[msg.sender].exists, "Patient data already exists");

        // Convert external encrypted input to internal format
        euint32 data = FHE.fromExternal(encryptedData, inputProof);

        // Extract fields from packed data (age=bits 0-7, gender=bits 8-15, country=bits 16-31)
        euint8 age = FHE.asEuint8(FHE.and(data, FHE.asEuint32(255))); // & 0xFF
        euint8 gender = FHE.asEuint8(
            FHE.shr(FHE.and(data, FHE.asEuint32(65280)), 8)
        ); // >> 8 & 0xFF
        euint16 countryCode = FHE.asEuint16(FHE.shr(data, 16)); // >> 16

        // Store individual encrypted data
        patients[msg.sender] = EncryptedPatientData({
            age: age,
            gender: gender,
            countryCode: countryCode,
            exists: true
        });

        // Update aggregated statistics (only for new patients)
        updateStatistics(age, gender, countryCode);

        // Set ACL permissions (allow user to decrypt their own data)
        FHE.allowThis(age);
        FHE.allow(age, msg.sender);
        FHE.allowThis(gender);
        FHE.allow(gender, msg.sender);
        FHE.allowThis(countryCode);
        FHE.allow(countryCode, msg.sender);

        emit PatientDataSubmitted(msg.sender);
    }

    function updateStatistics(
        euint8 age,
        euint8 gender,
        euint16 countryCode
    ) private {
        // Increment total patients
        totalPatients = FHE.add(totalPatients, FHE.asEuint32(1));

        // Update gender statistics
        updateGenderStats(gender);

        // Update age group statistics
        updateAgeGroupStats(age);

        // Update country statistics
        updateCountryStats(countryCode);

        emit StatisticsUpdated(1); // Placeholder - in real implementation would decrypt total
    }

    function updateGenderStats(euint8 gender) private {
        // Female (gender == 1)
        femaleCount = FHE.add(
            femaleCount,
            FHE.select(
                FHE.eq(gender, FHE.asEuint8(1)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Male (gender == 2)
        maleCount = FHE.add(
            maleCount,
            FHE.select(
                FHE.eq(gender, FHE.asEuint8(2)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Non-binary (gender == 3)
        nonBinaryCount = FHE.add(
            nonBinaryCount,
            FHE.select(
                FHE.eq(gender, FHE.asEuint8(3)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Prefer not to say (gender == 4)
        preferNotToSayCount = FHE.add(
            preferNotToSayCount,
            FHE.select(
                FHE.eq(gender, FHE.asEuint8(4)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );
    }

    function updateAgeGroupStats(euint8 age) private {
        // Age 15-20
        ageGroup15_20 = FHE.add(
            ageGroup15_20,
            FHE.select(
                FHE.and(
                    FHE.ge(age, FHE.asEuint8(15)),
                    FHE.le(age, FHE.asEuint8(20))
                ),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Age 21-30
        ageGroup21_30 = FHE.add(
            ageGroup21_30,
            FHE.select(
                FHE.and(
                    FHE.ge(age, FHE.asEuint8(21)),
                    FHE.le(age, FHE.asEuint8(30))
                ),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Age 31-40
        ageGroup31_40 = FHE.add(
            ageGroup31_40,
            FHE.select(
                FHE.and(
                    FHE.ge(age, FHE.asEuint8(31)),
                    FHE.le(age, FHE.asEuint8(40))
                ),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Age 41-50
        ageGroup41_50 = FHE.add(
            ageGroup41_50,
            FHE.select(
                FHE.and(
                    FHE.ge(age, FHE.asEuint8(41)),
                    FHE.le(age, FHE.asEuint8(50))
                ),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Age 51-60
        ageGroup51_60 = FHE.add(
            ageGroup51_60,
            FHE.select(
                FHE.and(
                    FHE.ge(age, FHE.asEuint8(51)),
                    FHE.le(age, FHE.asEuint8(60))
                ),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Age 61+
        ageGroup61Plus = FHE.add(
            ageGroup61Plus,
            FHE.select(
                FHE.ge(age, FHE.asEuint8(61)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );
    }

    function updateCountryStats(euint16 countryCode) private {
        // Update country counters using FHE conditional logic
        // countryCode: 1=Ecuador, 2=Argentina, 3=Brasil, 4=US, 5=Canada, 6=Francia

        // Ecuador (countryCode == 1)
        ecuadorCount = FHE.add(
            ecuadorCount,
            FHE.select(
                FHE.eq(countryCode, FHE.asEuint16(1)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Argentina (countryCode == 2)
        argentinaCount = FHE.add(
            argentinaCount,
            FHE.select(
                FHE.eq(countryCode, FHE.asEuint16(2)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Brasil (countryCode == 3)
        brasilCount = FHE.add(
            brasilCount,
            FHE.select(
                FHE.eq(countryCode, FHE.asEuint16(3)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // US (countryCode == 4)
        usCount = FHE.add(
            usCount,
            FHE.select(
                FHE.eq(countryCode, FHE.asEuint16(4)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Canada (countryCode == 5)
        canadaCount = FHE.add(
            canadaCount,
            FHE.select(
                FHE.eq(countryCode, FHE.asEuint16(5)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );

        // Francia (countryCode == 6)
        franciaCount = FHE.add(
            franciaCount,
            FHE.select(
                FHE.eq(countryCode, FHE.asEuint16(6)),
                FHE.asEuint32(1),
                FHE.asEuint32(0)
            )
        );
    }

    // Access control: Only registered users can view statistics
    modifier onlyRegisteredUser() {
        require(
            patients[msg.sender].exists,
            "Must be registered user with submitted data"
        );
        _;
    }

    // Get user's own encrypted data
    function getMyEncryptedData()
        external
        view
        returns (euint8 age, euint8 gender, euint16 countryCode)
    {
        require(patients[msg.sender].exists, "No data found for this user");
        EncryptedPatientData memory data = patients[msg.sender];
        return (data.age, data.gender, data.countryCode);
    }

    // Check if user has submitted data
    function hasPatientData(address patientAddr) external view returns (bool) {
        return patients[patientAddr].exists;
    }

    // Get aggregated statistics (only for registered users)
    function getStatistics()
        external
        view
        onlyRegisteredUser
        returns (
            euint32 total,
            euint32 females,
            euint32 males,
            euint32 nonBinary,
            euint32 preferNotToSay,
            euint32 age15_20,
            euint32 age21_30,
            euint32 age31_40,
            euint32 age41_50,
            euint32 age51_60,
            euint32 age61Plus
        )
    {
        return (
            totalPatients,
            femaleCount,
            maleCount,
            nonBinaryCount,
            preferNotToSayCount,
            ageGroup15_20,
            ageGroup21_30,
            ageGroup31_40,
            ageGroup41_50,
            ageGroup51_60,
            ageGroup61Plus
        );
    }

    // Get country statistics (only for registered users)
    function getCountryStatistics()
        external
        view
        onlyRegisteredUser
        returns (
            euint32 ecuador,
            euint32 argentina,
            euint32 brasil,
            euint32 us,
            euint32 canada,
            euint32 francia
        )
    {
        return (
            ecuadorCount,
            argentinaCount,
            brasilCount,
            usCount,
            canadaCount,
            franciaCount
        );
    }
}
