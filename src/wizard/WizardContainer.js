// src/wizard/WizardContainer.js
import React, { useState } from 'react';
import Wizard from '@cloudscape-design/components/wizard';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import RecordingControls from '../components/RecordingControls';

export default function WizardContainer() {
  const [patientID, setPatientID] = useState('');
  const [formData, setFormData] = useState({ icuWard: '', diagnosis: '', notes: '' });
  const [recordingUrl, setRecordingUrl] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const handleRecordingComplete = (url) => {
    setRecordingUrl(url);
  };

  const handleStepChange = ({ detail }) => {
    if (detail.requestedStepIndex > activeStepIndex) {
      if (activeStepIndex === 0 && !isStep1Valid) {
        return;
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
