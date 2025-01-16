import React from 'react';
import Box from '@cloudscape-design/components/box';
import Icon from '@cloudscape-design/components/icon';
import Button from '@cloudscape-design/components/button';

export default function Header() {
  return (
    <Box
      padding="s"
      className="app-header"
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderBottom: '1px solid #eaeded',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <span style={{ fontWeight: 'bold' }}>ד״ר גדי כהן רפפורט</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="icon"
            iconName="notification"
            ariaLabel="התראות"
          />
          <Button
            variant="icon"
            iconName="settings"
            ariaLabel="הגדרות"
          />
        </div>
      </Box>
    </Box>
  );
} 