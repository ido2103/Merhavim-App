import React, { useState, useRef, useEffect } from 'react';
import { Container, Button, SpaceBetween, Box } from '@cloudscape-design/components';

export default function RecordingControls({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const mediaRecorder = useRef(null);
  const allAudioChunks = useRef([]);
  const audioElement = useRef(new Audio());
  const recordingStartTime = useRef(null);
  const durationInterval = useRef(null);

  const RecordIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="4" fill="#d91515"/>
    </svg>
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const currentChunks = [];

      mediaRecorder.current.ondataavailable = (event) => {
        currentChunks.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        allAudioChunks.current = [...allAudioChunks.current, ...currentChunks];
        
        const audioBlob = new Blob(allAudioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioElement.current.src = audioUrl;
        setHasRecording(true);
        onRecordingComplete?.(audioUrl);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setIsPlaying(false);
      recordingStartTime.current = Date.now();
      
      // Start duration counter
      durationInterval.current = setInterval(() => {
        const currentDuration = (Date.now() - recordingStartTime.current) / 1000;
        setDuration(prev => prev + (currentDuration - prev));
      }, 100);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Error accessing microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(durationInterval.current);
    }
  };

  const clearRecordings = () => {
    allAudioChunks.current = [];
    setHasRecording(false);
    setDuration(0);
    setCurrentTime(0);
    audioElement.current.src = '';
    onRecordingComplete?.(null);
  };

  const togglePlayback = () => {
    if (!hasRecording) return;

    if (isPlaying) {
      audioElement.current.pause();
      setIsPlaying(false);
    } else {
      audioElement.current.play();
      setIsPlaying(true);
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Add event listeners for audio playback and time updates
  useEffect(() => {
    const audio = audioElement.current;
    
    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    return () => {
      audio.onended = null;
      audio.ontimeupdate = null;
      audio.onloadedmetadata = null;
      clearInterval(durationInterval.current);
    };
  }, []);

  return (
    <Container
      className="recording-controls"
    >
      <SpaceBetween direction="horizontal" size="xs" alignItems="center">
        <Button
          variant="icon"
          className="control-button"
          iconName="play"
          disabled={!hasRecording || isRecording || isPlaying}
          onClick={togglePlayback}
        />
        <Button
          variant="icon"
          className="control-button"
          iconName="pause"
          disabled={!hasRecording || isRecording || !isPlaying}
          onClick={togglePlayback}
        />
        <Button
          variant="icon"
          className={isRecording ? 'control-button recording' : 'control-button record-button'}
          iconSvg={<RecordIcon />}
          onClick={handleRecordClick}
        />
        {hasRecording && (
          <Button
            variant="icon"
            className="control-button"
            iconName="remove"
            onClick={clearRecordings}
          />
        )}
        <Box color="text-status-info" fontSize="body-s">
          {isRecording ? formatTime(duration) : (hasRecording ? formatTime(currentTime) : '0:00')}
          {hasRecording && !isRecording && ` / ${formatTime(duration)}`}
        </Box>
      </SpaceBetween>
    </Container>
  );
}