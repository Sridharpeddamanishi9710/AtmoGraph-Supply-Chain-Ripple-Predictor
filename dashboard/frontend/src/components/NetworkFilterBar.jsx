import React from 'react';

export default function NetworkFilterBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedRisk,
  onRiskChange,
  onReset
}) {
  const nodeTypes = ['All', 'Supplier', 'Port', 'Manufacturer', 'Distributor'];
  const riskLevels = ['All', 'High', 'Medium', 'Low'];

  return (
    <div className="filter-bar">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Filter nodes by ID, name or country (e.g. Rotterdam, India, SUP)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => onSearchChange('')}>×</button>
        )}
      </div>

      <div className="filter-group">
        <span className="filter-label">Type:</span>
        <div className="pill-group">
          {nodeTypes.map((t) => (
            <button
              key={t}
              className={`filter-pill ${selectedType === t ? 'active' : ''}`}
              onClick={() => onTypeChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Risk:</span>
        <div className="pill-group">
          {riskLevels.map((r) => (
            <button
              key={r}
              className={`filter-pill ${selectedRisk === r ? 'active' : ''} pill-${r.toLowerCase()}`}
              onClick={() => onRiskChange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {(searchQuery || selectedType !== 'All' || selectedRisk !== 'All') && (
        <button className="reset-btn" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}
