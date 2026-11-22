import React from 'react';

export default function RiskLegend() {
  const typeColors = {
    Supplier: '#3b82f6',
    Manufacturer: '#10b981',
    Port: '#f59e0b',
    Distributor: '#8b5cf6',
    Product: '#64748b'
  };
  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <h4>Node types</h4>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: color, borderRadius: '50%', marginRight: '4px' }} />
            <span>{type}</span>
          </div>
        ))}
      </div>
      <h4 style={{ marginTop: '8px' }}>Risk level</h4>
      <div style={{ display: 'flex', gap: '12px' }}>
        <span className="badge-low" style={{ backgroundColor: '#22c55e', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Low</span>
        <span className="badge-medium" style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Medium</span>
        <span className="badge-high" style={{ backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>High</span>
      </div>
      <p style={{ marginTop: '4px' }}>🔴 pulsing = disrupted node</p>
    </div>
  );
}
