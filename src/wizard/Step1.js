import React, { useState } from 'react';
import { FormField, Input, Container, SpaceBetween } from '@cloudscape-design/components';

// Import the configuration file
import allowedNumbersConfig from '../settings.json';

export default function Step1({ patientID, setPatientID, onValidationChange }) {
  const [error, setError] = useState('');

  const handleChange = ({ detail }) => {
    const value = detail.value.trim(); // Trim spaces
    setPatientID(value);
    setError('');

    // Convert the value to a number for validation
    const parsedValue = Number(value);

    // Validate: Check if it's a number and in the allowed list
    if (!value || isNaN(parsedValue) || !allowedNumbersConfig.allowedNumbers.includes(parsedValue)) {
      setError('מספר מזהה אינו חוקי'); // Error message in Hebrew: "Invalid ID number"
      onValidationChange(false);
      return;
    }

    // If valid, clear error and mark as valid
    onValidationChange(true);
  };

  return (
    <Container
      header={<h2>פרטי מטופל</h2>}
      className="step-container"
      disableContentPaddings={false}
    >
      <SpaceBetween direction="vertical" size="l">
        <FormField
          label="הכנס מספר מטופל"
          description="הקלד/י מספר מזהה מטופל תקין כאן"
          errorText={error}
        >
          <Input
            value={patientID}
            onChange={handleChange}
            placeholder="מזהה מטופל"
          />
        </FormField>
      </SpaceBetween>
    </Container>
  );
}
