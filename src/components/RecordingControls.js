import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Button, 
  SpaceBetween, 
  Box, 
  StatusIndicator
} from '@cloudscape-design/components';

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

export default function RecordingControls({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const mediaRecorder = useRef(null);
  const audioElement = useRef(null);
  const stream = useRef(null);
  const audioChunks = useRef([]);
  const previousRecording = useRef(null);

  useEffect(() => {
    return () => {
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const updateDuration = async () => {
    if (audioElement.current) {
      return new Promise((resolve) => {
        const handleLoadedMetadata = () => {
          const newDuration = audioElement.current.duration;
          setDuration(newDuration);
          audioElement.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          resolve();
        };
        
        audioElement.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.current.load();
      });
    }
  };

  const startRecording = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream.current);
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const newRecordingBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        
        if (previousRecording.current) {
          const newAudioChunks = [previousRecording.current, newRecordingBlob];
          const combinedBlob = new Blob(newAudioChunks, { type: 'audio/webm' });
          previousRecording.current = combinedBlob;
        } else {
          previousRecording.current = newRecordingBlob;
        }

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(previousRecording.current);
        setAudioUrl(url);
        onRecordingComplete(url);

        audioChunks.current = [];
        
        await updateDuration();
      };

      mediaRecorder.current.start(100);
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      stream.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const togglePause = () => {
    if (isRecording) {
      if (isPaused) {
        mediaRecorder.current.resume();
      } else {
        mediaRecorder.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const playRecording = () => {
    if (audioElement.current) {
      audioElement.current.play();
    }
  };

  const saveLocally = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `recording-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Container>
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
          {audioUrl && (
            <>
              <Button
                variant="icon"
                iconName="play"
                onClick={playRecording}
                disabled={isRecording}
              />
              <Button
                variant="icon"
                iconName="download"
                onClick={saveLocally}
                disabled={!audioUrl}
              />
            </>
          )}
          <Box color="text-status-info" fontSize="body-s">
            {duration.toFixed(1)}s
          </Box>
        </SpaceBetween>

        {audioUrl && (
          <audio
            ref={audioElement}
            src={audioUrl}
            controls
            style={{ width: '100%' }}
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
          >
            <source src={audioUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        )}

        {isRecording && (
          <StatusIndicator type="in-progress">
            {isPaused ? "Recording paused" : "Recording..."}
          </StatusIndicator>
        )}
      </SpaceBetween>
    </Container>
  );
}