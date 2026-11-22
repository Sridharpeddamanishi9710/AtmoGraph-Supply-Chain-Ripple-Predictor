import React from 'react';

export default function NodeDetails({ node, disruption, prediction }) {
  if (!node) {
    return (
      <div className="card" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
        Click a node to see details
      </div>
    );
  }

  const typeColorMap = {
    Supplier: '#3b82f6',
    Manufacturer: '#10b981',
    Port: '#f59e0b',
    Distributor: '#8b5cf6',
    Product: '#64748b'
  };

  const badgeStyle = {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#fff',
    backgroundColor: typeColorMap[node.node_type] || '#64748b',
    marginLeft: '8px'
  };

  return (
    <div className="card">
      <h3 style={{ margin: 0 }}>{node.name}<span style={badgeStyle}>{node.node_type}</span></h3>
      <p><strong>ID:</strong> {node.node_id}</p>
      {node.country && <p><strong>Country:</strong> {node.country}</p>}
      <section>
        <h4>Attributes</h4>
        {Object.entries(node.attributes || {}).length === 0 ? (
          <p>None</p>
        ) : (
          <ul>
            {Object.entries(node.attributes).map(([k, v]) => (
              <li key={k}>{k}: {v?.toString()}</li>
            ))}
          </ul>
        )}
      </section>
      {disruption && (
        <section>
          <h4>Disruption</h4>
          <p><strong>Type:</strong> {disruption.event_type}</p>
          <p><strong>Severity:</strong> <span className={`badge-${disruption.severity}`}>{disruption.severity}</span></p>
          <p><strong>Date:</strong> {disruption.event_date}</p>
        </section>
      )}
      {prediction && (
        <section>
          <h4>Prediction</h4>
          <p><strong>Risk score:</strong> {prediction.risk_score.toFixed(2)}</p>
          <p><strong>Risk class:</strong> <span className={`badge-${prediction.risk_class}`}>{prediction.risk_class}</span></p>
          <p><strong>Estimated delay (days):</strong> {prediction.estimated_delay_days}</p>
          <p><strong>Model version:</strong> {prediction.model_version}</p>
        </section>
      )}
      {(!disruption && !prediction) && (
        <p style={{ color: '#94a3b8' }}>No disruption or prediction data for this node</p>
      )}
    </div>
  );
}
