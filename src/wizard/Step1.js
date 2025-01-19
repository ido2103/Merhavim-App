import React, { useState } from 'react';
import { FormField, Input, Container, SpaceBetween } from '@cloudscape-design/components';

export default function Step1({ patientID, setPatientID, onValidationChange }) {
  const [error, setError] = useState('');
  
  const handleChange = ({ detail }) => {
    const value = detail.value;
    setPatientID(value);
    setError('');
    
    if (!value) {
      onValidationChange(false);
      return;
    }

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
