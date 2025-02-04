// src/wizard/WizardContainer.js
import React, { useState } from 'react';
import Wizard from '@cloudscape-design/components/wizard';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import settings from '../settings.json';

export default function WizardContainer() {
  const [patientID, setPatientID] = useState('');
  const [formData, setFormData] = useState({Ward: '', diagnosis: '', notes: '' });
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [allowedNumbers, setAllowedNumbers] = useState(settings.allowedNumbers);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState(null);

  const handleStepChange = ({ detail }) => {
    if (detail.requestedStepIndex > activeStepIndex) {
      if (activeStepIndex === 0 && !isStep1Valid) {
        return;
      }
    }
    setActiveStepIndex(detail.requestedStepIndex);
  };

  const addAllowedNumber = (newId) => {
    setAllowedNumbers(prev => [...prev, newId]);
  };

  const steps = [
    { 
      title: 'הכנס מספר פציינט',
      description: '.הכנס מספר פציינט תקין ולחצו על הבא',
      content: (
        <Step1 
          patientID={patientID} 
          setPatientID={setPatientID} 
          onValidationChange={setIsStep1Valid}
          allowedNumbers={allowedNumbers}
          onAddNewPatient={addAllowedNumber}
        />
      ),
      isOptional: false,
    },
    { 
      title: 'הקלטה ותמלול',
      description: 'הקלט ותמלל שיחות בזמן אמת.',
      content: (
        <Step2 
          patientID={patientID}
          systemInstructions={settings.system_instructions}
          defaultPrompt={settings.prompt}
          maxTokens={settings.max_tokens}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          recordingUrl={recordingUrl}
          setRecordingUrl={setRecordingUrl}
        />
      ),
      isOptional: false,
    },
    { 
      title: 'סיכום רפואי',
      content: (
        <Step3 
          patientID={patientID} 
          formData={formData}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          recordingUrl={recordingUrl}
          setRecordingUrl={setRecordingUrl}
        />
      ),
      isOptional: false,
    },
  ];

  return (
    <div className="wizard-wrapper">
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
        isLoadingNextStep={activeStepIndex === 0 && !isStep1Valid}
        nextButtonDisabled={activeStepIndex === 0 && !isStep1Valid}
      />
    </div>
  );
}
