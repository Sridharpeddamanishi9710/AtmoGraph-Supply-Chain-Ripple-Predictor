"""
Load the CSVs in data/ into Neo4j with the official Python driver (alternative to import.cypher).
    pip install neo4j pandas
    python load_graph.py --uri bolt://localhost:7687 --user neo4j --password <pw> [--wipe]
"""
import argparse, math
import pandas as pd
from neo4j import GraphDatabase

NODES = {"Supplier": "nodes_suppliers", "Manufacturer": "nodes_manufacturers", "Port": "nodes_ports",
         "Distributor": "nodes_distributors", "DisruptionEvent": "nodes_disruption_events"}
# rel type: (csv, start label, end label, merge key property or None)
EDGES = {"SUPPLIES_TO": ("edges_supplies_to", "Supplier", "Manufacturer", None),
         "SHIPS_VIA": ("edges_ships_via", "Manufacturer", "Port", None),
         "ROUTE_TO": ("edges_route_to", "Port", "Port", "route_id"),
         "DELIVERS_TO": ("edges_delivers_to", "Port", "Distributor", None),
         "HAD_DISRUPTION": ("edges_had_disruption", "Port", "DisruptionEvent", None)}


def clean(v):
    if isinstance(v, float) and math.isnan(v):
        return None
    return v.item() if hasattr(v, "item") else v


def records(df):
    return [{k: clean(v) for k, v in r.items()} for r in df.to_dict("records")]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--uri", default="bolt://localhost:7687")
    ap.add_argument("--user", default="neo4j")
    ap.add_argument("--password", required=True)
    ap.add_argument("--data", default="data/")
    ap.add_argument("--wipe", action="store_true", help="delete all existing nodes first")
    a = ap.parse_args()
    driver = GraphDatabase.driver(a.uri, auth=(a.user, a.password))
    with driver.session() as s:
        if a.wipe:
            s.run("MATCH (n) DETACH DELETE n")
        for label in NODES:
            s.run(f"CREATE CONSTRAINT {label.lower()}_id IF NOT EXISTS FOR (n:{label}) REQUIRE n.id IS UNIQUE")
        for label, f in NODES.items():
            rows = records(pd.read_csv(f"{a.data}{f}.csv"))
            s.run(f"UNWIND $rows AS row MERGE (n:{label} {{id: row.id}}) SET n += row", rows=rows)
            print(f"{label:16s} {len(rows)} nodes")
        for rel, (f, la, lb, key) in EDGES.items():
            rows = []
            for r in records(pd.read_csv(f"{a.data}{f}.csv")):
                rows.append({"a": r.pop("start_id"), "b": r.pop("end_id"), "props": r})
            merge = f"(a)-[r:{rel} {{{key}: row.props.{key}}}]->(b)" if key else f"(a)-[r:{rel}]->(b)"
            s.run(f"UNWIND $rows AS row MATCH (a:{la} {{id: row.a}}), (b:{lb} {{id: row.b}}) "
                  f"MERGE {merge} SET r += row.props", rows=rows)
            print(f"{rel:16s} {len(rows)} relationships")
        n = s.run("MATCH (n) RETURN count(n) AS c").single()["c"]
        m = s.run("MATCH ()-[r]->() RETURN count(r) AS c").single()["c"]
        print(f"Graph now has {n} nodes and {m} relationships (expected 45 / 108)")
    driver.close()


if __name__ == "__main__":
    main()
