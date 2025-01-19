import React, { useState } from 'react';
import { Container, Button, SpaceBetween, Box, StatusIndicator } from '@cloudscape-design/components';

export default function RecordingControls() {
  const [showTooltip, setShowTooltip] = useState(false);

  const RecordIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="4" fill="#d91515"/>
    </svg>
  );

  return (
    <Container
      className="recording-controls"
    >
      <SpaceBetween direction="vertical" size="xs">
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button
            variant="icon"
            className="control-button"
            iconName="play"
            disabled={true}
            title="תכונה זו אינה זמינה בגרסת POC"
          />
          <Button
            variant="icon"
            className="control-button"
            iconName="pause"
            disabled={true}
            title="תכונה זו אינה זמינה בגרסת POC"
          />
          <Button
            variant="icon"
            className="control-button record-button"
            iconSvg={<RecordIcon />}
            disabled={false}
            onClick={() => setShowTooltip(true)}
            title="תכונה זו אינה זמינה בגרסת POC"
          />
          <Box color="text-status-info" fontSize="body-s">
            0:00
          </Box>
        </SpaceBetween>
        {showTooltip && (
          <StatusIndicator type="info">
            תכונה זו אינה זמינה בגרסת POC
          </StatusIndicator>
        )}
      </SpaceBetween>
    </Container>
  );
}