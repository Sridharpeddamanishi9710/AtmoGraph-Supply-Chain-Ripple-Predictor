import React, { useState, useEffect } from 'react';
import { PRECONFIGURED_SCENARIOS } from '../api/client';

export const SIMULATION_STAGES = [
  {
    step: 0,
    timeHorizon: 'T = Day 0',
    title: 'Initial Shock Trigger',
    description: 'Disruption event strikes anchor node. Immediate operations halt; throughput falls by 85%.',
    impactedNodes: ['PORT-003'],
    delayDelta: 0,
    statusClass: 'status-trigger'
  },
  {
    step: 1,
    timeHorizon: 'T = Day +4',
    title: 'Inbound Freight Congestion',
    description: 'Barge and feeder routes from Port of Rotterdam freeze. Inbound components stall at maritime customs.',
    impactedNodes: ['PORT-003', 'MFG-003'],
    delayDelta: 4,
    statusClass: 'status-spread'
  },
  {
    step: 2,
    timeHorizon: 'T = Day +9',
    title: 'Manufacturing Buffer Exhaustion',
    description: 'Sino-Euro Hardware exhausts safety inventory buffer (3 days). Sub-assembly line ceases operation.',
    impactedNodes: ['PORT-003', 'MFG-003', 'SUP-003'],
    delayDelta: 9,
    statusClass: 'status-critical'
  },
  {
    step: 3,
    timeHorizon: 'T = Day +16',
    title: 'Downstream Distribution Stockout',
    description: 'Nordic Fulfillment Hub reports critical SKU stockouts. Order fulfillment SLA breaches 40% penalty threshold.',
    impactedNodes: ['PORT-003', 'MFG-003', 'SUP-003', 'DIST-003'],
    delayDelta: 16,
    statusClass: 'status-systemic'
  }
];

export default function RippleSimulator({ onStepChange, onScenarioSelect }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1800); // ms per step
  const [selectedScenarioId, setSelectedScenarioId] = useState('SCENARIO-PORT-STRIKE');

  useEffect(() => {
    onStepChange && onStepChange(SIMULATION_STAGES[currentStep]);
  }, [currentStep]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= SIMULATION_STAGES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleNext = () => {
    if (currentStep < SIMULATION_STAGES.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const activeStage = SIMULATION_STAGES[currentStep];

  return (
    <div className="card ripple-simulator-card">
      <div className="simulator-header">
        <h3>
          <span>🌊 Ripple Propagation Simulator</span>
          <span className="step-badge">{activeStage.timeHorizon} (Wave {currentStep + 1}/{SIMULATION_STAGES.length})</span>
        </h3>
      </div>

      <div className="scenario-selector-bar">
        <label className="filter-label">Preconfigured Incident:</label>
        <select
          className="scenario-dropdown"
          value={selectedScenarioId}
          onChange={(e) => {
            setSelectedScenarioId(e.target.value);
            const sc = PRECONFIGURED_SCENARIOS.find(s => s.id === e.target.value);
            if (sc) onScenarioSelect && onScenarioSelect(sc);
            handleReset();
          }}
        >
          {PRECONFIGURED_SCENARIOS.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.name} ({sc.severity.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      <div className="stage-info-box">
        <h4 className="stage-title">{activeStage.title}</h4>
        <p className="stage-desc">{activeStage.description}</p>
        <div className="stage-meta">
          <span>Impacted Nodes: <strong>{activeStage.impactedNodes.join(' ➔ ')}</strong></span>
          <span className="delay-chip">Cumulative Delay: +{activeStage.delayDelta} Days</span>
        </div>
      </div>

      {/* Progress Timeline Tracker */}
      <div className="timeline-track">
        {SIMULATION_STAGES.map((st, idx) => (
          <div
            key={st.step}
            className={`timeline-step ${idx <= currentStep ? 'completed' : ''} ${idx === currentStep ? 'current' : ''}`}
            onClick={() => setCurrentStep(idx)}
            title={st.title}
          >
            <div className="step-circle">{idx + 1}</div>
            <span className="step-horizon">{st.timeHorizon}</span>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="simulator-controls">
        <button className="btn btn-secondary" onClick={handlePrev} disabled={currentStep === 0}>
          ⏮ Prev
        </button>

        <button
          className={`btn ${isPlaying ? 'btn-pause' : 'btn-play'}`}
          onClick={() => {
            if (currentStep === SIMULATION_STAGES.length - 1) {
              setCurrentStep(0);
            }
            setIsPlaying(!isPlaying);
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Simulate Ripple'}
        </button>

        <button className="btn btn-secondary" onClick={handleNext} disabled={currentStep === SIMULATION_STAGES.length - 1}>
          Next ⏭
        </button>

        <button className="btn btn-secondary" onClick={handleReset}>
          ↺ Reset
        </button>

        <div className="speed-toggle">
          <span className="filter-label">Speed:</span>
          <button className={`speed-btn ${playbackSpeed === 2400 ? 'active' : ''}`} onClick={() => setPlaybackSpeed(2400)}>1x</button>
          <button className={`speed-btn ${playbackSpeed === 1400 ? 'active' : ''}`} onClick={() => setPlaybackSpeed(1400)}>2x</button>
        </div>
      </div>
    </div>
  );
}
