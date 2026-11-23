import React, { useState, useMemo } from 'react';
import CommandHeader from './components/CommandHeader';
import NetworkFilterBar from './components/NetworkFilterBar';
import SupplyChainGraph from './components/SupplyChainGraph';
import RippleSimulator from './components/RippleSimulator';
import MitigationPlanner from './components/MitigationPlanner';
import NodeDetails from './components/NodeDetails';
import RiskLegend from './components/RiskLegend';
import DisruptionInput from './components/DisruptionInput';
import DemoModeBanner from './components/DemoModeBanner';
import mockGraph from './data/mockGraph.json';
import { CANNED_PREDICTIONS, CANNED_EVENT } from './api/client';
import './App.css';

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [activeRippleStage, setActiveRippleStage] = useState(null);
  const [isMitigationApplied, setIsMitigationApplied] = useState(false);
  const [appliedStrategyId, setAppliedStrategyId] = useState(null);
  const [currentDisruption, setCurrentDisruption] = useState(CANNED_EVENT);
  const [activeTab, setActiveTab] = useState('network'); // 'network' | 'mitigation' | 'input'

  // Pre-index predictions by node_id, adjusting for mitigation if applied
  const predictionsById = useMemo(() => {
    const map = {};
    CANNED_PREDICTIONS.forEach((p) => {
      if (isMitigationApplied) {
        // Mitigation slashes delay and risk score
        map[p.node_id] = {
          ...p,
          risk_score: Math.max(0.12, p.risk_score * 0.4),
          risk_class: p.risk_score > 0.6 ? 'medium' : 'low',
          estimated_delay_days: Math.max(1, Math.round(p.estimated_delay_days * 0.35))
        };
      } else {
        map[p.node_id] = p;
      }
    });
    return map;
  }, [isMitigationApplied]);

  // Derived KPI metrics
  const highRiskCount = Object.values(predictionsById).filter(p => p.risk_class === 'high').length;
  const avgDelayDays = isMitigationApplied ? 2.1 : 6.4;

  const handleApplyMitigation = (strategy) => {
    if (isMitigationApplied && appliedStrategyId === strategy.id) {
      setIsMitigationApplied(false);
      setAppliedStrategyId(null);
    } else {
      setIsMitigationApplied(true);
      setAppliedStrategyId(strategy.id);
    }
  };

  const selectedNodePrediction = selectedNode ? predictionsById[selectedNode.node_id] : null;

  return (
    <div className="dashboard-root">
      <DemoModeBanner demoMode={true} />

      <CommandHeader
        nodesCount={mockGraph.nodes.length}
        edgesCount={mockGraph.edges.length}
        activeDisruptionsCount={1}
        highRiskCount={highRiskCount}
        avgDelayDays={avgDelayDays}
        isDemoMode={true}
      />

      <div className="view-tabs">
        <button
          className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          🌐 Network & Ripple Simulator
        </button>
        <button
          className={`tab-btn ${activeTab === 'mitigation' ? 'active' : ''}`}
          onClick={() => setActiveTab('mitigation')}
        >
          🛡️ Contingency & Rerouting
        </button>
        <button
          className={`tab-btn ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          ⚡ Real-time NLP Ingestion
        </button>
      </div>

      <NetworkFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedRisk={selectedRisk}
        onRiskChange={setSelectedRisk}
        onReset={() => {
          setSearchQuery('');
          setSelectedType('All');
          setSelectedRisk('All');
        }}
      />

      <main className="main-workspace">
        <div className="center-panel">
          <div className="graph-canvas-container">
            <SupplyChainGraph
              selectedNodeId={selectedNode?.node_id}
              onSelectNode={setSelectedNode}
              searchQuery={searchQuery}
              selectedType={selectedType}
              selectedRisk={selectedRisk}
              predictionsById={predictionsById}
              activeRippleStage={activeRippleStage}
            />
          </div>

          {activeTab === 'network' && (
            <RippleSimulator
              onStepChange={setActiveRippleStage}
              onScenarioSelect={(sc) => {
                setCurrentDisruption({
                  ...CANNED_EVENT,
                  entity_name: sc.name,
                  event_type: sc.type,
                  matched_node_id: sc.targetNodeId,
                  severity: sc.severity,
                  description: sc.description
                });
              }}
            />
          )}

          {activeTab === 'mitigation' && (
            <MitigationPlanner
              onApplyMitigation={handleApplyMitigation}
              isApplied={isMitigationApplied}
              appliedStrategyId={appliedStrategyId}
            />
          )}

          {activeTab === 'input' && (
            <DisruptionInput
              onExtracted={(evt) => setCurrentDisruption(evt)}
              onAttached={(evt) => setCurrentDisruption(evt)}
            />
          )}
        </div>

        <aside className="side-panel">
          <NodeDetails
            node={selectedNode}
            disruption={selectedNode?.node_id === currentDisruption?.matched_node_id ? currentDisruption : null}
            prediction={selectedNodePrediction}
          />
          <RiskLegend />
        </aside>
      </main>
    </div>
  );
}
