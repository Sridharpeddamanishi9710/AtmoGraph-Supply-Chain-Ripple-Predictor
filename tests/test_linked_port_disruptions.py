
import json

with open(
    "outputs/linked_port_disruption_records.json",
    encoding="utf-8"
) as file:
    records = json.load(file)

with open(
    "outputs/nodes_port.csv",
    encoding="utf-8"
) as file:
    import pandas as pd
    ports = pd.read_csv(file)

valid_ids = set(ports["id"])

for record in records:
    assert record["matched_node_id"] in valid_ids
    assert record["matching_status"] == "matched"

print("Linked records:", len(records))
print("All matched IDs are valid!")
print("Validation passed!")
