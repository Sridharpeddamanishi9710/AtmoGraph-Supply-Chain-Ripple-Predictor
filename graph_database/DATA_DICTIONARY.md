# AtmoGraph data dictionary

`source` values: **derived** = computed from a source file · **simulated** = assigned by `build_graph_data.py` (not observed) · **real** = copied from the Port Disruption Database · **reference** = hand-entered reference data (verify).
Every node has `id`, `name`, `country`, `lat`, `lon` (DisruptionEvent excepted), as agreed in the team plan.

## Nodes

### Supplier (`SUP_001` … `SUP_005`) — `nodes_suppliers.csv`, from `supply_chain_data.csv`
| Field | Meaning |
|---|---|
| id, name | Stable ID; name as in source ("Supplier 1") |
| country, country_iso3 | Always India (the CSV only lists Indian cities) |
| lat, lon, primary_city | Coordinates of the city where the supplier has the most rows (ties broken alphabetically). `geo_source=derived_modal_city`; the CSV gives no real supplier address |
| sku_count | SKUs supplied |
| avg_defect_rate | Mean of `Defect rates` (%) |
| avg_supplier_lead_time_days | Mean of `Lead time` |
| inspection_fail_share | Share of SKUs with `Inspection results = Fail` |

### Manufacturer (`MFG_MUM`, `MFG_DEL`, `MFG_BLR`, `MFG_MAA`, `MFG_CCU`) — `nodes_manufacturers.csv`
One hub per `Location` city in the CSV. **This is an interpretation**: the CSV has no manufacturer column, so each city is treated as a manufacturing hub.
| Field | Meaning |
|---|---|
| city | Source `Location` |
| sku_count | SKUs handled in that city |
| production_volume | Sum of `Production volumes` |
| avg_manufacturing_lead_time_days | Mean `Manufacturing lead time` |
| avg_manufacturing_cost | Mean `Manufacturing costs` |
| avg_defect_rate | Mean `Defect rates` |

### Port (`PORT_<UN/LOCODE>`, e.g. `PORT_INNSA`) — `nodes_ports.csv`
13 ports: 4 Indian (Nhava Sheva, Mundra, Chennai, Kolkata) + one gateway port for each of the 9 other countries in `trade_routes.csv`.
| Field | Meaning |
|---|---|
| unlocode | UN/LOCODE (hand-entered, verify) |
| lat, lon | Approximate, typed by hand. `geo_source=approximate_manual`. Replace with NGA World Port Index values |
| hist_disruption_events | Count of real events for this port in the Port Disruption Database (0 if the port is not in it) |
| hist_avg_affected_days | Mean `total_affected_days` of those events (null if none) |
| hist_max_severity | Max severity 0–3 (see DisruptionEvent) |

### Distributor (`DIST_<ISO3>_01`) — `nodes_distributors.csv`
One per country (10). **Simulated**: no source file contains distributors. Coordinates are the country's gateway port (`geo_source=port_location_proxy`).

### DisruptionEvent (`EVT_001` …) — `nodes_disruption_events.csv`
Real records from `Port-disruption-database.xlsx`, only for the 4 ports that exist in both that file and this graph (Shanghai, Tokyo, New York/New Jersey, Brisbane).
| Field | Meaning |
|---|---|
| name, year | Event (e.g. Typhoon Lekima) and year |
| reduction_days, shutdown_days, recovery_days | Days of reduced operation, full shutdown, recovery |
| total_affected_days | Sum of the three |
| severity | 0 = no clear impact, 1 = 0–40 %, 2 = 40–80 %, 3 = 80–100 % loss of normal operations |
| status | `historical` (this file) or `active` (new events written by `mark_disruption`) |

The workbook's `Date` column is unreliable (many cells show year 2019 or text such as "March"), so only `Year` is kept.

## Relationships (all carry `lead_time_days`, `volume`, `transport_mode`, `dependency_weight` unless noted)

| Type | From → To | File | How values are built |
|---|---|---|---|
| SUPPLIES_TO | Supplier → Manufacturer | `edges_supplies_to.csv` | **derived**. 25 edges (every supplier appears in every city). lead_time_days = mean `Lead time`; volume = sum `Order quantities`; transport_mode = most common `Transportation modes`; dependency_weight = this supplier's share of the manufacturer's order volume (sums to 1 per manufacturer); n_skus |
| SHIPS_VIA | Manufacturer → Port | `edges_ships_via.csv` | **simulated assignment** (the CSV has no ports): each hub is linked to the 1–2 nearest major Indian ports. lead_time_days = mean `Shipping times` for that city; volume = city order volume × dependency_weight; dependency_weight = assumed share (e.g. Mumbai 0.7 Nhava Sheva / 0.3 Mundra); transport_mode = Road if < 1,500 km else Rail; csv_modal_mode = most common CSV mode, kept for reference; distance_km = great-circle |
| ROUTE_TO | Port → Port | `edges_route_to.csv` | **derived**, 50 edges, one per `route_id` in `trade_routes.csv`. Country-level routes are mapped onto gateway ports (India routes are spread over the 4 Indian ports: simulated). lead_time_days = `estimated_transit_days`; transport_mode = `shipping_method`; volume = mean weekly `trade_volume_tonnes`; dependency_weight = route's share of its origin port's outgoing volume; plus distance_km, cargo_type, avg_delay_days, avg_freight_cost_usd, disruption_rate (share of weeks with status Disrupted), delayed_rate, avg_port_congestion (from `weekly_route_operations.csv`, 2015-2026) |
| DELIVERS_TO | Port → Distributor | `edges_delivers_to.csv` | **simulated**: lead time 3 days (2 for India), Road; volume = total inbound ROUTE_TO volume of that port; dependency_weight = port's share of the distributor's inbound volume. A port with no inbound routes (e.g. `PORT_INNSA`) gets no DELIVERS_TO edge |
| HAD_DISRUPTION | Port → DisruptionEvent | `edges_had_disruption.csv` | **real** (Port Disruption Database); only property is `source` |

Multiple ROUTE_TO edges can connect the same two ports (different `route_id`), so ROUTE_TO is a multigraph.
