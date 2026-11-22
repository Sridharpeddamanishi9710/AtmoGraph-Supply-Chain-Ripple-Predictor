"""
AtmoGraph - build graph CSVs from the three source datasets.
Run:  python build_graph_data.py
Reads  raw_inputs/   Writes data/ (nodes_*.csv, edges_*.csv) and graph_export.json

Every row carries `source`:
  derived    = computed directly from a source file
  simulated  = assigned/invented by this script (clearly labelled, per team plan)
  real       = copied from the Port Disruption Database
  reference  = hand-entered reference data (verify against UN/LOCODE + NGA WPI)
"""
import json, math
import pandas as pd

RAW, OUT = "raw_inputs/", "data/"

# ---------- reference tables (hand-entered; verify against UN/LOCODE + NGA WPI) ----------
CITIES = {  # city: (code, lat, lon)
    "Mumbai": ("MUM", 19.0760, 72.8777), "Delhi": ("DEL", 28.6139, 77.2090),
    "Bangalore": ("BLR", 12.9716, 77.5946), "Chennai": ("MAA", 13.0827, 80.2707),
    "Kolkata": ("CCU", 22.5726, 88.3639)}

PORTS = {  # LOCODE: (name, country, iso3, lat, lon, name used in Port Disruption DB or None)
    "INNSA": ("Nhava Sheva (JNPT)", "India", "IND", 18.95, 72.95, None),
    "INMUN": ("Mundra", "India", "IND", 22.74, 69.70, None),
    "INMAA": ("Chennai", "India", "IND", 13.09, 80.29, None),
    "INCCU": ("Kolkata", "India", "IND", 22.54, 88.33, None),
    "CNSHA": ("Shanghai", "China", "CHN", 31.23, 121.47, "Shanghai"),
    "USNYC": ("Port of New York and New Jersey", "United States", "USA", 40.68, -74.15,
              "Port of New York and New Jersey"),
    "JPTYO": ("Tokyo", "Japan", "JPN", 35.62, 139.79, "Tokyo area"),
    "DEHAM": ("Hamburg", "Germany", "DEU", 53.54, 9.97, None),
    "GBFXT": ("Felixstowe", "United Kingdom", "GBR", 51.96, 1.35, None),
    "FRLEH": ("Le Havre", "France", "FRA", 49.48, 0.11, None),
    "BRSSZ": ("Santos", "Brazil", "BRA", -23.96, -46.30, None),
    "CAVAN": ("Vancouver", "Canada", "CAN", 49.29, -123.11, None),
    "AUBNE": ("Brisbane", "Australia", "AUS", -27.38, 153.17, "Port Brisbane"),
}
GATEWAY = {"China": "CNSHA", "United States": "USNYC", "Japan": "JPTYO", "Germany": "DEHAM",
           "United Kingdom": "GBFXT", "France": "FRLEH", "Brazil": "BRSSZ", "Canada": "CAVAN",
           "Australia": "AUBNE"}
INDIA_PORTS = ["INNSA", "INMUN", "INMAA", "INCCU"]
ISO3 = {v[1]: v[2] for v in PORTS.values()}

# manufacturer city -> [(port, share)]  (SIMULATED nearest-major-port assignment)
CITY_PORTS = {"Mumbai": [("INNSA", .7), ("INMUN", .3)], "Delhi": [("INMUN", .6), ("INNSA", .4)],
              "Bangalore": [("INMAA", .6), ("INNSA", .4)], "Chennai": [("INMAA", 1.0)],
              "Kolkata": [("INCCU", .8), ("INMAA", .2)]}


def hav(a, b, c, d):
    r = 6371
    p1, p2 = math.radians(a), math.radians(c)
    x = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(d - b) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(x))


def mode_of(s):
    """Most frequent value; ties broken alphabetically (deterministic)."""
    vc = s.value_counts()
    return sorted(vc[vc == vc.max()].index)[0]


sc = pd.read_csv(RAW + "supply_chain_data.csv")
tr = pd.read_csv(RAW + "trade_routes.csv")
wk = pd.read_csv(RAW + "weekly_route_operations.csv")
db = pd.read_excel(RAW + "Port-disruption-database.xlsx")

# ---------- Suppliers ----------
sup_names = sorted(sc["Supplier name"].unique())
sup_id = {n: f"SUP_{i + 1:03d}" for i, n in enumerate(sup_names)}
rows = []
for n in sup_names:
    d = sc[sc["Supplier name"] == n]
    city = mode_of(d["Location"])
    rows.append(dict(id=sup_id[n], name=n, country="India", country_iso3="IND",
                     lat=CITIES[city][1], lon=CITIES[city][2], primary_city=city,
                     sku_count=len(d), avg_defect_rate=round(d["Defect rates"].mean(), 3),
                     avg_supplier_lead_time_days=round(d["Lead time"].mean(), 2),
                     inspection_fail_share=round((d["Inspection results"] == "Fail").mean(), 3),
                     geo_source="derived_modal_city", source="derived"))
sup = pd.DataFrame(rows)

# ---------- Manufacturers (one hub per city in the supplier CSV) ----------
rows = []
for city, (code, la, lo) in CITIES.items():
    d = sc[sc["Location"] == city]
    rows.append(dict(id=f"MFG_{code}", name=f"{city} Manufacturing Hub", country="India", country_iso3="IND",
                     lat=la, lon=lo, city=city, sku_count=len(d),
                     production_volume=int(d["Production volumes"].sum()),
                     avg_manufacturing_lead_time_days=round(d["Manufacturing lead time"].mean(), 2),
                     avg_manufacturing_cost=round(d["Manufacturing costs"].mean(), 2),
                     avg_defect_rate=round(d["Defect rates"].mean(), 3), source="derived"))
mfg = pd.DataFrame(rows)
mfg_id = {c: f"MFG_{v[0]}" for c, v in CITIES.items()}

# ---------- SUPPLIES_TO (Supplier -> Manufacturer) ----------
g = sc.groupby(["Supplier name", "Location"]).agg(
    lead_time_days=("Lead time", "mean"), volume=("Order quantities", "sum"),
    transport_mode=("Transportation modes", mode_of), n_skus=("SKU", "count")).reset_index()
g["dependency_weight"] = g["volume"] / g.groupby("Location")["volume"].transform("sum")
supplies = pd.DataFrame(dict(
    start_id=g["Supplier name"].map(sup_id), end_id=g["Location"].map(mfg_id),
    lead_time_days=g["lead_time_days"].round(2), volume=g["volume"], transport_mode=g["transport_mode"],
    dependency_weight=g["dependency_weight"].round(4), n_skus=g["n_skus"], source="derived"))

# ---------- Ports ----------
rows = []
for code, (nm, ctry, iso, la, lo, dbname) in PORTS.items():
    h = db[db["port_name"] == dbname] if dbname else db.iloc[0:0]
    rows.append(dict(id=f"PORT_{code}", name=nm, unlocode=code, country=ctry, country_iso3=iso, lat=la, lon=lo,
                     hist_disruption_events=len(h),
                     hist_avg_affected_days=round(h["total_affected_days"].mean(), 2) if len(h) else None,
                     hist_max_severity=int(h["severity"].max()) if len(h) else None,
                     geo_source="approximate_manual", source="derived" if len(h) else "reference"))
ports = pd.DataFrame(rows)

# ---------- SHIPS_VIA (Manufacturer -> Port)  [port assignment SIMULATED, numbers derived] ----------
rows = []
for city, plist in CITY_PORTS.items():
    d = sc[sc["Location"] == city]
    mode = mode_of(d["Transportation modes"])
    for pcode, share in plist:
        p = PORTS[pcode]
        dist_km = round(hav(CITIES[city][1], CITIES[city][2], p[3], p[4]), 1)
        rows.append(dict(start_id=mfg_id[city], end_id=f"PORT_{pcode}",
                         lead_time_days=round(d["Shipping times"].mean(), 2),
                         volume=int(round(d["Order quantities"].sum() * share)),
                         transport_mode="Road" if dist_km < 1500 else "Rail",  # SIMULATED: factory->port is overland
                         csv_modal_mode=mode,  # most common mode in supply_chain_data.csv for this city (kept for reference)
                         dependency_weight=share, distance_km=dist_km, source="simulated"))
ships = pd.DataFrame(rows)

# ---------- ROUTE_TO (Port -> Port) from trade_routes + weekly_route_operations ----------
agg = wk.groupby("route_id").agg(
    avg_delay_days=("shipping_delay_days", "mean"), avg_freight_cost_usd=("freight_cost_usd", "mean"),
    volume=("trade_volume_tonnes", "mean"),
    disruption_rate=("route_status", lambda s: (s == "Disrupted").mean()),
    delayed_rate=("route_status", lambda s: (s == "Delayed").mean()),
    avg_port_congestion=("port_congestion_index", "mean")).round(3).reset_index()
r = tr.merge(agg, on="route_id")
rr, i_idx = [], 0
for _, x in r.iterrows():
    if x.origin_country == "India":
        o = INDIA_PORTS[i_idx % 4]; i_idx += 1       # SIMULATED: spread India routes over 4 ports
    else:
        o = GATEWAY[x.origin_country]
    if x.destination_country == "India":
        d = INDIA_PORTS[i_idx % 4]; i_idx += 1
    else:
        d = GATEWAY[x.destination_country]
    rr.append(dict(start_id=f"PORT_{o}", end_id=f"PORT_{d}", route_id=x.route_id,
                   lead_time_days=x.estimated_transit_days, volume=x.volume, transport_mode=x.shipping_method,
                   distance_km=x.distance_km, cargo_type=x.trade_route_type,
                   avg_delay_days=x.avg_delay_days, avg_freight_cost_usd=x.avg_freight_cost_usd,
                   disruption_rate=x.disruption_rate, delayed_rate=x.delayed_rate,
                   avg_port_congestion=x.avg_port_congestion,
                   source="derived (country route mapped to gateway ports = simulated)"))
route = pd.DataFrame(rr)
route["dependency_weight"] = (route["volume"] / route.groupby("start_id")["volume"].transform("sum")).round(4)

# ---------- Distributors (one per country, SIMULATED) + DELIVERS_TO ----------
dist_rows, del_rows = [], []
for ctry, pcode in {**GATEWAY, "India": "INNSA"}.items():
    iso = ISO3[ctry]
    did = f"DIST_{iso}_01"
    p = PORTS[pcode]
    dist_rows.append(dict(id=did, name=f"{ctry} Distribution Centre", country=ctry, country_iso3=iso,
                          lat=p[3], lon=p[4], geo_source="port_location_proxy", source="simulated"))
    plist = INDIA_PORTS if ctry == "India" else [pcode]
    # volume = inbound ROUTE_TO volume at the port; a port with no inbound volume gets NO edge
    # (fix: PORT_INNSA has no inbound routes, so it previously got volume 0 with weight 0.25)
    vols = {c: route.loc[route.end_id == f"PORT_{c}", "volume"].sum() for c in plist}
    vols = {c: v for c, v in vols.items() if v > 0}
    total = sum(vols.values())
    for c, vol in vols.items():
        del_rows.append(dict(start_id=f"PORT_{c}", end_id=did, lead_time_days=2 if ctry == "India" else 3,
                             volume=round(vol, 2), transport_mode="Road",
                             dependency_weight=round(vol / total, 4), source="simulated"))
dist = pd.DataFrame(dist_rows)
deliv = pd.DataFrame(del_rows)

# ---------- Disruption events (real, from Port Disruption DB) for matched ports ----------
ev = []
for code, spec in PORTS.items():
    dbname = spec[5]
    if not dbname:
        continue
    for _, h in db[db["port_name"] == dbname].iterrows():
        ev.append(dict(port_id=f"PORT_{code}", name=h["Event"], year=int(h["Year"]),
                       reduction_days=int(h["reduction"]), shutdown_days=int(h["shutdown"]),
                       recovery_days=int(h["recovery"]), total_affected_days=int(h["total_affected_days"]),
                       severity=int(h["severity"])))
ev = pd.DataFrame(ev)
ev.insert(0, "id", [f"EVT_{i + 1:03d}" for i in range(len(ev))])
ev["source"] = "real (Port Disruption DB)"
ev["status"] = "historical"
had = ev[["port_id", "id"]].rename(columns={"port_id": "start_id", "id": "end_id"})
had["source"] = "real (Port Disruption DB)"
ev_nodes = ev.drop(columns=["port_id"])

# ---------- write ----------
tables = dict(nodes_suppliers=sup, nodes_manufacturers=mfg, nodes_ports=ports, nodes_distributors=dist,
              nodes_disruption_events=ev_nodes, edges_supplies_to=supplies, edges_ships_via=ships,
              edges_route_to=route, edges_delivers_to=deliv, edges_had_disruption=had)
for name, df in tables.items():
    df.to_csv(OUT + name + ".csv", index=False)
    print(f"{name:26s} {len(df):4d} rows")


def recs(df):
    return json.loads(df.to_json(orient="records"))


json.dump(dict(
    nodes=dict(Supplier=recs(sup), Manufacturer=recs(mfg), Port=recs(ports), Distributor=recs(dist),
               DisruptionEvent=recs(ev_nodes)),
    edges=dict(SUPPLIES_TO=recs(supplies), SHIPS_VIA=recs(ships), ROUTE_TO=recs(route),
               DELIVERS_TO=recs(deliv), HAD_DISRUPTION=recs(had))),
    open("graph_export.json", "w"), indent=1)
