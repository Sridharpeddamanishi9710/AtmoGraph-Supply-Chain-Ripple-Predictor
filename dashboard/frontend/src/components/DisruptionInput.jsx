import React, { useState } from 'react';
import { extractDisruption, attachDisruption } from '../api/client';
import DisruptionPreview from './DisruptionPreview';

export default function DisruptionInput({ onExtracted, onAttached }) {
  const [text, setText] = useState('A major port strike has halted operations at Port C in Europe. Shipping delays are expected to affect downstream manufacturers across the region.');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleExtract = async () => {
    setLoading(true);
    setError(false);
    try {
      const evt = await extractDisruption(text);
      setEvent(evt);
      onExtracted && onExtracted(evt);
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  };

  const handleAttach = async () => {
    if (!event) return;
    setLoading(true);
    setError(false);
    try {
      const attached = await attachDisruption(event);
      onAttached && onAttached(attached);
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3>Disruption Input</h3>
      <textarea
        rows={5}
        style={{ width: '100%', marginBottom: '8px' }}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={handleExtract} disabled={loading} className="btn">
        {loading ? 'Extracting…' : 'Extract Disruption'}
      </button>
      {event && (
        <DisruptionPreview event={event} />
      )}
      <button onClick={handleAttach} disabled={loading || !event} className="btn" style={{ marginTop: '8px' }}>
        {loading ? 'Attaching…' : 'Attach to Graph'}
      </button>
      {error && <p style={{ color: '#ef4444' }}>Request failed — demo mode active</p>}
    </div>
  );
}
