"""
Access functions for the AtmoGraph Neo4j graph (this is the 'documented way to query the graph' handoff).

    from graph_queries import SupplyChainGraph
    g = SupplyChainGraph("bolt://localhost:7687", "neo4j", "<password>")
    g.downstream("PORT_INNSA", max_hops=4)      # everything a disruption at this port can reach
    g.upstream("DIST_USA_01")                   # everything that feeds this distributor
    g.subgraph("PORT_INNSA", hops=2)            # nodes + edges as JSON-ready dicts (for the frontend)
"""
from neo4j import GraphDatabase

SUPPLY_RELS = "SUPPLIES_TO|SHIPS_VIA|ROUTE_TO|DELIVERS_TO"   # excludes HAD_DISRUPTION so events are not 'downstream'
MAX_HOPS_CAP = 6   # route cycles exist; keep traversals bounded


def _hops(n):
    n = int(n)
    if not 1 <= n <= MAX_HOPS_CAP:
        raise ValueError(f"max_hops must be between 1 and {MAX_HOPS_CAP}")
    return n   # Cypher does not allow parameters in *1..N bounds, so we validate then inline an int


class SupplyChainGraph:
    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password=""):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def _run(self, cypher, **params):
        with self.driver.session() as s:
            return [r.data() for r in s.run(cypher, **params)]

    def get_node(self, node_id):
        rows = self._run("MATCH (n {id:$id}) RETURN labels(n)[0] AS type, properties(n) AS props", id=node_id)
        return rows[0] if rows else None

    def downstream(self, node_id, max_hops=4):
        """All nodes reachable FROM node_id along the supply direction, with the shortest hop count."""
        h = _hops(max_hops)
        return self._run(
            f"MATCH p=(s {{id:$id}})-[:{SUPPLY_RELS}*1..{h}]->(d) "
            "WHERE d <> s RETURN d.id AS id, d.name AS name, labels(d)[0] AS type, min(length(p)) AS hops "
            "ORDER BY hops, id", id=node_id)

    def upstream(self, node_id, max_hops=4):
        """All nodes that feed INTO node_id."""
        h = _hops(max_hops)
        return self._run(
            f"MATCH p=(u)-[:{SUPPLY_RELS}*1..{h}]->(t {{id:$id}}) "
            "WHERE u <> t RETURN u.id AS id, u.name AS name, labels(u)[0] AS type, min(length(p)) AS hops "
            "ORDER BY hops, id", id=node_id)

    def paths(self, from_id, to_id, max_hops=5, limit=10):
        """Shortest-first paths between two nodes, with each hop's lead time."""
        h = _hops(max_hops)
        return self._run(
            f"MATCH p=(a {{id:$a}})-[:{SUPPLY_RELS}*1..{h}]->(b {{id:$b}}) "
            "RETURN [n IN nodes(p) | n.id] AS node_ids, [r IN relationships(p) | type(r)] AS rel_types, "
            "reduce(t=0.0, r IN relationships(p) | t + coalesce(r.lead_time_days,0)) AS total_lead_time_days "
            "ORDER BY length(p), total_lead_time_days LIMIT $limit", a=from_id, b=to_id, limit=int(limit))

    def port_exposure(self, port_id):
        """Who depends on a port: upstream manufacturers/suppliers and downstream distributors, with weights."""
        return self._run(
            "MATCH (p:Port {id:$id}) "
            "OPTIONAL MATCH (m:Manufacturer)-[sv:SHIPS_VIA]->(p) "
            "OPTIONAL MATCH (p)-[dl:DELIVERS_TO]->(d:Distributor) "
            "RETURN p.id AS port, collect(DISTINCT {manufacturer:m.id, weight:sv.dependency_weight, volume:sv.volume}) AS manufacturers, "
            "collect(DISTINCT {distributor:d.id, volume:dl.volume}) AS distributors", id=port_id)

    def subgraph(self, center_id, hops=2):
        """Nodes and relationships within `hops` of a node (either direction) - ready for D3 / React Flow."""
        h = _hops(hops)
        rows = self._run(
            f"MATCH p=(c {{id:$id}})-[:{SUPPLY_RELS}*0..{h}]-(x) "
            "WITH collect(DISTINCT x) AS ns "
            f"MATCH (a)-[r:{SUPPLY_RELS}]->(b) WHERE a IN ns AND b IN ns "
            "WITH ns, collect(r) AS rs "
            "RETURN [n IN ns | {id:n.id, type:labels(n)[0], name:n.name, lat:n.lat, lon:n.lon}] AS nodes, "
            "[r IN rs | {source:startNode(r).id, target:endNode(r).id, type:type(r), "
            "lead_time_days:r.lead_time_days, volume:r.volume, transport_mode:r.transport_mode, "
            "dependency_weight:r.dependency_weight}] AS edges", id=center_id)
        return rows[0] if rows else {"nodes": [], "edges": []}

    def mark_disruption(self, port_id, event_name, severity, status="active", source="news_nlp", event_id=None):
        """Handoff point for Sneha's NLP output: attach a disruption event to a canonical Port ID."""
        return self._run(
            "MATCH (p:Port {id:$pid}) "
            "MERGE (e:DisruptionEvent {id: coalesce($eid, 'EVT_' + toString(timestamp()))}) "
            "SET e.name=$name, e.severity=$sev, e.status=$status, e.source=$src "
            "MERGE (p)-[:HAD_DISRUPTION]->(e) RETURN e.id AS event_id",
            pid=port_id, eid=event_id, name=event_name, sev=int(severity), status=status, src=source)

    def edge_features(self):
        """Flat edge table with the four agreed GNN features (for Sridhar)."""
        return self._run(
            f"MATCH (a)-[r:{SUPPLY_RELS}]->(b) "
            "RETURN a.id AS source, b.id AS target, type(r) AS rel_type, r.lead_time_days AS lead_time_days, "
            "r.volume AS volume, r.transport_mode AS transport_mode, r.dependency_weight AS dependency_weight")

    def node_features(self):
        """Flat node table (id, type, name, country, lat, lon, plus every numeric feature) for Sridhar."""
        return self._run(
            "MATCH (n) WHERE NOT n:DisruptionEvent RETURN n.id AS id, labels(n)[0] AS type, properties(n) AS props")
