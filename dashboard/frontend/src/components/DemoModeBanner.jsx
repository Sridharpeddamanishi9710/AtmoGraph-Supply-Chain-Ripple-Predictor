import React from 'react';

export default function DemoModeBanner({ demoMode }) {
  return (
    <div style={{
      background: '#7c2d12',
      color: '#fed7aa',
      padding: '8px 16px',
      fontWeight: 600,
      textAlign: 'center',
      fontSize: '13px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      ⚠️ SIMULATED DEMO — DATA IS SYNTHETIC AND PREDICTIONS ARE ILLUSTRATIVE
      {demoMode && (
        <div style={{ fontSize: '11px', marginTop: '4px' }}>
          API unavailable — using bundled mock data
        </div>
      )}
    </div>
  );
}
