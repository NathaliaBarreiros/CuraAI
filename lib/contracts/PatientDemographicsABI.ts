// PatientDemographics Contract ABI for CuraAI
export const PatientDemographicsABI = {
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "patient",
          "type": "address"
        }
      ],
      "name": "PatientDataSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "totalPatients",
          "type": "uint32"
        }
      ],
      "name": "StatisticsUpdated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "ageGroup15_20",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ageGroup21_30",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ageGroup31_40",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ageGroup41_50",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ageGroup51_60",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ageGroup61Plus",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "argentinaCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "brasilCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "canadaCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ecuadorCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "femaleCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "franciaCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCountryStatistics",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "ecuador",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "argentina",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "brasil",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "us",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "canada",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "francia",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyEncryptedData",
      "outputs": [
        {
          "internalType": "euint8",
          "name": "age",
          "type": "uint256"
        },
        {
          "internalType": "euint8",
          "name": "gender",
          "type": "uint256"
        },
        {
          "internalType": "euint16",
          "name": "countryCode",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStatistics",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "total",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "females",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "males",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "nonBinary",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "preferNotToSay",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "age15_20",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "age21_30",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "age31_40",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "age41_50",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "age51_60",
          "type": "uint256"
        },
        {
          "internalType": "euint32",
          "name": "age61Plus",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "patientAddr",
          "type": "address"
        }
      ],
      "name": "hasPatientData",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "maleCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nonBinaryCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "preferNotToSayCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint8",
          "name": "encryptedAge",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "ageProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint8",
          "name": "encryptedGender",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "genderProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint16",
          "name": "encryptedCountryCode",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "countryProof",
          "type": "bytes"
        }
      ],
      "name": "submitPatientData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalPatients",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "usCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;
