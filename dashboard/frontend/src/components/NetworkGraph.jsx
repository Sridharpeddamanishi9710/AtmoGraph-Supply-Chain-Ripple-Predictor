import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const typeColors = {
  Supplier: '#3b82f6',
  Manufacturer: '#10b981',
  Port: '#f59e0b',
  Distributor: '#8b5cf6',
  Product: '#64748b'
};

export default function NetworkGraph({ graph, selectedNodeId, onSelectNode, predictionsById }) {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 600 });

  useEffect(() => {
    if (!graph.nodes || graph.nodes.length === 0) return;

    const width = svgRef.current.parentElement.clientWidth;
    setDimensions({ width, height: 600 });
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear previous

    // defs for grid pattern (optional)
    const defs = svg.append('defs');
    defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse')
      .append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.5);

    svg.append('rect')
      .attr('width', width)
      .attr('height', 600)
      .attr('fill', 'url(#grid)')
      .attr('pointer-events', 'none');

    const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.edges).id(d => d.node_id).distance(120).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, 300))
      .force('collide', d3.forceCollide().radius(d => (d.attributes?.is_disrupted ? 30 : 24)));

    const link = svg.append('g')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.5)
      .selectAll('line')
      .data(graph.edges)
      .join('line')
      .attr('stroke-opacity', 0.7)
      .append('title')
      .text(d => `lead time: ${d.lead_time_days} days`);

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(graph.nodes)
      .join('circle')
      .attr('r', d => (d.attributes?.is_disrupted ? 24 : 18))
      .attr('fill', d => typeColors[d.node_type] || '#64748b')
      .attr('fill-opacity', d => {
        const pred = predictionsById?.[d.node_id];
        if (pred) return 0.4 + 0.6 * pred.risk_score;
        return 0.9;
      })
      .attr('stroke', d => (d.node_id === selectedNodeId ? '#ffffff' : (d.attributes?.is_disrupted ? '#ef4444' : '#000000')))
      .attr('stroke-width', d => (d.node_id === selectedNodeId ? 3 : (d.attributes?.is_disrupted ? 4 : 1)))
      .classed('pulse', d => d.attributes?.is_disrupted)
      .on('click', (event, d) => {
        onSelectNode(d);
      });

    const label = svg.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('font-size', 10)
      .attr('fill', '#e2e8f0')
      .attr('text-anchor', 'middle')
      .text(d => {
        const name = d.name || d.node_id;
        return name.length > 18 ? name.slice(0, 15) + '…' : name;
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y + 30);
    });

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });
    d3.select(svgRef.current).call(zoom);

    return () => simulation.stop();
  }, [graph, selectedNodeId, predictionsById, onSelectNode]);

  if (!graph.nodes || graph.nodes.length === 0) {
    return <div>No graph data</div>;
  }

  return (
    <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{ background: '#0f172a' }} />
  );
}
