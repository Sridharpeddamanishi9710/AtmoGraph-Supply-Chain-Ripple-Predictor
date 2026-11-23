export function getNodeRoutes(graph, nodeId) {
  const nodeNames = new Map(
    graph.nodes.map((node) => [node.node_id, node.name])
  );

  const mapRoute = (edge, direction) => {
    const connectedNodeId =
      direction === 'outgoing' ? edge.target_id : edge.source_id;

    return {
      ...edge,
      connectedNodeId,
      connectedNodeName: nodeNames.get(connectedNodeId) || connectedNodeId
    };
  };

  return {
    outgoing: graph.edges
      .filter((edge) => edge.source_id === nodeId)
      .map((edge) => mapRoute(edge, 'outgoing')),
    incoming: graph.edges
      .filter((edge) => edge.target_id === nodeId)
      .map((edge) => mapRoute(edge, 'incoming'))
  };
}
