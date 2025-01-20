import React from 'react';
import Button from '@cloudscape-design/components/button';
import logo from './assets/מרחבים.jpg';

export default function Header() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #72c0ff, #0066cc)',
        padding: '16px 32px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        direction: 'ltr',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Left: Logo */}
      <div style={{ width: '200px' }}>
        <img
          src={logo}
          alt="Merhavim Logo"
          style={{
            height: '50px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
      </div>

      {/* Center: Hospital Name */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontWeight: '600',
            fontSize: '24px',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          מרכז רפואי מרחבים
        </span>
      </div>

      {/* Right: Doctor Name and Buttons */}
      <div
        style={{
          width: '200px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <span
          style={{
            fontWeight: '500',
            color: '#ffffff',
            marginLeft: '20px',
          }}
        >
          ד״ר גדי כהן רפפורט
        </span>
        {['notification', 'settings', 'external', 'user-profile'].map((iconName) => (
          <Button
            key={iconName}
            variant="icon"
            iconName={iconName}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
