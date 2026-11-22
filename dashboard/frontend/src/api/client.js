import axios from 'axios';
import mockGraph from '../data/mockGraph.json';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: BASE_URL, timeout: 5000 });

let isDemoMode = false;
export const getDemoMode = () => isDemoMode;

const CANNED_EVENT = {
  event_id: 'EVT-DEMO-001',
  entity_name: 'Port C',
  matched_node_id: 'PORT-003',
  event_type: 'port_strike',
  location: 'Europe',
  severity: 'high',
  event_date: '2026-11-10',
  source: 'sample_news_demo',
  confidence: 0.91
};

const CANNED_PREDICTIONS = [
  { node_id: 'PORT-003', risk_score: 0.82, risk_class: 'high', estimated_delay_days: 8, horizon_days: 30, model_version: 'gnn-v0.1-demo', generated_at: new Date().toISOString() },
  { node_id: 'MFG-001',  risk_score: 0.61, risk_class: 'medium', estimated_delay_days: 6, horizon_days: 30, model_version: 'gnn-v0.1-demo', generated_at: new Date().toISOString() },
  { node_id: 'DIST-001', risk_score: 0.42, risk_class: 'medium', estimated_delay_days: 4, horizon_days: 30, model_version: 'gnn-v0.1-demo', generated_at: new Date().toISOString() }
];

async function safeGet(path, fallback) {
  try {
    const res = await api.get(path);
    return res.data;
  } catch (err) {
    isDemoMode = true;
    console.warn(`[demo-mode] GET ${path} failed — using mock data`);
    return fallback;
  }
}

async function safePost(path, body, fallback) {
  try {
    const res = await api.post(path, body);
    return res.data;
  } catch (err) {
    isDemoMode = true;
    console.warn(`[demo-mode] POST ${path} failed — using canned response`);
    return fallback(body);
  }
}

export const getHealth      = () => safeGet('/health', { status: 'demo' });
export const getGraph       = () => safeGet('/graph', mockGraph);
export const getSubgraph    = (id, depth = 2) => safeGet(`/graph/subgraph/${id}?depth=${depth}`, mockGraph);
export const extractDisruption = (text, sourceId = 'sample_news_demo') =>
  safePost('/disruptions/extract', { text, source_id: sourceId }, () => CANNED_EVENT);
export const attachDisruption  = (event) =>
  safePost('/disruptions/attach', event, () => ({ ...event, attached: true }));
export const getPrediction     = (nodeId) =>
  safeGet(`/predictions/${nodeId}`, CANNED_PREDICTIONS.find(p => p.node_id === nodeId) || null);
export const getPredictions    = (nodeIds) =>
  safeGet(`/predictions?nodes=${nodeIds.join(',')}`, CANNED_PREDICTIONS);
export const getDownstreamPredictions = (nodeId, depth = 3) =>
  safeGet(`/predictions/downstream/${nodeId}?depth=${depth}`, CANNED_PREDICTIONS);
