import mockGraph from '../data/mockGraph.json';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
let isDemoMode = true; // default to demo/mock until live API responds

export const getDemoMode = () => isDemoMode;

export const CANNED_EVENT = {
  event_id: 'EVT-DEMO-001',
  entity_name: 'Port of Rotterdam (PORT-003)',
  matched_node_id: 'PORT-003',
  event_type: 'port_strike',
  location: 'Europe / Netherlands',
  severity: 'high',
  event_date: '2026-11-20',
  source: 'Maritime Trade Intelligence Feed',
  confidence: 0.94,
  description: 'Labor union dockworker strike halting 85% of container unloader cranes, causing critical shipping backlog for European manufacturing inputs.'
};

export const PRECONFIGURED_SCENARIOS = [
  {
    id: 'SCENARIO-PORT-STRIKE',
    name: 'North Sea Port Strike',
    targetNodeId: 'PORT-003',
    severity: 'high',
    type: 'port_strike',
    description: 'Labor action halts unloading at Port of Rotterdam. Cascades to European and Asian manufacturing assembly lines.'
  },
  {
    id: 'SCENARIO-SEMICONDUCTOR',
    name: 'Tier-1 Fab Raw Material Shortage',
    targetNodeId: 'SUP-001',
    severity: 'high',
    type: 'supplier_shortage',
    description: 'Chemical supply embargo delays wafer fab packaging in Mumbai hub, propagating delays downstream.'
  },
  {
    id: 'SCENARIO-WEATHER',
    name: 'Typhoon Logistics Disruption',
    targetNodeId: 'PORT-004',
    severity: 'medium',
    type: 'extreme_weather',
    description: 'Severe typhoon near Malacca Strait delays container departures by 6 days.'
  }
];

export const CANNED_PREDICTIONS = [
  { node_id: 'PORT-003', risk_score: 0.88, risk_class: 'high', estimated_delay_days: 12, horizon_days: 30, model_version: 'gnn-v1.2-atmo', generated_at: new Date().toISOString() },
  { node_id: 'MFG-003',  risk_score: 0.74, risk_class: 'high', estimated_delay_days: 9, horizon_days: 30, model_version: 'gnn-v1.2-atmo', generated_at: new Date().toISOString() },
  { node_id: 'DIST-003', risk_score: 0.58, risk_class: 'medium', estimated_delay_days: 6, horizon_days: 30, model_version: 'gnn-v1.2-atmo', generated_at: new Date().toISOString() },
  { node_id: 'SUP-003',  risk_score: 0.45, risk_class: 'medium', estimated_delay_days: 4, horizon_days: 30, model_version: 'gnn-v1.2-atmo', generated_at: new Date().toISOString() },
  { node_id: 'MFG-001',  risk_score: 0.32, risk_class: 'low', estimated_delay_days: 2, horizon_days: 30, model_version: 'gnn-v1.2-atmo', generated_at: new Date().toISOString() }
];

async function safeFetch(path, options = {}, fallback) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    isDemoMode = false;
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    isDemoMode = true;
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

export const getHealth = () => safeFetch('/health', {}, { status: 'demo_mode', backend_available: false });

export const getGraph = () => safeFetch('/graph', {}, mockGraph);

export const getSubgraph = (id, depth = 2) => safeFetch(`/graph/subgraph/${id}?depth=${depth}`, {}, mockGraph);

export const extractDisruption = async (text, sourceId = 'news_feed') => {
  return safeFetch('/disruptions/extract', {
    method: 'POST',
    body: JSON.stringify({ text, source_id: sourceId })
  }, () => ({
    ...CANNED_EVENT,
    event_id: `EVT-${Date.now().toString().slice(-4)}`,
    description: text
  }));
};

export const attachDisruption = async (event) => {
  return safeFetch('/disruptions/attach', {
    method: 'POST',
    body: JSON.stringify(event)
  }, () => ({
    ...event,
    attached: true,
    attached_at: new Date().toISOString()
  }));
};

export const getPrediction = (nodeId) => {
  return safeFetch(`/predictions/${nodeId}`, {}, () => {
    return CANNED_PREDICTIONS.find(p => p.node_id === nodeId) || {
      node_id: nodeId,
      risk_score: 0.15,
      risk_class: 'low',
      estimated_delay_days: 1,
      horizon_days: 30,
      model_version: 'gnn-v1.2-atmo',
      generated_at: new Date().toISOString()
    };
  });
};

export const getPredictions = (nodeIds = []) => {
  return safeFetch(`/predictions?nodes=${nodeIds.join(',')}`, {}, () => CANNED_PREDICTIONS);
};

export const getDownstreamPredictions = (nodeId, depth = 3) => {
  return safeFetch(`/predictions/downstream/${nodeId}?depth=${depth}`, {}, () => CANNED_PREDICTIONS);
};
