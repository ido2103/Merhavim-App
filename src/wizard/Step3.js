import React, { useState } from 'react';
import { Container, Button, SpaceBetween, Checkbox } from '@cloudscape-design/components';

export default function Step3({ patientID, formData, recordingUrl, setRecordingUrl }) {
  const [documentUrl, setDocumentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleDocumentRequest = async (fileNameTemplate) => {
    setIsLoading(true);
    try {
      // Replace any instances of the hardcoded ID with the actual patientID
      const fileName = fileNameTemplate.replace('1607', patientID);
      
      // Build the API URL with query parameters
      const apiUrl = 
        `https://fu9nj81we9.execute-api.eu-west-1.amazonaws.com/testing/files?` + 
        new URLSearchParams({
          patientId: patientID,
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
            {recordingUrl && <p><strong>הקלטה:</strong> זמינה</p>}
          </div>
        </div>
        
        <div className="terms-agreement">
          <Checkbox
            checked={termsAccepted}
            onChange={({ detail }) => setTermsAccepted(detail.checked)}
            controlId="terms"
          >
            אני מסכים לתנאי השימוש
          </Checkbox>
        </div>
        
        <div className="document-controls">
          <SpaceBetween direction="horizontal" size="xs">
          {/* 
          <Button
            variant="primary"
            iconName='external'
            iconAlign='right'
            onClick={() => handleDocumentRequest(`summary_${patientID}.pdf`)}
            loading={isLoading}
            disabled={!termsAccepted}
          >
            סיכום ארוך (Bullets).
          </Button>

          <Button
            variant="primary"
            iconName='external'
            iconAlign='right'
            onClick={() => handleDocumentRequest('short_summary.pdf')}
            loading={isLoading}
            disabled={!termsAccepted}
          >
            סיכום קצר (Bullets)
          </Button>

          <Button
            variant="primary"
            iconName='external'
            iconAlign='right'
            onClick={() => handleDocumentRequest(`medical_summary_${patientID}.pdf`)}
            loading={isLoading}
            disabled={!termsAccepted}
          >
            סיכום קצר
          </Button>
          */}

            <Button
              variant="primary"
              iconName='external'
              iconAlign='right'
              onClick={() => handleDocumentRequest(`output/Summary/short_summary.pdf`)}
              loading={isLoading}
              disabled={!termsAccepted}
            >
               סיכום קצר
            </Button>
            <Button
              variant="primary"
              iconName='external'
              iconAlign='right'
              onClick={() => handleDocumentRequest(`output/Summary/short_summary.docx`)}
              loading={isLoading}
              disabled={!termsAccepted}
            >
              סיכום קצר (Word)
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