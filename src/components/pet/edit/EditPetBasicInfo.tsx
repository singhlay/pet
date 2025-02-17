import React, { useEffect, useState } from "react";
import type { Pet } from "../../../types/pet";

interface EditPetBasicInfoProps {
  pet: Pet;
  onChange: (field: keyof Pet, value: any) => void;
  breeds: string[];
}

export function EditPetBasicInfo({
  pet,
  onChange,
  breeds,
}: EditPetBasicInfoProps) {
  const [age, setAge] = useState<number>(pet.age || 0);

  // Function to calculate age from date of birth
  const calculateAge = (dob: string): number => {
    if (!dob) return 1; // Default age

    const birthDate = new Date(dob);
    const today = new Date();

    if (birthDate > today) {
      return 1; // Prevent future ages
    }

    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust age if birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return Math.max(1, Math.min(age, 15)); // Ensuring age is between 1 and 15
  };

  useEffect(() => {
    onChange("age", age);
  }, [age]);

  // Get today's date
  const today = new Date();

  // Get the date exactly one year ago
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Convert to YYYY-MM-DD format
  const todayFormatted = today.toISOString().split("T")[0];
  const oneYearAgoFormatted = oneYearAgo.toISOString().split("T")[0];

  // Get 15 years ago from today in YYYY-MM-DD format
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 15);
  const fifteenYearsAgo = minDate.toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Pet Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={pet.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="ownerName"
          className="block text-sm font-medium text-gray-700"
        >
          Owner Name
        </label>
        <input
          type="text"
          id="ownerName"
          name="ownerName"
          value={pet.ownerName}
           onChange={(e) => onChange("ownerName", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="breed"
          className="block text-sm font-medium text-gray-700"
        >
          Breed
        </label>
        <select
          id="breed"
          name="breed"
          value={pet.breed}
          onChange={(e) => onChange("breed", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="gender"
          className="block text-sm font-medium text-gray-700"
        >
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          value={pet.gender}
          onChange={(e) =>
            onChange("gender", e.target.value as "male" | "female")
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="dateOfBirth"
          className="block text-sm font-medium text-gray-700"
        >
          Date of Birth
        </label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={pet.dateOfBirth}
          onChange={(e) => {
            const selectedDate = e.target.value;
            const newAge = calculateAge(selectedDate);

            if (newAge >= 1) {
              onChange("dateOfBirth", selectedDate);
              setAge(newAge);
            }
          }}
          min={fifteenYearsAgo} // Prevent selecting dates more than 15 years ago
          max={oneYearAgoFormatted} // Prevent selecting dates less than 1 year ago
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="age"
          className="block text-sm font-medium text-gray-700"
        >
          Age (years)
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={age}
          readOnly // Make field readonly
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
          className="mt-1 block w-full bg-gray-200 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-not-allowed"
        />
      </div>
    </div>
  );
}
