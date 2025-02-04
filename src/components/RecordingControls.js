import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Button, 
  SpaceBetween, 
  Box, 
  StatusIndicator
} from '@cloudscape-design/components';
import recordingPlaceholder from './recording-placeholder.png';
import { uploadRecording, startTranscription } from '../services/transcriptionService';

const RecordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="4" fill="#d91515"/>
  </svg>
);

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="4" y="4" width="8" height="8" fill="#666666"/>
  </svg>
);

export default function RecordingControls({ onRecordingComplete, patientID }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isVideo, setIsVideo] = useState(false);
  const [usedFormat, setUsedFormat] = useState(''); // 'mp4' or 'mp3'
  const currentSessionStart = useRef(null);
  const timerInterval = useRef(null);

  const mediaRecorder = useRef(null);
  const videoPreviewRef = useRef(null);
  const playbackRef = useRef(null);
  const streamRef = useRef(null);
  const chunks = useRef([]);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const getSupportedMimeType = async () => {
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      return 'video/mp4';
    }
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      console.warn('MP4 not supported; falling back to audio recording');
      return 'audio/webm';
    }
    return '';
  };

  const updateTimer = () => {
    if (currentSessionStart.current) {
      const elapsed = (Date.now() - currentSessionStart.current) / 1000;
      setDuration(elapsed);
    }
  };

  const startRecording = async () => {
    // If there's an existing recording, clear it first
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
      setMediaUrl(null);
    }
    chunks.current = [];
    setDuration(0);

    try {
      const mimeType = await getSupportedMimeType();
      if (!mimeType) {
        console.error('No supported MIME type found for recording.');
        return;
      }
      setUsedFormat(mimeType.startsWith('video') ? 'mp4' : 'mp3');

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = audioStream;

      mediaRecorder.current = new MediaRecorder(audioStream, { mimeType });
      setIsVideo(false);

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: mediaRecorder.current.mimeType });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        if (onRecordingComplete) {
          onRecordingComplete(url);
        }
      };

      mediaRecorder.current.start(100);
      setIsRecording(true);
      setIsPaused(false);
      currentSessionStart.current = Date.now();
      timerInterval.current = setInterval(updateTimer, 200);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      currentSessionStart.current = null;
    }
  };

  const togglePause = () => {
    if (mediaRecorder.current && isRecording) {
      if (isPaused) {
        mediaRecorder.current.resume();
      } else {
        mediaRecorder.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const clearRecording = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את ההקלטה הקיימת?')) {
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
      setMediaUrl(null);
      setDuration(0);
      chunks.current = [];
    }
  };

  const handleTranscribe = async () => {
    if (!mediaUrl || !chunks.current.length) return;

    setIsTranscribing(true);
    setError('');
    
    try {
      // Create a Blob from the recorded chunks with video/mp4 type
      const recordingBlob = new Blob(chunks.current, { 
        type: 'video/mp4'
      });

      console.log('Recording blob:', recordingBlob);
      console.log('Patient ID:', patientID);

      // Upload the recording
      await uploadRecording(recordingBlob, patientID);

      // Start transcription and wait for result
      const transcriptText = await startTranscription(patientID);
      setTranscript(transcriptText);
    } catch (err) {
      setError(`שגיאה בתמלול ההקלטה: ${err.message}`);
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const containerStyle = {
    width: '100%',
    border: '1px solid #eaeded',
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: '#fff',
  };

  return (
    <div style={containerStyle}>
      <SpaceBetween direction="vertical" size="s">
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button
            variant="icon"
            iconSvg={isRecording ? <StopIcon /> : <RecordIcon />}
            onClick={isRecording ? stopRecording : startRecording}
          />
          <Button
            variant="icon"
            iconName={isPaused ? "play" : "pause"}
            onClick={togglePause}
            disabled={!isRecording}
          />
          {mediaUrl && (
            <>
              <Button
                variant="icon"
                iconName="download"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = mediaUrl;
                  a.download = usedFormat === 'mp4'
                    ? `recording_${new Date().toISOString()}.mp4`
                    : `recording_${new Date().toISOString()}.mp3`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                disabled={!mediaUrl}
              />
            </>
          )}
          <Box color="text-status-info" fontSize="body-s">
            {duration ? `${duration.toFixed(1)}s` : '0s'}
          </Box>
        </SpaceBetween>

        {isRecording && (
          <StatusIndicator type="in-progress">
            {isPaused ? "Recording paused" : "Recording..."}
          </StatusIndicator>
        )}

        {isVideo && (
          <video
            ref={videoPreviewRef}
            style={{ width: '100%', display: isRecording ? 'none' : 'block' }}
            muted
          />
        )}

        {mediaUrl && (
          <>
            <audio
              ref={playbackRef}
              src={mediaUrl}
              controls
              style={{ width: '100%' }}
              onTimeUpdate={(e) => setDuration(e.target.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
            >
              <source src={mediaUrl} type={mediaRecorder.current?.mimeType} />
              הדפדפן שלך אינו תומך בנגן השמע.
            </audio>

            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="primary"
                onClick={handleTranscribe}
                disabled={isRecording || isTranscribing}
                loading={isTranscribing}
              >
                {isTranscribing ? 'מתמלל...' : 'תמלל שיחה'}
              </Button>
              <Button 
                variant="normal" 
                onClick={clearRecording}
                disabled={isTranscribing}
              >
                מחק הקלטה
              </Button>
            </SpaceBetween>

            {error && (
              <StatusIndicator type="error">
                {error}
              </StatusIndicator>
            )}

            {transcript && (
              <Container header={<h3>תמלול</h3>}>
                <div style={{ 
                  whiteSpace: 'pre-wrap',
                  padding: '10px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '4px'
                }}>
                  {transcript}
                </div>
              </Container>
            )}
          </>
        )}

        {usedFormat === 'mp3' && (
          <Box fontSize="caption" color="text-status-error">
            MP4 אינו נתמך בדפדפן זה. הוקלטה באודיו (MP3) בלבד.
          </Box>
        )}
      </SpaceBetween>
    </div>
  );
}