/**
 * Export Utility for AtmoGraph Disruption & Ripple Reports
 */

export function generateAuditReport({
  graph,
  currentDisruption,
  activeRippleStage,
  predictionsById,
  isMitigationApplied,
  appliedStrategy
}) {
  const timestamp = new Date().toISOString();

  const impactedNodes = Object.entries(predictionsById)
    .filter(([_, p]) => p.risk_class === 'high' || p.risk_class === 'medium')
    .map(([nodeId, p]) => {
      const node = graph.nodes.find(n => n.node_id === nodeId) || {};
      return {
        node_id: nodeId,
        name: node.name || 'Unknown',
        type: node.node_type || 'Unknown',
        country: node.country || '',
        risk_class: p.risk_class,
        risk_score: p.risk_score,
        estimated_delay_days: p.estimated_delay_days
      };
    });

  return {
    meta: {
      report_title: 'AtmoGraph Supply Chain Ripple Effect & Disruption Audit',
      generated_at: timestamp,
      generator: 'AtmoGraph Intelligence Engine v1.2'
    },
    incident: {
      id: currentDisruption?.event_id || 'EVT-NONE',
      anchor_entity: currentDisruption?.entity_name || 'N/A',
      matched_node_id: currentDisruption?.matched_node_id || 'N/A',
      event_type: currentDisruption?.event_type || 'N/A',
      severity: currentDisruption?.severity || 'low',
      description: currentDisruption?.description || ''
    },
    ripple_status: {
      current_wave: activeRippleStage?.step ?? 0,
      time_horizon: activeRippleStage?.timeHorizon ?? 'T=0',
      wave_title: activeRippleStage?.title ?? 'Initial Trigger',
      projected_delay_days: activeRippleStage?.delayDelta ?? 0
    },
    mitigation: {
      applied: !!isMitigationApplied,
      strategy_id: appliedStrategy?.id || null,
      strategy_title: appliedStrategy?.title || 'None',
      expected_delay_reduction_days: appliedStrategy?.delayMitigationDays || 0,
      freight_cost_delta: appliedStrategy?.costImpact || '0%'
    },
    impacted_nodes_count: impactedNodes.length,
    impacted_nodes: impactedNodes
  };
}

export function downloadJSON(data, filename = 'atmograph_disruption_report.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSV(data, filename = 'atmograph_impacted_nodes.csv') {
  const nodes = data.impacted_nodes || [];
  if (nodes.length === 0) return;

  const headers = ['node_id', 'name', 'type', 'country', 'risk_class', 'risk_score', 'estimated_delay_days'];
  const rows = nodes.map(n =>
    [n.node_id, `"${n.name}"`, n.type, n.country, n.risk_class, n.risk_score, n.estimated_delay_days].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
