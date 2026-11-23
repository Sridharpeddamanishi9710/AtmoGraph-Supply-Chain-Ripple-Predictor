import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DisruptionPreview from '../components/DisruptionPreview';

describe('DisruptionPreview', () => {
  it('renders untrusted event values as text', () => {
    const unsafeValue = '<img src=x onerror=alert(1)>';
    const markup = renderToStaticMarkup(
      <DisruptionPreview
        event={{
          matched_node_id: unsafeValue,
          description: unsafeValue
        }}
      />
    );

    expect(markup).toContain(`<mark>&lt;img src=x onerror=alert(1)&gt;</mark>`);
    expect(markup).not.toContain('<img');
  });
});
