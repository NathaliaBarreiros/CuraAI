// Data mapping utilities for CuraAI FHEVM integration
import { GENDER_MAPPING, COUNTRY_MAPPING, GENDER_LABELS, COUNTRY_LABELS } from "../fhevm/fhevmTypes";

// Convert form data to numeric codes for encryption
export const mapFormDataToNumbers = (formData: {
  age: string;
  gender: string;
  country: string;
}) => {
  const age = parseInt(formData.age);
  
  // Map gender string to number
  let genderCode: number;
  switch (formData.gender.toLowerCase()) {
    case 'female':
      genderCode = GENDER_MAPPING.Female;
      break;
    case 'male':
      genderCode = GENDER_MAPPING.Male;
      break;
    case 'non-binary':
      genderCode = GENDER_MAPPING["Non-binary"];
      break;
    case 'prefer not to say':
      genderCode = GENDER_MAPPING["Prefer not to say"];
      break;
    default:
      genderCode = GENDER_MAPPING["Prefer not to say"];
  }

  // Country is already a numeric string from the form
  const countryCode = parseInt(formData.country);

  return {
    age,
    gender: genderCode,
    country: countryCode
  };
};

// Convert numeric codes back to readable labels
export const mapNumbersToLabels = (data: {
  age: number;
  gender: number;
  country: number;
}) => {
  return {
    age: data.age,
    gender: GENDER_LABELS[data.gender as keyof typeof GENDER_LABELS] || "Unknown",
    country: COUNTRY_LABELS[data.country as keyof typeof COUNTRY_LABELS] || "Unknown"
  };
};

// Validate form data before encryption
export const validatePatientData = (formData: {
  age: string;
  gender: string;
  country: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate age
  const age = parseInt(formData.age);
  if (isNaN(age) || age < 15 || age > 120) {
    errors.push("Age must be between 15 and 120");
  }

  // Validate gender
  const validGenders = ['female', 'male', 'non-binary', 'prefer not to say'];
  if (!validGenders.includes(formData.gender.toLowerCase())) {
    errors.push("Invalid gender selection");
  }

  // Validate country
  const countryCode = parseInt(formData.country);
  if (isNaN(countryCode) || countryCode < 1 || countryCode > 6) {
    errors.push("Invalid country selection");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
