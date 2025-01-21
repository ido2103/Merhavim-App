import React, { useState } from 'react';
import { Container, Button, SpaceBetween } from '@cloudscape-design/components';

export default function Step3({ patientID, formData, recordingUrl }) {
  const [documentUrl, setDocumentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentRequest = async (fileName) => {
    setIsLoading(true);
    try {
      // Build the API URL with query parameters
      const apiUrl = 
        'https://fu9nj81we9.execute-api.eu-west-1.amazonaws.com/testing/files?' + 
        new URLSearchParams({
          patientId: '1607',
          fileName: fileName
        }).toString();

      // Make the API request with the x-api-key header
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-api-key': process.env.REACT_APP_API_KEY || '' // Use empty string as fallback
        }
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }

      const data = await response.json();
      //console.log(process.env.REACT_APP_API_KEY)
      setDocumentUrl(data.url);
    } catch (error) {
      console.error('Error fetching document URL:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Container
      header={<h2>סיכום רפואי</h2>}
      className={`step-container ${documentUrl ? 'expanded' : ''}`}
      disableContentPaddings={false}
    >
      <SpaceBetween direction="vertical" size="l">
        <div className="patient-info">
          <h3>פרטי מטופל</h3>
          <div>
            <p><strong>מספר מטופל:</strong> {patientID}</p>
            <p><strong>מחלקה:</strong> {formData.icuWard}</p>
            <p><strong>אבחנה:</strong> {formData.diagnosis}</p>
            <p><strong>הערות:</strong> {formData.notes}</p>
            {recordingUrl && <p><strong>הקלטה:</strong> זמינה</p>}
          </div>
        </div>
        
        <div className="document-controls">
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="primary"
              iconName='external'
              iconAlign='right'
              onClick={() => handleDocumentRequest('1607_סיכום.pdf')}
              loading={isLoading}
            >
              הצג PDF
            </Button>
            <Button
              variant="primary"
              iconName='external'
              iconAlign='right'
              onClick={() => handleDocumentRequest('סיכום_קצר.pdf')}
              loading={isLoading}
            >
              הצג PDF קצר
            </Button>
            <Button
              variant="primary"
              iconName='external'
              iconAlign='right'
              onClick={() => handleDocumentRequest('1607_סיכום.docx')}
              loading={isLoading}
            >
              הורד DOCX
            </Button>
          </SpaceBetween>
        </div>

        {documentUrl && (
          <div className="document-viewer">
            <iframe
              src={documentUrl}
              title="Document Viewer"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
        )}
      </SpaceBetween>
    </Container>
  );
}