
import pandas as pd
import re

# Load datasets
disruption_ports = pd.read_csv(
    "outputs/unique_ports_for_matching.csv"
)

neo4j_ports = pd.read_csv(
    "data/raw/nodes_ports.csv"
)

# Normalize names for exact comparison
def normalize(value):
    value = str(value).lower().strip()
    return re.sub(r"[^a-z0-9]", "", value)

def normalize_country(value):
    country = normalize(value)

    aliases = {
        "usa": "unitedstates",
        "usa.": "unitedstates",
        "us": "unitedstates",
        "southkorea": "southkorea"
    }

    return aliases.get(country, country)

# Prepare matching columns
disruption_ports["name_key"] = (
    disruption_ports["port_name"].apply(normalize)
)

disruption_ports["country_key"] = (
    disruption_ports["Country"].apply(normalize_country)
)

neo4j_ports["name_key"] = (
    neo4j_ports["name"].apply(normalize)
)

neo4j_ports["country_key"] = (
    neo4j_ports["country"].apply(normalize_country)
)

# Match exact port names and countries
disruption_ports["matched_node_id"] = ""
disruption_ports["matching_status"] = "pending"

for index, row in disruption_ports.iterrows():

    matches = neo4j_ports[
        (neo4j_ports["name_key"] == row["name_key"]) &
        (neo4j_ports["country_key"] == row["country_key"])
    ]

    if len(matches) == 1:
        disruption_ports.at[index, "matched_node_id"] = (
            matches.iloc[0]["id"]
        )
        disruption_ports.at[index, "matching_status"] = "matched"

    elif len(matches) > 1:
        disruption_ports.at[index, "matching_status"] = "pending_review"

# Remove temporary columns
disruption_ports.drop(
    columns=["name_key", "country_key"],
    inplace=True
)

# Save results
disruption_ports.to_csv(
    "outputs/unique_ports_for_matching.csv",
    index=False
)

print("Port matching completed!")
print("Total ports:", len(disruption_ports))
print(
    "Matched:",
    (disruption_ports["matching_status"] == "matched").sum()
)
print(
    "Pending:",
    (disruption_ports["matching_status"] == "pending").sum()
)
print(
    "Pending review:",
    (disruption_ports["matching_status"] == "pending_review").sum()
)
