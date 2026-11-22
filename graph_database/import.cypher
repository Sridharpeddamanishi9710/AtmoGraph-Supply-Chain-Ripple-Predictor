// AtmoGraph - Neo4j import (Neo4j 5.x). Run top to bottom in Neo4j Browser or cypher-shell.
// Prerequisite: copy everything in data/ into Neo4j's `import` folder (Docker: mount it at /var/lib/neo4j/import).

// ---------- 1. Constraints (stable, unique IDs) ----------
CREATE CONSTRAINT supplier_id IF NOT EXISTS FOR (n:Supplier) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT manufacturer_id IF NOT EXISTS FOR (n:Manufacturer) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT port_id IF NOT EXISTS FOR (n:Port) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT distributor_id IF NOT EXISTS FOR (n:Distributor) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT event_id IF NOT EXISTS FOR (n:DisruptionEvent) REQUIRE n.id IS UNIQUE;

// ---------- 2. Nodes ----------
LOAD CSV WITH HEADERS FROM 'file:///nodes_suppliers.csv' AS row
MERGE (n:Supplier {id: row.id})
SET n.name = row.name, n.country = row.country, n.country_iso3 = row.country_iso3,
    n.lat = toFloat(row.lat), n.lon = toFloat(row.lon), n.primary_city = row.primary_city,
    n.sku_count = toInteger(row.sku_count), n.avg_defect_rate = toFloat(row.avg_defect_rate),
    n.avg_supplier_lead_time_days = toFloat(row.avg_supplier_lead_time_days),
    n.inspection_fail_share = toFloat(row.inspection_fail_share),
    n.geo_source = row.geo_source, n.source = row.source;

LOAD CSV WITH HEADERS FROM 'file:///nodes_manufacturers.csv' AS row
MERGE (n:Manufacturer {id: row.id})
SET n.name = row.name, n.country = row.country, n.country_iso3 = row.country_iso3,
    n.lat = toFloat(row.lat), n.lon = toFloat(row.lon), n.city = row.city,
    n.sku_count = toInteger(row.sku_count), n.production_volume = toInteger(row.production_volume),
    n.avg_manufacturing_lead_time_days = toFloat(row.avg_manufacturing_lead_time_days),
    n.avg_manufacturing_cost = toFloat(row.avg_manufacturing_cost),
    n.avg_defect_rate = toFloat(row.avg_defect_rate), n.source = row.source;

LOAD CSV WITH HEADERS FROM 'file:///nodes_ports.csv' AS row
MERGE (n:Port {id: row.id})
SET n.name = row.name, n.unlocode = row.unlocode, n.country = row.country, n.country_iso3 = row.country_iso3,
    n.lat = toFloat(row.lat), n.lon = toFloat(row.lon),
    n.hist_disruption_events = toInteger(row.hist_disruption_events),
    n.hist_avg_affected_days = toFloat(row.hist_avg_affected_days),
    n.hist_max_severity = toInteger(toFloat(row.hist_max_severity)),
    n.geo_source = row.geo_source, n.source = row.source;

LOAD CSV WITH HEADERS FROM 'file:///nodes_distributors.csv' AS row
MERGE (n:Distributor {id: row.id})
SET n.name = row.name, n.country = row.country, n.country_iso3 = row.country_iso3,
    n.lat = toFloat(row.lat), n.lon = toFloat(row.lon), n.geo_source = row.geo_source, n.source = row.source;

LOAD CSV WITH HEADERS FROM 'file:///nodes_disruption_events.csv' AS row
MERGE (n:DisruptionEvent {id: row.id})
SET n.name = row.name, n.year = toInteger(row.year), n.reduction_days = toInteger(row.reduction_days),
    n.shutdown_days = toInteger(row.shutdown_days), n.recovery_days = toInteger(row.recovery_days),
    n.total_affected_days = toInteger(row.total_affected_days), n.severity = toInteger(row.severity),
    n.status = row.status, n.source = row.source;

// ---------- 3. Relationships ----------
LOAD CSV WITH HEADERS FROM 'file:///edges_supplies_to.csv' AS row
MATCH (a:Supplier {id: row.start_id}), (b:Manufacturer {id: row.end_id})
MERGE (a)-[r:SUPPLIES_TO]->(b)
SET r.lead_time_days = toFloat(row.lead_time_days), r.volume = toFloat(row.volume),
    r.transport_mode = row.transport_mode, r.dependency_weight = toFloat(row.dependency_weight),
    r.n_skus = toInteger(row.n_skus), r.source = row.source;

LOAD CSV WITH HEADERS FROM 'file:///edges_ships_via.csv' AS row
MATCH (a:Manufacturer {id: row.start_id}), (b:Port {id: row.end_id})
MERGE (a)-[r:SHIPS_VIA]->(b)
SET r.lead_time_days = toFloat(row.lead_time_days), r.volume = toFloat(row.volume),
    r.transport_mode = row.transport_mode, r.csv_modal_mode = row.csv_modal_mode,
    r.dependency_weight = toFloat(row.dependency_weight), r.distance_km = toFloat(row.distance_km),
    r.source = row.source;

// ROUTE_TO is keyed by route_id because two ports can be linked by more than one route
LOAD CSV WITH HEADERS FROM 'file:///edges_route_to.csv' AS row
MATCH (a:Port {id: row.start_id}), (b:Port {id: row.end_id})
MERGE (a)-[r:ROUTE_TO {route_id: row.route_id}]->(b)
SET r.lead_time_days = toFloat(row.lead_time_days), r.volume = toFloat(row.volume),
    r.transport_mode = row.transport_mode, r.dependency_weight = toFloat(row.dependency_weight),
    r.distance_km = toFloat(row.distance_km), r.cargo_type = row.cargo_type,
    r.avg_delay_days = toFloat(row.avg_delay_days), r.avg_freight_cost_usd = toFloat(row.avg_freight_cost_usd),
    r.disruption_rate = toFloat(row.disruption_rate), r.delayed_rate = toFloat(row.delayed_rate),
    r.avg_port_congestion = toFloat(row.avg_port_congestion), r.source = row.source;

LOAD CSV WITH HEADERS FROM 'file:///edges_delivers_to.csv' AS row
MATCH (a:Port {id: row.start_id}), (b:Distributor {id: row.end_id})
MERGE (a)-[r:DELIVERS_TO]->(b)
SET r.lead_time_days = toFloat(row.lead_time_days), r.volume = toFloat(row.volume),
    r.transport_mode = row.transport_mode, r.dependency_weight = toFloat(row.dependency_weight),
    r.source = row.source;

LOAD CSV WITH HEADERS FROM 'file:///edges_had_disruption.csv' AS row
MATCH (a:Port {id: row.start_id}), (b:DisruptionEvent {id: row.end_id})
MERGE (a)-[r:HAD_DISRUPTION]->(b)
SET r.source = row.source;

// ---------- 4. Sanity check: expect 45 nodes, 108 relationships ----------
MATCH (n) WITH count(n) AS nodes MATCH ()-[r]->() RETURN nodes, count(r) AS relationships;
