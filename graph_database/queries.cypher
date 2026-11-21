// AtmoGraph - example queries. Replace the IDs in curly braces / quotes as needed.

// Q1. Graph overview: how many nodes per label
MATCH (n) RETURN labels(n)[0] AS label, count(*) AS nodes ORDER BY nodes DESC;

// Q2. Everything downstream of a disrupted port (up to 4 hops), with hop count
MATCH p=(s:Port {id:'PORT_INNSA'})-[:SUPPLIES_TO|SHIPS_VIA|ROUTE_TO|DELIVERS_TO*1..4]->(d)
WHERE d <> s
RETURN d.id AS id, d.name AS name, labels(d)[0] AS type, min(length(p)) AS hops ORDER BY hops, id;

// Q3. Everything upstream of a distributor
MATCH p=(u)-[:SUPPLIES_TO|SHIPS_VIA|ROUTE_TO|DELIVERS_TO*1..4]->(t:Distributor {id:'DIST_USA_01'})
WHERE u <> t
RETURN u.id AS id, labels(u)[0] AS type, min(length(p)) AS hops ORDER BY hops, id;

// Q4. Paths from a supplier to a distributor with total lead time
MATCH p=(a:Supplier {id:'SUP_001'})-[:SUPPLIES_TO|SHIPS_VIA|ROUTE_TO|DELIVERS_TO*1..5]->(b:Distributor {id:'DIST_USA_01'})
RETURN [n IN nodes(p) | n.id] AS path,
       reduce(t=0.0, r IN relationships(p) | t + coalesce(r.lead_time_days,0)) AS total_lead_time_days
ORDER BY length(p), total_lead_time_days LIMIT 5;

// Q5. Which manufacturers depend most on a port (dependency_weight)
MATCH (m:Manufacturer)-[r:SHIPS_VIA]->(p:Port {id:'PORT_INNSA'})
RETURN m.id, m.name, r.dependency_weight, r.volume ORDER BY r.dependency_weight DESC;

// Q6. Outgoing routes from a port with GNN edge features
MATCH (a:Port {id:'PORT_INNSA'})-[r:ROUTE_TO]->(b:Port)
RETURN r.route_id, b.id, r.lead_time_days, r.volume, r.transport_mode, r.dependency_weight, r.avg_delay_days;

// Q7. Ports with real historical disruption records (from the Port Disruption Database)
MATCH (p:Port)-[:HAD_DISRUPTION]->(e:DisruptionEvent)
RETURN p.id, p.name, count(e) AS events, avg(e.total_affected_days) AS avg_days, max(e.severity) AS max_severity
ORDER BY events DESC;

// Q8. Mark a new disruption on a port (what Sneha's pipeline will call)
MATCH (p:Port {id:'PORT_INNSA'})
CREATE (e:DisruptionEvent {id:'EVT_NEWS_001', name:'Port strike', severity:2, status:'active', source:'news_nlp'})
CREATE (p)-[:HAD_DISRUPTION]->(e);

// Q9. Ports with no or few alternatives for a given factory (single-point-of-failure check)
MATCH (m:Manufacturer)-[:SHIPS_VIA]->(p:Port)
WITH m, count(p) AS port_count WHERE port_count = 1 RETURN m.id, m.name;
