

import pandas as pd

# Read extracted port records
df = pd.read_json("outputs/port_disruption_records.json")

# Select unique port and country combinations
ports = df[["port_name", "Country"]].drop_duplicates()

# Sort records
ports = ports.sort_values(
    by=["Country", "port_name"]
)

# Add matching status
ports["matched_node_id"] = None
ports["matching_status"] = "pending"

# Save CSV
ports.to_csv(
    "outputs/unique_ports_for_matching.csv",
    index=False
)

print("Port matching file created!")
print("Unique port-country combinations:", len(ports))
print(ports.head(10))
