# AtmoGraph: Supply-chain graph (Krish)

Handoff package for step 1 of the team plan: a Neo4j graph with stable IDs and typed relationships.

```
(Supplier)-[:SUPPLIES_TO]->(Manufacturer)-[:SHIPS_VIA]->(Port)-[:ROUTE_TO]->(Port)-[:DELIVERS_TO]->(Distributor)
                                                          \-[:HAD_DISRUPTION]->(DisruptionEvent)
```

| Size | Count |
|---|---|
| Nodes | 45 (5 suppliers, 5 manufacturers, 13 ports, 10 distributors, 12 disruption events) |
| Relationships | 108 (25 SUPPLIES_TO, 9 SHIPS_VIA, 50 ROUTE_TO, 12 DELIVERS_TO, 12 HAD_DISRUPTION) |

## What is in this folder

| File | Purpose |
|---|---|
| `data/nodes_*.csv`, `data/edges_*.csv` | The sample graph (CSV) |
| `graph_export.json` | Same graph as JSON (for Vedant's frontend and Sridhar's notebooks, no Neo4j needed) |
| `import.cypher` | Constraints + `LOAD CSV` import |
| `load_graph.py` | Same import using the Python driver |
| `graph_queries.py`, `queries.cypher` | Documented access functions and example queries |
| `build_graph_data.py` + `raw_inputs/` | Rebuilds `data/` from your three source datasets |
| `DATA_DICTIONARY.md` | Every field explained and how it was built |

## Step by step

**Step 1: Start Neo4j (5.x).** Docker is easiest. Run it from this folder:
```bash
docker run -d --name atmograph -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/atmograph123 -v "$PWD/data":/var/lib/neo4j/import neo4j:5
```
Neo4j Desktop also works: copy `data/*.csv` into the database's `import` folder.

**Step 2: Import.** Open http://localhost:7474, log in, and paste `import.cypher` (run each statement). Or run
`pip install neo4j pandas` then `python load_graph.py --password atmograph123 --wipe`.

**Step 3: Verify.** The last query in `import.cypher` should return **45 nodes, 108 relationships**. Then run `MATCH (n) RETURN n LIMIT 100` to see the graph.

**Step 4: Try the queries** in `queries.cypher`. Sanity checks from an in-memory copy of the same data:
- Downstream of `PORT_INNSA` within 4 hops: **22 nodes** (12 ports, 10 distributors)
- Upstream of `DIST_USA_01` within 4 hops: **22 nodes**
- Shortest chain: `SUP_001 → MFG_MUM → PORT_INNSA → PORT_USNYC → DIST_USA_01`

**Step 5: Hand off.**
| To | Give them | What they need |
|---|---|---|
| Sneha | `nodes_ports.csv` (+ other node files) | Match text like "Nhava Sheva port" to `PORT_INNSA` via `name`/`unlocode`; write events back with `mark_disruption()` |
| Sridhar | `graph_export.json` or `edge_features()` / `node_features()` | The four edge features and node features |
| Vedant | `graph_export.json` or `subgraph()` | Nodes with `lat`/`lon`, edges with `type` |

## ID conventions (never change once shared)

| Label | Pattern | Examples |
|---|---|---|
| Supplier | `SUP_###` | `SUP_001` |
| Manufacturer | `MFG_<city code>` | `MFG_MUM` |
| Port | `PORT_<UN/LOCODE>` | `PORT_INNSA` |
| Distributor | `DIST_<ISO3>_##` | `DIST_USA_01` |
| DisruptionEvent | `EVT_###` | `EVT_001` |

## Querying (Python)
```python
from graph_queries import SupplyChainGraph
g = SupplyChainGraph("bolt://localhost:7687", "neo4j", "atmograph123")
g.downstream("PORT_INNSA", max_hops=4)
g.upstream("DIST_USA_01")
g.paths("SUP_001", "DIST_USA_01")
g.port_exposure("PORT_INNSA")
g.subgraph("PORT_INNSA", hops=2)
g.mark_disruption("PORT_INNSA", "Port strike", severity=2)
```
Traversals are capped at 6 hops, because the route layer contains cycles.

## Read this before presenting the data

1. **Two of your three datasets look synthetic.** `Global-Supply-Chain-Disruption-Dataset` has weekly data running to 27 Dec 2026 (future dates), lists the US as "Low income" and India as "High income", and has rail and road routes between India and the US. `supply_chain_data.csv` has generic names ("Supplier 1", "Route A"). Only the Port Disruption Database is real observed data. Describe the graph as a **prototype on public sample data**, as the team plan requires.
2. **What is simulated** (tagged in the `source` column): the factory-to-port links (`SHIPS_VIA`), the mapping of country routes to specific ports, all distributors and `DELIVERS_TO`, and port coordinates. `Manufacturer` nodes are an interpretation of the `Location` column.
3. **Weak signal in route features.** Average delay per route is almost identical (6.2 to 6.6 days) and disruption rates are 2 to 5 %, so Sridhar should use the raw weekly time series in `weekly_route_operations.csv` instead of relying on these averages.
4. **Dense route layer.** 50 routes among 13 ports means a disruption at almost any port reaches most of the network within 4 hops. Use `dependency_weight` to rank impact, not just reachability.
5. **Disruption coverage is thin.** The Port Disruption Database has mostly US, Australian, Japanese and Chinese ports and none from India, so only 4 ports in this graph have history.
6. **Port IDs and coordinates were typed by hand.** Verify them against UN/LOCODE and the NGA World Port Index before the final report.
7. **Not tested against a live Neo4j.** The CSVs were validated with pandas and networkx (no duplicate IDs, no dangling edges, weights sum to 1). The Cypher and Python loader were not run against a database, so report any error you hit.
8. `SupplyGraph` was not among your uploads, so it is not in this graph. It can be added later as Product and Plant nodes.

> Note: raw_inputs/ is not committed (third-party datasets). To rebuild data/, put the three source files in graph_database/raw_inputs/ and run build_graph_data.py. The committed data/ folder is enough to load the graph.

## Change log
- **v2:** removed the zero-volume `PORT_INNSA -> DIST_IND_01` DELIVERS_TO edge (Nhava Sheva has no inbound routes in the data). DELIVERS_TO `dependency_weight` is now proportional to inbound route volume (India: Mundra 0.2932, Chennai 0.3395, Kolkata 0.3673). Totals are now 108 relationships; `PORT_INNSA` still reaches 22 nodes within 4 hops (`DIST_IND_01` is now 3 hops away instead of 1).
