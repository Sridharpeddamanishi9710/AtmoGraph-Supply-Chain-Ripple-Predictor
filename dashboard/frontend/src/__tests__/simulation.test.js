import { describe, it, expect } from 'vitest';
import { generateAuditReport } from '../utils/exportReport';
import mockGraph from '../data/mockGraph.json';

describe('Ripple Simulation & Export Audit', () => {
  it('correctly generates an audit report with nominal inputs', () => {
    const report = generateAuditReport({
      graph: mockGraph,
      currentDisruption: {
        event_id: 'EVT-TEST',
        entity_name: 'Port of Rotterdam',
        matched_node_id: 'PORT-003',
        event_type: 'port_strike',
        severity: 'high'
      },
      activeRippleStage: {
        step: 1,
        timeHorizon: 'T=Day +4',
        title: 'Inbound Freight Congestion',
        delayDelta: 4
      },
      predictionsById: {
        'PORT-003': { risk_class: 'high', risk_score: 0.88, estimated_delay_days: 12 },
        'MFG-003': { risk_class: 'high', risk_score: 0.74, estimated_delay_days: 9 }
      },
      isMitigationApplied: false,
      appliedStrategy: null
    });

    expect(report.incident.matched_node_id).toBe('PORT-003');
    expect(report.ripple_status.projected_delay_days).toBe(4);
    expect(report.impacted_nodes_count).toBe(2);
    expect(report.mitigation.applied).toBe(false);
  });

  it('reflects mitigation parameters in the report when active', () => {
    const report = generateAuditReport({
      graph: mockGraph,
      currentDisruption: null,
      activeRippleStage: null,
      predictionsById: {},
      isMitigationApplied: true,
      appliedStrategy: {
        id: 'STRAT-AIR-BYPASS',
        title: 'Emergency Air-Freight Corridor',
        delayMitigationDays: -9,
        costImpact: '+12%'
      }
    });

    expect(report.mitigation.applied).toBe(true);
    expect(report.mitigation.strategy_id).toBe('STRAT-AIR-BYPASS');
    expect(report.mitigation.expected_delay_reduction_days).toBe(-9);
  });
});
