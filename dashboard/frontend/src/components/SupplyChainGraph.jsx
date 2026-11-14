import React from 'react'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow'
import mockNodes from '../mock/nodes.json'
import mockPredictions from '../mock/predictions.json'

function getRiskColor(nodeId) {
  const prediction = mockPredictions.find((item) => item.node_id === nodeId)
  if (!prediction) return '#e0e0e0'
  return prediction.risk_class === 'high'
    ? '#ff6b6b'
    : prediction.risk_class === 'medium'
      ? '#ffd93d'
      : '#6bcb77'
}

const initialNodes = mockNodes.map((node, index) => ({
  id: node.node_id,
  data: { label: `${node.name} (${node.node_type})` },
  position: { x: (index % 2) * 250, y: Math.floor(index / 2) * 150 },
  style: {
    background: getRiskColor(node.node_id),
    border: '2px solid #333',
    borderRadius: 8,
    padding: 10,
  },
}))

const initialEdges = [
  { id: 'e1-2', source: 'SUP-001', target: 'MFG-001', animated: true },
  { id: 'e2-3', source: 'MFG-001', target: 'PORT-003', animated: true },
  { id: 'e3-4', source: 'PORT-003', target: 'DIS-001', animated: true },
]

export default function SupplyChainGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} />
      </ReactFlow>
    </div>
  )
}
