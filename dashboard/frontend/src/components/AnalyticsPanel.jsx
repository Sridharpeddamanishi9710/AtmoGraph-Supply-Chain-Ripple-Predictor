import React from 'react';
import { generateAuditReport, downloadJSON, downloadCSV } from '../utils/exportReport';

export default function AnalyticsPanel({
  graph,
  currentDisruption,
  activeRippleStage,
  predictionsById,
  isMitigationApplied,
  appliedStrategy
}) {
  const reportData = generateAuditReport({
    graph,
    currentDisruption,
    activeRippleStage,
    predictionsById,
    isMitigationApplied,
    appliedStrategy
  });

  const bottlenecks = [
    { id: 'PORT-003', name: 'Port of Rotterdam', type: 'Port', vulnerability: 'Critical (0.94)', throughput: '28k TEU/day', buffer: '3.2d' },
    { id: 'MFG-003', name: 'Sino-Euro Hardware', type: 'Manufacturer', vulnerability: 'High (0.82)', throughput: '890 units/day', buffer: '3.0d' },
    { id: 'SUP-003', name: 'Deccan Sensor Labs', type: 'Supplier', vulnerability: 'Medium (0.68)', throughput: '4.5k units/day', buffer: '7.0d' },
    { id: 'DIST-003', name: 'Nordic Fulfillment Hub', type: 'Distributor', vulnerability: 'Medium (0.58)', throughput: '64k sqm', buffer: '5.0d' }
  ];

  return (
    <div className="card analytics-card">
      <div className="analytics-header">
        <div>
          <h3>📊 Supply Chain Vulnerability & Ripple Analytics</h3>
          <p className="analytics-sub">Automated graph topology bottleneck diagnostics & export tools.</p>
        </div>

        <div className="export-btn-group">
          <button className="btn btn-export" onClick={() => downloadJSON(reportData)}>
            📥 Export JSON Audit
          </button>
          <button className="btn btn-export btn-secondary" onClick={() => downloadCSV(reportData)}>
            📊 Export CSV
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section">
          <h4>Single-Point-of-Failure (SPOF) Bottlenecks</h4>
          <table className="bottlenecks-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>Type</th>
                <th>Vulnerability Index</th>
                <th>Buffer Stock</th>
              </tr>
            </thead>
            <tbody>
              {bottlenecks.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.name}</strong> <span className="node-id-tag">{b.id}</span></td>
                  <td><span className="type-tag">{b.type}</span></td>
                  <td><span className={`vuln-tag ${b.vulnerability.includes('Critical') ? 'vuln-crit' : 'vuln-med'}`}>{b.vulnerability}</span></td>
                  <td>{b.buffer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="analytics-section">
          <h4>Delay Horizon Comparison (Days)</h4>
          <div className="delay-bars">
            <div className="bar-row">
              <span className="bar-label">Baseline (Nominal)</span>
              <div className="bar-container">
                <div className="bar-fill bar-nominal" style={{ width: '15%' }}>2.0d</div>
              </div>
            </div>
            <div className="bar-row">
              <span className="bar-label">Active Disruption</span>
              <div className="bar-container">
                <div className="bar-fill bar-disrupted" style={{ width: '85%' }}>12.4d</div>
              </div>
            </div>
            <div className="bar-row">
              <span className="bar-label">With AI Mitigation</span>
              <div className="bar-container">
                <div className="bar-fill bar-mitigated" style={{ width: '30%' }}>3.8d</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
