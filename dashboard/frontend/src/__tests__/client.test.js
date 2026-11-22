import { describe, it, expect } from 'vitest';
import { getGraph, getDemoMode } from '../api/client';

describe('api client', () => {
  it('falls back to mock graph when API is unreachable', async () => {
    const graph = await getGraph();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(getDemoMode()).toBe(true);
  });
});
