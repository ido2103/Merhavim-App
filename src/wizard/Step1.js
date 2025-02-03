import React, { useState } from 'react';
import { FormField, Input, Container, SpaceBetween, Button, Textarea } from '@cloudscape-design/components';

// Import the configuration file
import allowedNumbersConfig from '../settings.json';

export default function Step1({ patientID, setPatientID, onValidationChange }) {
  const [error, setError] = useState('');
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = ({ detail }) => {
    const value = detail.value.trim(); // Trim spaces
    setPatientID(value);
    setError('');
    setShowButton(false);

    // Convert the value to a number for validation
    const parsedValue = Number(value);

    // First check if it's a valid number
    if (!value || isNaN(parsedValue)) {
      setError('מספר מזהה אינו חוקי'); // Error message in Hebrew: "Invalid ID number"
      onValidationChange(false);
      return;
    }

    // Check if number exists in allowed list
    const exists = allowedNumbersConfig.allowedNumbers.includes(parsedValue);
    setIsExistingPatient(exists);
    setShowButton(true);
    
    // Update validation state
    if (!exists) {
      setError('מספר מזהה אינו קיים במערכת'); // "ID number not found in system"
      onValidationChange(false);
      return;
    }

    // If valid and exists, clear error and mark as valid
    onValidationChange(true);
  };

  const handleButtonClick = () => {
    // This will be implemented later
    console.log(isExistingPatient ? 'Adding documents' : 'Adding new patient');
  };

  const handleAIRequest = async () => {
    setIsLoading(true);
    try {
      const apiUrl = 'https://fu9nj81we9.execute-api.eu-west-1.amazonaws.com/testing/bedrock';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY || '',
        },
        body: JSON.stringify({
          prompt: prompt  // Ensure the key is "prompt"
        })
      });

      if (!response.ok) {
        console.log(response)
        throw new Error(`response was not ok. Status: ${response}`);
      }

      const data = await response.json();
      console.log('AI Response:', data);
    } catch (error) {
      console.error('Error making AI request:', error);
    } finally {
      setIsLoading(false);
    }
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
        
        {showButton && (
          <Button
            variant="primary"
            onClick={handleButtonClick}
          >
            {isExistingPatient ? 'הוספת קובץ (רשות)' : 'יצירת מטופל חדש'}
          </Button>
        )}

        {/* AI Request Section 
        <FormField
          label="שאילתה ל-AI"
          description="הקלד/י טקסט לשליחה ל-AI"
        >
          <Textarea
            value={prompt}
            onChange={({ detail }) => setPrompt(detail.value)}
            placeholder="הקלד/י את השאילתה שלך כאן..."
          />
        </FormField>

        <Button
          variant="normal"
          onClick={handleAIRequest}
          loading={isLoading}
          disabled={!prompt.trim()}
        >
          שלח ל-AI
        </Button>
        */}
      </SpaceBetween>
    </Container>
  );
}
