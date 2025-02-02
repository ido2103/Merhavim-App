// src/wizard/WizardContainer.js
import React, { useState } from 'react';
import Wizard from '@cloudscape-design/components/wizard';
import Step1 from './Step1';
import Step3 from './Step3';

export default function WizardContainer() {
  const [patientID, setPatientID] = useState('');
  const [formData, setFormData] = useState({Ward: '', diagnosis: '', notes: '' });
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

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
      title: 'הכנס מספר פציינט',
      description: '.הכנס מספר פציינט תקין ולחצו על הבא',
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
      title: 'סיכום רפואי',
      content: (
        <Step3 
          patientID={patientID} 
          formData={formData}
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
