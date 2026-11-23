import React from 'react';

export default function CommandHeader({ nodesCount, edgesCount, activeDisruptionsCount, highRiskCount, avgDelayDays, isDemoMode }) {
  return (
    <header className="command-header">
      <div className="header-brand">
        <div className="brand-logo-glow">⚡</div>
        <div>
          <h1 className="brand-title">AtmoGraph</h1>
          <p className="brand-subtitle">Supply Chain Ripple Effect Predictor & Resilience Cockpit</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Topology</span>
          <span className="kpi-value">{nodesCount} Nodes / {edgesCount} Lanes</span>
        </div>

        <div className="kpi-card kpi-warning">
          <span className="kpi-label">Active Alerts</span>
          <span className="kpi-value">{activeDisruptionsCount} Critical Event</span>
        </div>

        <div className="kpi-card kpi-danger">
          <span className="kpi-label">At-Risk Nodes</span>
          <span className="kpi-value">{highRiskCount} High / Critical</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Avg Delay Impact</span>
          <span className="kpi-value">+{avgDelayDays}d Projected</span>
        </div>

        <div className="kpi-card kpi-status">
          <span className="kpi-label">Engine Mode</span>
          <span className="mode-pill">{isDemoMode ? 'Synthetic Simulation' : 'Live Connected'}</span>
        </div>
      </div>
    </header>
  );
}
