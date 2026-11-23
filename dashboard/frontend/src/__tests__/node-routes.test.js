import { describe, expect, it } from 'vitest';
import { getNodeRoutes } from '../data/nodeRoutes';

const graph = {
  nodes: [
    { node_id: 'SUP-001', name: 'Supplier One' },
    { node_id: 'PORT-001', name: 'Port One' },
    { node_id: 'MFG-001', name: 'Manufacturer One' }
  ],
  edges: [
    {
      source_id: 'SUP-001',
      target_id: 'PORT-001',
      relationship_type: 'OCEAN',
      lead_time_days: 4,
      reliability: 0.9
    },
    {
      source_id: 'PORT-001',
      target_id: 'MFG-001',
      relationship_type: 'RAIL',
      lead_time_days: 2,
      reliability: 0.8
    }
  ]
};

describe('getNodeRoutes', () => {
  it('returns named inbound and outbound lanes for a node', () => {
    expect(getNodeRoutes(graph, 'PORT-001')).toEqual({
      incoming: [
        {
          ...graph.edges[0],
          connectedNodeId: 'SUP-001',
          connectedNodeName: 'Supplier One'
        }
      ],
      outgoing: [
        {
          ...graph.edges[1],
          connectedNodeId: 'MFG-001',
          connectedNodeName: 'Manufacturer One'
        }
      ]
    });
  });

  it('returns empty route lists for an isolated node', () => {
    expect(getNodeRoutes({ nodes: [], edges: [] }, 'UNKNOWN')).toEqual({
      incoming: [],
      outgoing: []
    });
  });
});
