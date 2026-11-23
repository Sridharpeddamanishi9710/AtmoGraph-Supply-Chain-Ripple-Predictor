import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import mockGraph from '../data/mockGraph.json';

const TYPE_COLOR_MAP = {
  Supplier: '#38bdf8',
  Port: '#f59e0b',
  Manufacturer: '#10b981',
  Distributor: '#a855f7'
};

export default function SupplyChainGraph({
  selectedNodeId,
  onSelectNode,
  searchQuery = '',
  selectedType = 'All',
  selectedRisk = 'All',
  predictionsById = {},
  activeRippleStage = null
}) {
  // Compute positions in columns by tier/type
  const columnPositions = {
    Supplier: 80,
    Port: 340,
    Manufacturer: 620,
    Distributor: 900
  };

  const initialNodes = useMemo(() => {
    const counters = { Supplier: 0, Port: 0, Manufacturer: 0, Distributor: 0 };
    return mockGraph.nodes.map((node) => {
      const colX = columnPositions[node.node_type] || 400;
      const rowY = 70 + (counters[node.node_type] || 0) * 115;
      counters[node.node_type] = (counters[node.node_type] || 0) + 1;

      return {
        id: node.node_id,
        data: {
          label: (
            <div style={{ textAlign: 'left', pointerEvents: 'none' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>
                {node.node_type} • {node.country}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                {node.name}
              </div>
              <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.9 }}>
                ID: {node.node_id}
              </div>
            </div>
          ),
          rawNode: node
        },
        position: { x: colX, y: rowY },
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1.5px solid #334155',
          borderRadius: 8,
          padding: '10px 14px',
          width: 180,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.25s ease'
        }
      };
    });
  }, []);

  const initialEdges = useMemo(() => {
    return mockGraph.edges.map((edge, idx) => ({
      id: `e-${edge.source_id}-${edge.target_id}-${idx}`,
      source: edge.source_id,
      target: edge.target_id,
      animated: edge.source_id === 'PORT-003' || edge.target_id === 'PORT-003',
      label: `${edge.lead_time_days}d`,
      style: {
        stroke: (edge.source_id === 'PORT-003' || edge.target_id === 'PORT-003') ? '#ef4444' : '#64748b',
        strokeWidth: 2
      },
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 600 }
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Dynamic styling based on filter, selection, and ripple stage
  useEffect(() => {
    const impactedSet = new Set(activeRippleStage ? activeRippleStage.impactedNodes : []);

    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        const raw = n.data.rawNode;
        const pred = predictionsById[n.id];
        const isImpactedByRipple = impactedSet.has(n.id);
        const isSelected = n.id === selectedNodeId;

        // Filtering
        const matchesSearch =
          !searchQuery ||
          raw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          raw.node_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (raw.country && raw.country.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = selectedType === 'All' || raw.node_type === selectedType;
        const riskClass = pred?.risk_class || (raw.attributes?.is_disrupted ? 'high' : 'low');
        const matchesRisk = selectedRisk === 'All' || riskClass.toLowerCase() === selectedRisk.toLowerCase();

        const isDimmed = !matchesSearch || !matchesType || !matchesRisk;

        let borderStyle = `1.5px solid ${TYPE_COLOR_MAP[raw.node_type] || '#475569'}`;
        let bg = '#1e293b';

        if (isSelected) {
          borderStyle = '2.5px solid #38bdf8';
          bg = '#0f2942';
        } else if (isImpactedByRipple || raw.attributes?.is_disrupted) {
          borderStyle = '2.5px solid #ef4444';
          bg = '#3b1212';
        }

        return {
          ...n,
          style: {
            ...n.style,
            opacity: isDimmed ? 0.25 : 1,
            background: bg,
            border: borderStyle,
            boxShadow: isSelected
              ? '0 0 16px rgba(56, 189, 248, 0.6)'
              : (isImpactedByRipple ? '0 0 18px rgba(239, 68, 68, 0.7)' : '0 4px 10px rgba(0,0,0,0.5)')
          }
        };
      })
    );
  }, [selectedNodeId, searchQuery, selectedType, selectedRisk, predictionsById, activeRippleStage]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0b1120' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onSelectNode && onSelectNode(node.data.rawNode)}
        fitView
      >
        <Controls style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }} />
        <MiniMap
          style={{ background: '#0f172a', border: '1px solid #334155' }}
          nodeColor={(n) => TYPE_COLOR_MAP[n.data?.rawNode?.node_type] || '#334155'}
        />
        <Background color="#1e293b" gap={20} size={1.5} />
      </ReactFlow>
    </div>
  );
}
