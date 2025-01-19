// src/wizard/WizardContainer.js
import React, { useState } from 'react';
import { Wizard } from '@cloudscape-design/components';
import Step1 from './Step1';
import Step3 from './Step3';

export default function WizardContainer() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [patientID, setPatientID] = useState('');
  const [formData, setFormData] = useState({
    icuWard: '',
    diagnosis: '',
    notes: ''
  });
  const [recordingUrl, setRecordingUrl] = useState('');
  const [step1Valid, setStep1Valid] = useState(false);

  const steps = [
    {
      title: 'רקע',
      content: (
        <Step1
          patientID={patientID}
          setPatientID={setPatientID}
          onValidationChange={setStep1Valid}
        />
      ),
      isOptional: false,
      validationFunction: () => step1Valid
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
      isOptional: false
    }
  ];

  return (
    <div>
      <Wizard
        steps={steps}
        activeStepIndex={activeStepIndex}
        onNavigate={({ detail }) => setActiveStepIndex(detail.requestedStepIndex)}
        i18nStrings={{
          stepNumberLabel: stepNumber => `שלב ${stepNumber}`,
          collapsedStepsLabel: (stepNumber, stepsCount) => `שלב ${stepNumber} מתוך ${stepsCount}`,
          skipToButtonLabel: (stepNumber, stepTitle) => `דלג לשלב ${stepNumber}: ${stepTitle}`,
          navigationAriaLabel: 'ניווט שלבים',
          cancelButton: 'ביטול',
          previousButton: 'הקודם',
          nextButton: 'הבא',
          submitButton: 'סיום',
          optional: 'אופציונלי'
        }}
      />
    </div>
  );
}
