import React, { useState, useEffect } from 'react';
import { 
  FormField, 
  Input, 
  Container, 
  SpaceBetween, 
  Button,
  StatusIndicator,
  Modal,
  FileUpload
} from '@cloudscape-design/components';
import settings from '../settings.json';

export default function Step1({ patientID, setPatientID, onValidationChange, onAddNewPatient }) {
  const [allowedNumbers, setAllowedNumbers] = useState(settings.allowedNumbers);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [filesFound, setFilesFound] = useState({ pdf: false, video: false });
  
  // New states to control the input and media loading
  const [disablePatientInput, setDisablePatientInput] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // If no media is found, enable the input immediately.
  useEffect(() => {
    if (isExistingPatient && !filesFound.pdf && !filesFound.video) {
      setDisablePatientInput(false);
    }
  }, [filesFound, isExistingPatient]);

  const maybeEnableInput = () => {
    // If a file is not found, treat it as already "loaded"
    const pdfReady = !filesFound.pdf || pdfLoaded;
    const videoReady = !filesFound.video || videoLoaded;
    if (pdfReady && videoReady) {
      setDisablePatientInput(false);
    }
  };

  const checkExistingFiles = async (id) => {
    try {
      const pdfUrl = 'https://fu9nj81we9.execute-api.eu-west-1.amazonaws.com/testing/files?' + 
        new URLSearchParams({
          patientId: id,
          fileName: `${id}.pdf`
        }).toString();

      const mp4Url = 'https://fu9nj81we9.execute-api.eu-west-1.amazonaws.com/testing/files?' + 
        new URLSearchParams({
          patientId: id,
          fileName: `${id}.mp4`
        }).toString();
      
      const [pdfResponse, mp4Response] = await Promise.all([
        fetch(pdfUrl, {
          method: 'GET',
          headers: {
            'x-api-key': process.env.REACT_APP_API_KEY || ''
          }
        }),
        fetch(mp4Url, {
          method: 'GET',
          headers: {
            'x-api-key': process.env.REACT_APP_API_KEY || ''
          }
        })
      ]);

      const [pdfData, mp4Data] = await Promise.all([
        pdfResponse.ok ? pdfResponse.json() : { exists: false },
        mp4Response.ok ? mp4Response.json() : { exists: false }
      ]);

      console.log('PDF data:', pdfData);
      console.log('MP4 data:', mp4Data);

      setPdfUrl(pdfData.url);
      setVideoUrl(mp4Data.url);
      setFilesFound({
        pdf: pdfData.exists !== false,
        video: mp4Data.exists !== false
      });
    } catch (error) {
      console.error('Error checking files:', error);
    }
  };

  const handleChange = ({ detail }) => {
    const value = detail.value.trim();
    setPatientID(value);
    setStatus({ type: '', message: '' });
    setShowButton(false);
    setPdfUrl('');
    setVideoUrl('');
    setFilesFound({ pdf: false, video: false });
    // Reset media load flags on id change.
    setPdfLoaded(false);
    setVideoLoaded(false);
    // Also ensure the input is editable until a valid id is processed.
    setDisablePatientInput(false);

    if (!value) {
      onValidationChange(false);
      return;
    }

    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      setStatus({ type: 'error', message: 'מספר מזהה אינו חוקי' });
      onValidationChange(false);
      return;
    }

    const exists = allowedNumbers.includes(parsedValue);
    setIsExistingPatient(exists);
    setShowButton(true);
    
    if (exists) {
      setStatus({ type: 'success', message: 'מספר מזהה נמצא במערכת.' });
      onValidationChange(true);
      // **Disable the patient id input when a valid id is detected**
      setDisablePatientInput(true);
      checkExistingFiles(parsedValue);
    } else {
      setStatus({ type: 'info', message: 'מספר מזהה אינו קיים במערכת' });
      onValidationChange(false);
    }
  };

  // Event handlers for media load events
  const handlePdfLoad = () => {
    setPdfLoaded(true);
    maybeEnableInput();
  };

  const handleAudioLoaded = () => {
    setVideoLoaded(true);
    maybeEnableInput();
  };

  const handleFileChange = ({ detail }) => {
    const files = detail.value;
    setFileError('');
    
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    const file = files[0];
    if (file.type !== 'application/pdf') {
      setFileError('יש להעלות קובץ PDF בלבד');
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles([file]);
  };

  const uploadFile = async (file) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('https://fu9nj81we9.execute-api.eu-west-1.amazonaws.com/testing/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY || '',
        },
        body: JSON.stringify({
          id: patientID,
          file: fileData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      setStatus({ type: 'success', message: 'הקובץ הועלה בהצלחה' });
      setShowFileModal(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'שגיאה בהעלאת הקובץ' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = async () => {
    setIsLoading(true);
    try {
      if (isExistingPatient) {
        setShowFileModal(true);
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://fu9nj81we9.execute-api.eu-west-1.amazonaws.com/testing/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY || '',
        },
        body: JSON.stringify({ id: patientID }),
      });

      if (!response.ok) {
        throw new Error('Failed to create patient directory');
      }

      const settingsResponse = await fetch('http://localhost:3001/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newId: patientID }),
      });

      if (!settingsResponse.ok) {
        throw new Error('Failed to update settings');
      }

      setStatus({ type: 'success', message: 'תיק מטופל נוצר בהצלחה' });
      setIsExistingPatient(true);
      onValidationChange(true);
      onAddNewPatient(Number(patientID));
      setAllowedNumbers(prev => [...prev, Number(patientID)]);
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'שגיאה ביצירת תיק מטופל' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container 
      header={<h2>פרטי מטופל</h2>} 
      className={`step-container ${(filesFound.pdf || filesFound.video) ? 'expanded' : ''}`} 
      disableContentPaddings={false}
    >
      <SpaceBetween direction="vertical" size="l">
        <div>
          <FormField label="הכנס מספר מטופל" description="הקלד/י מספר מזהה מטופל תקין כאן">
            <Input 
              value={patientID} 
              onChange={handleChange} 
              placeholder="מזהה מטופל"
              disabled={disablePatientInput}
            />
          </FormField>
          {status.message && (
            <div style={{ marginTop: '8px' }}>
              <StatusIndicator type={status.type}>{status.message}</StatusIndicator>
            </div>
          )}
        </div>

        {showButton && (
          <Button variant="primary" onClick={handleButtonClick} loading={isLoading}>
            {isExistingPatient ? 'הוסף מסמכים' : 'הוסף מטופל'}
          </Button>
        )}

        {isExistingPatient && (
          <SpaceBetween direction="vertical" size="l">
            {filesFound.video && (
              <div>
                <h3>הקלטת שיחה</h3>
                <audio
                  controls
                  onLoadedData={handleAudioLoaded}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    backgroundColor: '#f2f3f3',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                >
                  <source src={videoUrl} type="audio/mp4" />
                  הדפדפן שלך אינו תומך בנגן השמע
                </audio>
              </div>
            )}

            {filesFound.pdf && (
              <div style={{ flex: 1, minHeight: 0 }}>
                <h3>מסמך PDF</h3>
                <iframe
                  src={pdfUrl}
                  onLoad={handlePdfLoad}
                  style={{
                    width: '100%',
                    height: '600px',
                    border: '1px solid #eaeded',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                  title="Patient PDF"
                />
              </div>
            )}
          </SpaceBetween>
        )}

        <Modal
          visible={showFileModal}
          onDismiss={() => setShowFileModal(false)}
          header="העלאת קובץ"
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField 
              label="בחר קובץ PDF" 
              errorText={fileError}
            >
              <FileUpload
                onChange={handleFileChange}
                value={selectedFiles}
                i18nStrings={{
                  uploadButtonText: e => "העלה קובץ",
                  dropzoneText: e => "גרור קובץ PDF לכאן",
                  removeFileAriaLabel: e => "הסר קובץ",
                  limitShowFewer: "הצג פחות",
                  limitShowMore: "הצג יותר",
                  errorIconAriaLabel: "שגיאה"
                }}
                accept=".pdf"
                multiple={false}
                showFileLastModified
                showFileSize
                tokenLimit={1}
                constraintText="ניתן להעלות קובץ PDF אחד בלבד. העלאת קבצים נוספים תהיה במקום הקובץ שקיים בתיק (אם ישנו קובץ)."
              />
            </FormField>
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="primary" 
                onClick={() => selectedFiles[0] && uploadFile(selectedFiles[0])}
                disabled={!selectedFiles.length}
                loading={isLoading}
              >
                העלה קובץ
              </Button>
              <Button 
                variant="link" 
                onClick={() => setShowFileModal(false)}
              >
                ביטול
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        </Modal>
      </SpaceBetween>
    </Container>
  );
}
