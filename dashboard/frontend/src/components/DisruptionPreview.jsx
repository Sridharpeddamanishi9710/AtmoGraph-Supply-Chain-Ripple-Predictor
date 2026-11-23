import React from 'react';

export default function DisruptionPreview({ event }) {
  return (
    <>
      {event.matched_node_id && (
        <p>
          <strong>Matched node:</strong>{' '}
          <mark>{String(event.matched_node_id)}</mark>
        </p>
      )}
      <pre className="json-block">{JSON.stringify(event, null, 2)}</pre>
    </>
  );
}
