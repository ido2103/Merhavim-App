import React from 'react';
import { Container, SpaceBetween } from '@cloudscape-design/components';
import RecordingControls from '../components/RecordingControls';

export default function Step2({ recordingUrl, setRecordingUrl, patientID }) {
  return (
    <Container 
      header={<h2>הקלטת שיחה</h2>}
      className="step-container expanded"
      disableContentPaddings={false}
    >
      <SpaceBetween direction="vertical" size="l">
        <RecordingControls 
          onRecordingComplete={setRecordingUrl} 
          patientID={patientID}
        />
      </SpaceBetween>
    </Container>
  );
}