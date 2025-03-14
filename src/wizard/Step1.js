import React, { useState, useEffect } from 'react';
import { 
  FormField, 
  Input, 
  Container, 
  SpaceBetween, 
  Button,
  StatusIndicator,
  Modal,
  FileUpload,
  Spinner,
  Box,
  TokenGroup,
  Alert,
  Tabs,
  Textarea,
  Select,
  FileTokenGroup
} from '@cloudscape-design/components';
import RecordingControls from '../components/RecordingControls';
import TranscriptionSection from '../components/TranscriptionSection';
import { startTranscription } from '../services/transcriptionService';
import { convertPdfToImages } from '../components/pdfHelper';
import settings from '../settings.json';
import { API_ENDPOINTS, API_KEY, buildUrl } from '../config';

const FileList = ({ files }) => {
  return (
    <div style={{ marginTop: '8px' }}>
      {files.map((file, index) => (
        <div 
          key={index}
          style={{ 
            padding: '8px',
            marginBottom: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#0972d3',
              textDecoration: 'none',
              ':hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {file.name}
          </a>
          <span style={{ color: '#666', fontSize: '0.9em' }}>
            ({(file.size / 1024).toFixed(2)} KB)
          </span>
        </div>
      ))}
    </div>
  );
};

const FileTokenDisplay = ({ files }) => {
  const handleDismiss = () => {
    // Required but unused
  };

  return (
    <TokenGroup
      items={files.map(file => ({
        value: file.url,  // Use URL as the value
        label: file.name,
        description: `${(file.size / 1024).toFixed(2)} KB`,
        dismissLabel: "Remove",
      }))}
      onDismiss={handleDismiss}
      alignment="vertical"
      limit={3}  // Show only 3 items initially
      expandToViewport={true}
      i18nStrings={{
        limitShowFewer: "הצג פחות",
        limitShowMore: "הצג את כל הקבצים"
      }}
      renderItem={(item) => (
        <a
          href={item.value}  // Use the URL we stored in value
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#0972d3',
            textDecoration: 'underline',
            cursor: 'pointer',
            display: 'block',
            width: '100%'
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {item.label}
        </a>
      )}
    />
  );
};

const TranscriptDisplay = ({ transcript, insight }) => {
  return (
    <Tabs
      tabs={[
        {
          label: "תמלול",
          id: "transcript",
          content: (
            <div style={{ 
              padding: '20px',
              backgroundColor: '#f8f8f8',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap'
            }}>
              {transcript || 'אין תמלול עדיין...'}
            </div>
          )
        },
        {
          label: "תובנות",
          id: "insight",
          content: (
            <div style={{ 
              padding: '20px',
              backgroundColor: '#f8f8f8',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap'
            }}>
              {insight || 'אין תובנות עדיין...'}
            </div>
          )
        }
      ]}
    />
  );
};

export default function Step1({ patientID, setPatientID, onValidationChange, onExistingMedia, activeStepIndex, onRecordingComplete }) {
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
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [existingRecordingUrl, setExistingRecordingUrl] = useState('');

  // Add new state for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add new state for existing files preview
  const [existingFiles, setExistingFiles] = useState([]);

  // Add new state for existing audio files
  const [existingAudioFiles, setExistingAudioFiles] = useState([]);

  // Add new state for selected audio files
  const [selectedAudioFiles, setSelectedAudioFiles] = useState([]);
  const [audioFileError, setAudioFileError] = useState('');

  // Add these states at the top
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [insightStatus, setInsightStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const [insight, setInsight] = useState('');

  // Add these new states
  const [insights, setInsights] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentRecording, setCurrentRecording] = useState('');

  // Add this with the other state declarations
  const [availableRecordings, setAvailableRecordings] = useState([]);

  // Add this new state
  const [availableTranscripts, setAvailableTranscripts] = useState([]);

  // Add state for saving
  const [isSaving, setIsSaving] = useState(false);

  // Add new state for selected PDFs
  const [selectedPDFsForSummary, setSelectedPDFsForSummary] = useState([]);

  // Add new state variables
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Add this with other state declarations at the top
  const [recordingDurations, setRecordingDurations] = useState({});

  // Add new state for the delete confirmation modal
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // Add this function to handle saving
  const handleTranscriptSave = async (fileName, transcriptData) => {
    setIsSaving(true);
    setError('');
    
    try {
      // Remove any existing path and just use the base filename
      const baseFileName = fileName.split('/').pop();
      // Ensure filename has .json extension but don't modify the original name
      const fileNameWithExt = baseFileName.endsWith('.json') ? baseFileName : `${baseFileName}.json`;
      
      const jsonString = JSON.stringify(transcriptData);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: patientID,
          fileName: fileNameWithExt,  // This will now be saved in the root of id_{id}
          file: base64Data,
          contentType: 'application/json',
          overwrite: true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save transcript: ${response.status}`);
      }

      const result = await response.json();
      console.log('Transcript saved:', result);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving transcript:', error);
      setError('שגיאה בשמירת התמלול');
      setIsSaving(false);
    }
  };

  // Add this function to reset all transcript-related states
  const resetTranscriptionStates = () => {
    setCurrentTranscript('');
    setInsights('');
    setError('');
    setIsTranscribing(false);
    setIsAnalyzing(false);
    setIsSaving(false);
    setAvailableTranscripts([]);
    setAvailableRecordings([]);
  };

  const fetchAvailableRecordings = async (id = patientID) => {
    try {
      const recordingsUrl = buildUrl(API_ENDPOINTS.FILES, {
        patientId: id,
        fileName: '*.mp4,*.mp3'
      });
      
      const response = await fetch(recordingsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableRecordings(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError('שגיאה בטעינת רשימת ההקלטות');
    }
  };

  const fetchAvailableTranscripts = async (id = patientID) => {
    try {
      const transcriptsUrl = buildUrl(API_ENDPOINTS.FILES, {
        patientId: id,
        fileName: '*.json'
      });
      
      const response = await fetch(transcriptsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTranscripts(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      setError('שגיאה בטעינת רשימת התמלולים');
    }
  };

  // Add this useEffect to load transcripts when patient exists
  useEffect(() => {
    if (isExistingPatient && patientID) {
      console.log('Loading transcripts for existing patient');
      fetchAvailableTranscripts();
    }
  }, [isExistingPatient, patientID]);

  const handleTranscribe = async (fileName) => {
    setIsTranscribing(true);
    setError('');
    
    try {
      console.log('Sending transcription request for file:', fileName);
      const transcriptText = await startTranscription(patientID, fileName);
      setCurrentTranscript(transcriptText);

      // Force refresh the available transcripts
      await fetchAvailableTranscripts();

    } catch (err) {
      console.error('Transcription error:', err);
      setError('שגיאה בתמלול ההקלטה');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranscriptDelete = async (fileName) => {
    if (!patientID) {
      setError('Missing patient ID');
      return;
    }
    
    setIsTranscribing(true);
    try {
      // Extract just the base filename without any path or id prefix
      const baseFileName = fileName
        .replace(`id_${patientID}/`, '')  // Remove any existing id prefix
        .replace('output/transcribe/', '')  // Remove any path prefix
        .trim();
      
      const deleteUrl = buildUrl(API_ENDPOINTS.DELETE, {
        patientId: patientID,
        fileName: baseFileName + '.json'
      });
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete transcript');
      }

      setCurrentTranscript('');
      await fetchAvailableTranscripts();
    } catch (error) {
      console.error('Error deleting transcript:', error);
      setError('שגיאה במחיקת התמלול');
    } finally {
      setIsTranscribing(false);
    }
  };

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

  const convertUrlToFile = async (url, fileName, fileType) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: fileType });
      
      Object.defineProperties(file, {
        url: {
          value: url,
          writable: false,
          enumerable: true
        },
        name: {
          value: fileName,
          writable: false,
          enumerable: true
        },
        size: {
          value: blob.size,
          writable: false,
          enumerable: true
        },
        lastModified: {
          value: new Date().getTime(),
          writable: false,
          enumerable: true
        }
      });
      
      return file;
    } catch (error) {
      console.error('Error converting URL to file:', error);
      return null;
    }
  };

  const checkExistingFiles = async (id) => {
    console.log('Checking existing files for ID:', id);
    setIsLoadingMedia(true);
    setDisablePatientInput(true);
    setError('');
    
    try {
      // Check if directory exists by trying to list files
      const filesUrl = buildUrl(API_ENDPOINTS.FILES, {
        patientId: id,
        fileName: '*'  // List all files to check if directory exists
      });
      
      const directoryResponse = await fetch(filesUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!directoryResponse.ok) {
        // Directory doesn't exist - new patient
        setStatus({ type: 'info', message: 'מטופל חדש - ניתן להוסיף אותו למערכת' });
        setIsExistingPatient(false);
        setShowButton(true);
        onValidationChange(false);
        return;
      }

      // Directory exists, now check for specific file types
      const mp4Url = buildUrl(API_ENDPOINTS.FILES, {
        patientId: id,
        fileName: '*.mp4'
      });
      
      const pdfUrl = buildUrl(API_ENDPOINTS.FILES, {
        patientId: id,
        fileName: '*.pdf'
      });
      
      const [mp4Response, pdfResponse] = await Promise.all([
        fetch(mp4Url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Accept': 'application/json'
          }
        }),
        fetch(pdfUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Accept': 'application/json'
          }
        })
      ]);

      const [mp4Data, pdfData] = await Promise.all([
        mp4Response.json(),
        pdfResponse.json()
      ]);

      // Directory exists but no files yet
      if (!mp4Data.files?.length && !pdfData.files?.length) {
        setStatus({ type: 'info', message: 'נמצא תיק מטופל ללא קבצים' });
        setIsExistingPatient(true);
        setShowButton(true);
        onValidationChange(true);
        return;
      }

      // Update state with found files
      if (pdfData.files?.length > 0) {
        const pdfFiles = await Promise.all(
          pdfData.files.map(async file => 
            await convertUrlToFile(file.url, file.fileName, 'application/pdf')
          )
        );
        setExistingFiles(pdfFiles.filter(Boolean));
      }

      if (mp4Data.files?.length > 0) {
        const mp4Files = await Promise.all(
          mp4Data.files.map(async file => 
            await convertUrlToFile(file.url, file.fileName, 'video/mp4')
          )
        );
        setExistingAudioFiles(mp4Files.filter(Boolean));
        setAvailableRecordings(mp4Data.files);
      }

      setPdfUrl(pdfData.files?.[0]?.url || '');
      setVideoUrl(mp4Data.files?.[0]?.url || '');
      setFilesFound({
        pdf: Boolean(pdfData.files?.length),
        video: Boolean(mp4Data.files?.length)
      });

      setIsExistingPatient(true);
      setStatus({ type: 'success', message: 'נמצאו קבצים למטופל' });
      onValidationChange(true);

      // Also fetch transcripts and recordings here
      await fetchAvailableTranscripts(id);
      await fetchAvailableRecordings(id);

    } catch (error) {
      console.error('Error checking existing files:', error);
      setError('שגיאה בטעינת קבצים קיימים');
      setIsExistingPatient(false);
      setShowButton(true);
      onValidationChange(false);
    } finally {
      setIsLoadingMedia(false);
      setDisablePatientInput(false);
    }
  };

  const handleChange = ({ detail }) => {
    const value = detail.value.trim();
    setPatientID(value);
    setStatus({ type: '', message: '' });
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

  const handleAudioFileChange = async ({ detail }) => {
    const file = detail.value[0];
    if (!file) {
      setAudioFileError('');
      setSelectedAudioFiles([]);
      return;
    }

    setSelectedAudioFiles(detail.value);
    setAudioFileError('');

    try {
      console.log('Starting audio file upload...', file);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64File = reader.result.split(',')[1];
        
        console.log('Sending upload request for audio file...');
        const response = await fetch(API_ENDPOINTS.UPLOAD, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify({
            id: patientID,
            file: base64File,
            fileName: file.name,
            contentType: 'video/mp4',
            overwrite: true
          })
        });

        if (!response.ok) {
          throw new Error('Failed to upload audio file');
        }

        console.log('Audio file uploaded successfully');
        await fetchAvailableRecordings();  // Refresh the recordings list
        setStatus({ type: 'success', message: 'הקלטה הועלתה בהצלחה' });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading audio file:', error);
      setAudioFileError('שגיאה בהעלאת הקובץ');
      setSelectedAudioFiles([]);
    }
  };

  const handleFileChange = ({ detail }) => {
    const files = detail.value;
    setFileError('');
    
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    const file = files[0];
    if (!file.type.includes('pdf')) {
      setFileError('יש להעלות קובץ PDF בלבד');
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles([file]);
    // Automatically upload the file when it's selected
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        
        // Determine if the file extension is .pdf or .mp4 (case-insensitive)
        const lowerCaseName = file.name.toLowerCase();
        const preserveOriginal = lowerCaseName.endsWith('.pdf') || lowerCaseName.endsWith('.mp4');
        
        const response = await fetch(API_ENDPOINTS.UPLOAD, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          // If the file is a PDF or MP4, we set overwrite to true to preserve the original name.
          body: JSON.stringify({
            id: patientID,
            fileName: file.name,
            file: base64Data,
            contentType: file.type,
            overwrite: preserveOriginal  // true for PDFs/MP4s, false for other file types
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        
        setStatus({ type: 'success', message: 'הקובץ הועלה בהצלחה' });
        setSelectedFiles([]);
        
        // Refresh the file list after successful upload
        setTimeout(() => {
          checkExistingFiles(patientID);
        }, 1000);  // Give the server a moment to process the upload
      };
      reader.readAsDataURL(file);
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

      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({ id: patientID }),
      });

      if (!response.ok) {
        throw new Error('Failed to create patient directory');
      }

      setStatus({ type: 'success', message: 'תיק מטופל נוצר בהצלחה' });
      setIsExistingPatient(true);
      onValidationChange(true);
      setShowButton(true);
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'שגיאה ביצירת תיק מטופל' });
    } finally {
      setIsLoading(false);
    }
  };

  // Add delete patient function
  const handleDeletePatient = async () => {
    setIsDeleting(true);
    try {
      // Delete the entire patient directory in S3
      const deleteUrl = buildUrl(API_ENDPOINTS.DELETE, {
        patientId: patientID // Sending only patient id with no file name deletes the entire directory.
      });
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete patient directory');
      }

      // Reset states
      setPatientID('');
      setPdfUrl('');
      setVideoUrl('');
      setFilesFound({ pdf: false, video: false });
      setPdfLoaded(false);
      setVideoLoaded(false);
      setDisablePatientInput(false);
      setStatus({ type: 'success', message: 'מטופל נמחק בהצלחה' });
      onValidationChange(false);

    } catch (error) {
      console.error('Error deleting patient:', error);
      setStatus({ type: 'error', message: 'שגיאה במחיקת המטופל' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Add this handler near your other handlers
  const handleRecordingUpdate = async (url) => {
    setCurrentRecording(url);
    onRecordingComplete(url);
    
    // Add a small delay to ensure the file is fully processed
    if (url) {
      setTimeout(async () => {
        await checkExistingFiles(patientID);
      }, 1000);
    }
  };

  // Add these handlers
  const handleAnalyzeTranscription = async () => {
    if (!currentTranscript) {
      setError('אין תמלול זמין לניתוח');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.BEDROCK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          system_instructions: settings.transcription_system_instructions,
          prompt: settings.transcription_prompt + currentTranscript,
          images: [],
          max_tokens: settings.max_tokens
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze transcription');
      }

      const data = await response.json();
      const parsedResponse = JSON.parse(data.result);
      const textContent = parsedResponse.content[0].text;
      setInsights(textContent);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('שגיאה בניתוח התמלול');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecordingDelete = () => {
    setCurrentRecording(null);
    onRecordingComplete(null);
  };

  const handleTranscriptChange = (newTranscript) => {
    setCurrentTranscript(newTranscript);
    setInsights('');
  };

  const handleTranscriptSelect = (transcriptText) => {
    setCurrentTranscript(transcriptText);
    setInsights('');
  };

  // Add handler for PDF selection
  const handlePDFSelection = (option) => {
    // Check if file is already selected
    if (!selectedPDFsForSummary.find(file => file.url === option.value)) {
      const newFile = {
        name: option.label,
        url: option.value,
        lastModified: new Date(option.description).getTime()
      };
      setSelectedPDFsForSummary(prev => [...prev, newFile]);
    }
  };

  // Add handler for removing PDFs from selection
  const handlePDFRemoval = (index) => {
    setSelectedPDFsForSummary(prevFiles => 
      prevFiles.filter((_, i) => i !== index)
    );
  };

  // Update the AI summary generation handler
  const handleGenerateAISummary = async () => {
    setIsGeneratingSummary(true);
    setError('');
    
    try {
      console.log('Starting AI summary generation for PDFs:', selectedPDFsForSummary);

      // Convert each PDF to images
      const pdfImagesPromises = selectedPDFsForSummary.map(async (pdfFile) => {
        console.log('Fetching PDF:', pdfFile.url);
        const response = await fetch(pdfFile.url);
        const blob = await response.blob();
        console.log('Converting PDF to images:', pdfFile.name);
        return convertPdfToImages(blob);
      });

      const pdfImagesArrays = await Promise.all(pdfImagesPromises);
      const allImages = pdfImagesArrays.flat();
      
      console.log(`Converted ${selectedPDFsForSummary.length} PDFs into ${allImages.length} images`);

      // Format images array like Step3
      const images = allImages.map(base64Image => ({
        data: base64Image,
        media_type: 'image/jpeg'
      }));

      // Construct payload exactly like Step3
      const payload = {
        system_instructions: settings.summary_system_instructions,
        prompt: settings.summary_prompt,
        images: images,
        max_tokens: settings.max_tokens
      };

      console.log('Sending payload structure:', {
        system_instructions_length: payload.system_instructions.length,
        prompt_length: payload.prompt.length,
        number_of_images: images.length,
        max_tokens: payload.max_tokens
      });

      const response = await fetch(API_ENDPOINTS.BEDROCK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      console.log('Bedrock API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bedrock API error:', errorText);
        throw new Error(`Failed to generate summary: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received AI summary response:', data);
      
      const parsedResult = JSON.parse(data.result);
      const summaryText = parsedResult.content[0].text;
      
      setAiSummary(summaryText);
    } catch (error) {
      console.error('Error in handleGenerateAISummary:', error);
      setError('שגיאה בהפקת הסיכום');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Add this function near the top with other utility functions
  const getPDFPageCount = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const pageCount = await convertPdfToImages(blob, true); // Add a flag to just return page count
      return pageCount;
    } catch (error) {
      console.error('Error getting PDF page count:', error);
      return null;
    }
  };

  // Add state for PDF page counts
  const [pdfPageCounts, setPdfPageCounts] = useState({});

  // Add this effect to get page counts when PDFs are loaded
  useEffect(() => {
    const fetchPageCounts = async () => {
      const counts = {};
      for (const file of existingFiles) {
        const count = await getPDFPageCount(file.url);
        if (count) {
          counts[file.url] = count;
        }
      }
      setPdfPageCounts(counts);
    };

    if (existingFiles.length > 0) {
      fetchPageCounts();
    }
  }, [existingFiles]);

  // Add this useEffect to calculate durations when audio files are loaded
  useEffect(() => {
    const getDuration = async (url) => {
      return new Promise((resolve) => {
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration);
        });
        audio.addEventListener('error', () => {
          resolve(null);
        });
      });
    };

    const fetchDurations = async () => {
      const durations = {};
      for (const file of existingAudioFiles) {
        const duration = await getDuration(file.url);
        if (duration) {
          durations[file.url] = duration;
        }
      }
      setRecordingDurations(durations);
    };

    if (existingAudioFiles.length > 0) {
      fetchDurations();
    }
  }, [existingAudioFiles]);

  // Add handler for file deletion
  const handleFileDelete = async (file, fileType) => {
    setFileToDelete({ file, fileType });
    setShowDeleteFileModal(true);
  };

  // Add handler for confirmed deletion
  const handleConfirmedDelete = async () => {
    if (!fileToDelete || !patientID) {
      setError('Missing file information or patient ID');
      return;
    }
    
    setIsDeletingFile(true);
    try {
      const deleteUrl = buildUrl(API_ENDPOINTS.DELETE, {
        patientId: patientID,
        fileName: fileToDelete.file.name
      });
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Refresh the file lists
      await checkExistingFiles(patientID);
      setShowDeleteFileModal(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('שגיאה במחיקת הקובץ');
    } finally {
      setIsDeletingFile(false);
    }
  };

  // Add the delete confirmation modal props
  const deleteFileModalProps = {
    visible: showDeleteFileModal,
    header: 'אישור מחיקה',
    closeAriaLabel: "close modal",
    onDismiss: () => setShowDeleteFileModal(false),
    footer: (
      <SpaceBetween direction="horizontal" size="xs">
        <Button
          variant="primary"
          onClick={handleConfirmedDelete}
          loading={isDeletingFile}
        >
          מחק
        </Button>
        <Button
          variant="link"
          onClick={() => setShowDeleteFileModal(false)}
          disabled={isDeletingFile}
        >
          ביטול
        </Button>
      </SpaceBetween>
    ),
    children: (
      <SpaceBetween size="m">
        <div>
          {fileToDelete?.fileType === 'PDF' ? 
            'האם למחוק את קובץ ה-PDF? פעולה זו היא בלתי הפיכה.' :
            'האם למחוק את קובץ ההקלטה? פעולה זו היא בלתי הפיכה.'
          }
        </div>
      </SpaceBetween>
    )
  };

  const fileModalProps = {
    visible: showFileModal,
    onDismiss: () => setShowFileModal(false),
    header: "העלאת קובץ",
  };

  const deleteModalProps = {
    visible: showDeleteModal,
    onDismiss: () => setShowDeleteModal(false),
    header: "מחיקת מטופל",
    footer: (
      <SpaceBetween direction="horizontal" size="xs">
        <Button 
          variant="primary" 
          onClick={handleDeletePatient}
          loading={isDeleting}
        >
          <Box color="text-status-error">מחק לצמיתות</Box>
        </Button>
        <Button 
          variant="link" 
          onClick={() => setShowDeleteModal(false)}
          disabled={isDeleting}
        >
          ביטול
        </Button>
      </SpaceBetween>
    ),
  };

  // Update handleLoadPatient to reset transcription states
  const handleLoadPatient = () => {
    if (!patientID.trim()) {
      setStatus({ type: 'error', message: 'יש להזין מספר מזהה' });
      return;
    }
    
    const parsedValue = patientID.trim();
    
    // Reset states before checking
    setPdfUrl('');
    setVideoUrl('');
    setFilesFound({ pdf: false, video: false });
    setPdfLoaded(false);
    setVideoLoaded(false);
    setDisablePatientInput(false);
    setExistingFiles([]);
    setExistingAudioFiles([]);
    
    // Reset transcription-related states
    setCurrentTranscript('');
    setInsights('');
    setError('');
    setIsTranscribing(false);
    setIsAnalyzing(false);
    setIsSaving(false);
    setAvailableTranscripts([]);
    setAvailableRecordings([]);
    
    // Call checkExistingFiles with the patient ID
    checkExistingFiles(parsedValue);
  };

  // Keep only this useEffect for logging if needed
  useEffect(() => {
    console.log('Step1 validation state:', {
      isStep1Valid: typeof onValidationChange === 'function' ? 'function' : onValidationChange,
      patientID,
      showButton,
      isExistingPatient
    });
  }, [onValidationChange, patientID, showButton, isExistingPatient]);

  const handleDeleteTranscript = async (transcriptName) => {
    try {
      const deleteUrl = buildUrl(API_ENDPOINTS.DELETE, {
        patientId: patientID,
        fileName: transcriptName
      });
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete transcript');
      }

      // Refresh the list of transcripts
      fetchAvailableTranscripts();
      return true;
    } catch (error) {
      console.error('Error deleting transcript:', error);
      setError('שגיאה במחיקת התמלול');
      return false;
    }
  };

  const checkPatientExists = async (id) => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      // Check if directory exists by trying to list files
      const filesUrl = buildUrl(API_ENDPOINTS.FILES, {
        patientId: id,
        fileName: '*'  // List all files to check if directory exists
      });
      
      const directoryResponse = await fetch(filesUrl, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!directoryResponse.ok) {
        throw new Error('Failed to check if patient exists');
      }

      const directoryData = await directoryResponse.json();
      
      // Directory exists, now check for specific file types
      const mp4Url = buildUrl(API_ENDPOINTS.FILES, {
        patientId: id,
        fileName: '*.mp4'
      });
      
      const pdfUrl = buildUrl(API_ENDPOINTS.FILES, {
        patientId: id,
        fileName: '*.pdf'
      });
      
      const [mp4Response, pdfResponse] = await Promise.all([
        fetch(mp4Url, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Accept': 'application/json'
          }
        }),
        fetch(pdfUrl, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Accept': 'application/json'
          }
        })
      ]);

      const [mp4Data, pdfData] = await Promise.all([
        mp4Response.json(),
        pdfResponse.json()
      ]);

      // Directory exists but no files yet
      if (!mp4Data.files?.length && !pdfData.files?.length) {
        setStatus({ type: 'info', message: 'נמצא תיק מטופל ללא קבצים' });
        setIsExistingPatient(true);
        setShowButton(true);
        onValidationChange(true);
        return;
      }

      // Update state with found files
      if (pdfData.files?.length > 0) {
        const pdfFiles = await Promise.all(
          pdfData.files.map(async file => 
            await convertUrlToFile(file.url, file.fileName, 'application/pdf')
          )
        );
        setExistingFiles(pdfFiles.filter(Boolean));
      }

      if (mp4Data.files?.length > 0) {
        const mp4Files = await Promise.all(
          mp4Data.files.map(async file => 
            await convertUrlToFile(file.url, file.fileName, 'video/mp4')
          )
        );
        setExistingAudioFiles(mp4Files.filter(Boolean));
        setAvailableRecordings(mp4Data.files);
      }

      setPdfUrl(pdfData.files?.[0]?.url || '');
      setVideoUrl(mp4Data.files?.[0]?.url || '');
      setFilesFound({
        pdf: Boolean(pdfData.files?.length),
        video: Boolean(mp4Data.files?.length)
      });

      setIsExistingPatient(true);
      setStatus({ type: 'success', message: 'נמצאו קבצים למטופל' });
      onValidationChange(true);

      // Also fetch transcripts here
      await fetchAvailableTranscripts(id);

    } catch (error) {
      console.error('Error checking existing files:', error);
      setError('שגיאה בטעינת קבצים קיימים');
      setIsExistingPatient(false);
      setShowButton(true);
      onValidationChange(false);
    } finally {
      setIsLoadingMedia(false);
      setDisablePatientInput(false);
    }
  };

  return (
    <Container 
      header={<h2>פרטי מטופל</h2>} 
      className="step-container expanded"
      disableContentPaddings={false}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        maxHeight: '85vh',
        overflow: 'auto',
        flex: 1
      }}
    >
      <SpaceBetween direction="vertical" size="l" style={{ flex: 1 }}>
        <div>
          <FormField 
            label="הכנס מספר מטופל" 
            description="הקלד/י מספר מזהה מטופל תקין כאן"
          >
            <SpaceBetween direction="horizontal" size="xs">
              <Input 
                value={patientID} 
                onChange={handleChange} 
                placeholder="מזהה מטופל"
                disabled={disablePatientInput}
              />
              <Button
                variant="normal"
                onClick={handleLoadPatient}
              >
                טען תיק מטופל
              </Button>
            </SpaceBetween>
          </FormField>
          {status.message && (
            <div style={{ marginTop: '8px' }}>
              <StatusIndicator type={status.type}>{status.message}</StatusIndicator>
            </div>
          )}
          {isLoadingMedia && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Spinner />
              <span>טוען קבצים קיימים...</span>
            </div>
          )}
        </div>

        {showButton && (
          <SpaceBetween direction="horizontal" size="xs">
            {!isExistingPatient && (
              <Button variant="primary" onClick={handleButtonClick} loading={isLoading}>
                הוסף מטופל
              </Button>
            )}
            {isExistingPatient && (
              <>
                <Button 
                  variant="normal" 
                  onClick={() => setShowDeleteModal(true)}
                  loading={isDeleting}
                  disabled={isDeleting}
                  formAction="none"
                >
                  <Box color="text-status-error">מחק מטופל</Box>
                </Button>
                <Button
                  variant="normal"
                  onClick={() => checkExistingFiles(patientID)}
                  disabled={!patientID}
                >
                  רענן קבצים
                </Button>
              </> 
            )}
          </SpaceBetween>
        )}

        {isExistingPatient && (
          <SpaceBetween direction="vertical" size="l" style={{ flex: 1, overflow: 'auto' }}>
            <div style={{ flex: 0 }}>
              <h3>מסמכי PDF</h3>
              <SpaceBetween direction="vertical" size="s">
                <FormField 
                  errorText={fileError}
                >
                  <FileUpload
                    onChange={handleFileChange}
                    value={selectedFiles}
                    i18nStrings={{
                      uploadButtonText: e => "העלה PDF",
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
                    constraintText="העלה קבצי PDF בלבד"
                  />
                </FormField>
                
                {filesFound.pdf && (
                  <TokenGroup
                    alignment="vertical"
                    items={existingFiles.map(file => ({
                      label: file.name,
                      labelTag: 'PDF',
                      description: `${pdfPageCounts[file.url]} עמודים | ${(file.size / 1024).toFixed(2)} KB`,
                      dismissLabel: `הסר ${file.name}`
                    }))}
                    onDismiss={({ detail }) => handleFileDelete(existingFiles[detail.itemIndex], 'PDF')}
                  />
                )}
              </SpaceBetween>
            </div>

            <div style={{ flex: 0 }}>
              <h3>הקלטות שיחה</h3>
              <SpaceBetween direction="vertical" size="s">


                {filesFound.video && (
                  <TokenGroup
                    alignment="vertical"
                    items={existingAudioFiles.map(file => ({
                      label: file.name,
                      labelTag: 'MP4',
                      description: `${recordingDurations[file.url] ? `${Math.round(recordingDurations[file.url])} שניות | ${(file.size / 1024).toFixed(2)} KB` : ''}`,
                      dismissLabel: `הסר ${file.name}`
                    }))}
                    onDismiss={({ detail }) => handleFileDelete(existingAudioFiles[detail.itemIndex], 'MP4')}
                  />
                )}
              </SpaceBetween>
            </div>

            {/* AI Summary Section */}
            <div style={{ flex: 0 }}>
              <h3>סיכום AI</h3>
              <Container>
                <SpaceBetween direction="vertical" size="m">
                  <Select
                    selectedOption={null}
                    onChange={({ detail }) => handlePDFSelection(detail.selectedOption)}
                    options={existingFiles.map(file => ({
                      label: file.name,
                      value: file.url,
                      description: new Date(file.lastModified).toLocaleString()
                    }))}
                    placeholder="בחר קובץ PDF לניתוח"
                    empty="לא נמצאו קבצי PDF"
                  />
                  
                  {selectedPDFsForSummary.length > 0 && (
                    <TokenGroup
                      alignment="vertical"
                      items={selectedPDFsForSummary.map(file => ({
                        label: file.name,
                        labelTag: 'PDF',
                        description: new Date(file.lastModified).toLocaleString(),
                        dismissLabel: `הסר ${file.name}`
                      }))}
                      onDismiss={({ detail }) => handlePDFRemoval(detail.itemIndex)}
                    />
                  )}

                  <Button
                    variant="primary"
                    onClick={handleGenerateAISummary}
                    disabled={selectedPDFsForSummary.length === 0}
                    loading={isGeneratingSummary}
                  >
                    סכם רקע באמצעות AI
                  </Button>

                  {aiSummary && (
                    <Container>
                      <Textarea
                        value={aiSummary}
                        readOnly
                        rows={25}
                        style={{
                          backgroundColor: '#f8f8f8',
                          lineHeight: '1.5',
                          direction: 'rtl',
                          minHeight: '400px'
                        }}
                      />
                    </Container>
                  )}

                  {error && (
                    <StatusIndicator type="error">
                      {error}
                    </StatusIndicator>
                  )}
                </SpaceBetween>
              </Container>
            </div>

            <div style={{ flex: 0 }}>
              <h3>הקלטה</h3>
              <RecordingControls
                patientID={patientID}
                onRecordingComplete={handleRecordingUpdate}
                initialRecordingUrl={currentRecording}
                onRecordingDelete={handleRecordingDelete}
                onUploadComplete={(id) => {
                  fetchAvailableRecordings();
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <h3>תמלול</h3>
              <TranscriptionSection
                patientID={patientID}
                availableRecordings={availableRecordings}
                availableTranscripts={availableTranscripts}
                currentTranscript={currentTranscript}
                onTranscribe={handleTranscribe}
                onTranscriptDelete={handleTranscriptDelete}
                onTranscriptSelect={handleTranscriptSelect}
                onTranscriptChange={handleTranscriptChange}
                onTranscriptSave={handleTranscriptSave}
                isTranscribing={isTranscribing}
                isSaving={isSaving}
                error={error}
                setError={setError}
              />

              {currentTranscript && currentTranscript.trim() !== '' && (
                <SpaceBetween direction="vertical" size="m">
                  <Button
                    variant="normal"
                    onClick={handleAnalyzeTranscription}
                    loading={isAnalyzing}
                  >
                    נתח שיחה 
                  </Button>

                  {error && (
                    <StatusIndicator type="error">
                      {error}
                    </StatusIndicator>
                  )}

                  {insights && (
                    <Container header={<h3>סיכום שיחה</h3>}>
                      <Textarea
                        value={insights}
                        readOnly
                        rows={20}
                        style={{
                          backgroundColor: '#f8f8f8',
                          lineHeight: '1.5'
                        }}
                      />
                    </Container>
                  )}
                </SpaceBetween>
              )}
            </div>
          </SpaceBetween>
        )}

        <Modal {...fileModalProps} />
        <Modal {...deleteModalProps} />
        <Modal {...deleteFileModalProps} />
      </SpaceBetween>
    </Container>
  );
}
