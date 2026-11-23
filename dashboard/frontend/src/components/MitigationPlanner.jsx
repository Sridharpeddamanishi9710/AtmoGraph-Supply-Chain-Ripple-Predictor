import React, { useState } from 'react';

const CONTINGENCY_STRATEGIES = [
  {
    id: 'STRAT-AIR-BYPASS',
    title: 'Emergency Air-Freight Corridor',
    summary: 'Direct air-cargo charter bypassing congested Rotterdam port into Munich hub.',
    costImpact: '+12% Freight Premium',
    delayMitigationDays: -9,
    confidence: '92%',
    recommended: true,
    steps: [
      'Re-route 250 TEU high-priority silicon cargo to Frankfurt Air Hub.',
      'Engage pre-approved express customs clearance.',
      'Direct drayage to Bavaria Auto Assembly line.'
    ]
  },
  {
    id: 'STRAT-DUAL-SOURCE',
    title: 'Dual-Sourcing Allocation to SUP-002',
    summary: 'Shift 40% component volume to Bharat Precision Foundry via JNPT/Singapore route.',
    costImpact: '+4% Cost Delta',
    delayMitigationDays: -6,
    confidence: '86%',
    recommended: false,
    steps: [
      'Trigger secondary supply agreement with Bharat Precision.',
      'Utilize existing maritime contract with Port of Singapore.',
      'Absorb 2-day tooling recalibration lead time.'
    ]
  },
  {
    id: 'STRAT-BUFFER-DRAFT',
    title: 'Safety Stock Inter-Depot Rebalancing',
    summary: 'Draw 5 days inventory buffer from Trans-Atlantic Prime warehouse to stabilize EU lines.',
    costImpact: '+2% Logistics Cost',
    delayMitigationDays: -4,
    confidence: '79%',
    recommended: false,
    steps: [
      'Authorize emergency draw from Midwest Logistics reserve.',
      'Prioritize high-margin automotive SKU assembly.',
      'Replenish US buffer via expedited maritime lane.'
    ]
  }
];

export default function MitigationPlanner({ onApplyMitigation, isApplied, appliedStrategyId }) {
  const [selectedStrategyId, setSelectedStrategyId] = useState('STRAT-AIR-BYPASS');

  const selectedStrategy = CONTINGENCY_STRATEGIES.find(s => s.id === selectedStrategyId) || CONTINGENCY_STRATEGIES[0];

  const handleApply = () => {
    onApplyMitigation && onApplyMitigation(selectedStrategy);
  };

  return (
    <div className="card mitigation-card">
      <div className="mitigation-header">
        <h3>
          <span>🛡️ AI Mitigation & Contingency Planner</span>
          {isApplied && <span className="applied-badge">Active Reroute Enabled</span>}
        </h3>
        <p className="mitigation-sub">
          Prescriptive recommendations to truncate disruption ripple effects across the topology.
        </p>
      </div>

      <div className="strategy-selector-list">
        {CONTINGENCY_STRATEGIES.map((strat) => (
          <div
            key={strat.id}
            className={`strategy-item ${selectedStrategyId === strat.id ? 'active' : ''}`}
            onClick={() => setSelectedStrategyId(strat.id)}
          >
            <div className="strategy-top">
              <span className="strategy-title">
                {strat.title} {strat.recommended && <span className="recommended-tag">AI Optimal</span>}
              </span>
              <span className="mitigation-delta">{strat.delayMitigationDays}d Delay</span>
            </div>
            <p className="strategy-summary">{strat.summary}</p>
          </div>
        ))}
      </div>

      <div className="strategy-detail-box">
        <h4>Actionable Rerouting Plan ({selectedStrategy.title})</h4>
        <div className="strategy-metrics">
          <div className="metric-cell">
            <span className="metric-label">Estimated Delay Cut</span>
            <span className="metric-val text-green">{selectedStrategy.delayMitigationDays} Days</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Cost Impact</span>
            <span className="metric-val">{selectedStrategy.costImpact}</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Confidence</span>
            <span className="metric-val text-cyan">{selectedStrategy.confidence}</span>
          </div>
        </div>

        <ul className="strategy-steps">
          {selectedStrategy.steps.map((st, i) => (
            <li key={i}>{st}</li>
          ))}
        </ul>

        <div className="mitigation-action-row">
          <button
            className={`btn ${isApplied && appliedStrategyId === selectedStrategy.id ? 'btn-revert' : 'btn-apply'}`}
            onClick={handleApply}
          >
            {isApplied && appliedStrategyId === selectedStrategy.id
              ? '↺ Revert to Baseline Disruption'
              : `✓ Implement ${selectedStrategy.title}`}
          </button>
        </div>
      </div>
    </div>
  );
}
