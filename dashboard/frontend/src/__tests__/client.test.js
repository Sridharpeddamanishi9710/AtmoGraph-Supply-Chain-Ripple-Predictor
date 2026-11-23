import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDemoMode, getGraph } from '../api/client';
import mockGraph from '../data/mockGraph.json';

describe('api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to mock graph when API is unreachable', async () => {
    fetch.mockRejectedValue(new Error('API unavailable'));

    const graph = await getGraph();

    expect(graph).toEqual(mockGraph);
    expect(getDemoMode()).toBe(true);
  });

  it('uses the live graph when the API responds successfully', async () => {
    const liveGraph = { nodes: [{ node_id: 'LIVE-001' }], edges: [] };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => liveGraph
    });

    await expect(getGraph()).resolves.toEqual(liveGraph);
    expect(getDemoMode()).toBe(false);
  });

  it('falls back to mock data for unsuccessful HTTP responses', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 503
    });

    await expect(getGraph()).resolves.toEqual(mockGraph);
    expect(getDemoMode()).toBe(true);
  });
});
