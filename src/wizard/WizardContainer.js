// src/wizard/WizardContainer.js
import React, { useState } from 'react';
import Wizard from '@cloudscape-design/components/wizard';
import Box from '@cloudscape-design/components/box';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import RecordingControls from '../components/RecordingControls';
import { generatePresignedUrl } from '../utils/s3';

export default function WizardContainer() {
  const [patientID, setPatientID] = useState('');
  const [formData, setFormData] = useState({ icuWard: '', diagnosis: '', notes: '' });
  const [recordingUrl, setRecordingUrl] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const handleRecordingComplete = (url) => {
    setRecordingUrl(url);
  };

  const handleStepChange = async ({ detail }) => {
    // Only handle next button clicks
    if (detail.requestedStepIndex > activeStepIndex) {
      if (activeStepIndex === 0 && !isStep1Valid) {
        return; // Prevent moving to next step if Step 1 is not valid
      }
      
      // Generate presigned URL when moving from Step 1 to Step 2
      if (activeStepIndex === 0) {
        try {
          const url = await generatePresignedUrl(patientID);
          if (!url) {
            return; // Don't proceed if URL generation failed
          }
        } catch (error) {
          console.error('Failed to generate presigned URL:', error);
          return;
        }
      }
    }
    setActiveStepIndex(detail.requestedStepIndex);
  };

  const steps = [
    { 
      title: 'רקע',
      content: (
        <Step1 
          patientID={patientID} 
          setPatientID={setPatientID} 
          onValidationChange={setIsStep1Valid}
        />
      ),
      isOptional: false,
    },
    { 
      title: 'הדרכה',
      content: <Step2 formData={formData} setFormData={setFormData} />,
      isOptional: false,
    },
    { 
      title: 'סיכום רפואי',
      content: (
        <Step3 
          patientID={patientID} 
          formData={formData} 
          recordingUrl={recordingUrl}
        />
      ),
      isOptional: false,
    },
  ];

  return (
    <div className="wizard-wrapper">
      {activeStepIndex >= 1 && (
        <RecordingControls onRecordingComplete={handleRecordingComplete} />
      )}
      <Wizard
        steps={steps}
        activeStepIndex={activeStepIndex}
        onNavigate={handleStepChange}
        i18nStrings={{
          stepNumberLabel: stepNumber => `שלב ${stepNumber}`,
          collapsedStepsLabel: (stepNumber, stepsCount) => `שלב ${stepNumber} מתוך ${stepsCount}`,
          cancelButton: "בטל",
          previousButton: "הקודם",
          nextButton: "הבא",
          submitButton: "סיום",
          optional: "אופציונלי",
        }}
        onSubmit={() => alert('האשף הסתיים!')}
        onCancel={() => alert('האשף בוטל')}
        isNavigationDisabled={activeStepIndex === 0 && !isStep1Valid}
      />
    </div>
  );
}
