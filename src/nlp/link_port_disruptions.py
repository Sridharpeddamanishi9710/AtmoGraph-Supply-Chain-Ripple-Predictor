
import pandas as pd
import json
import os

# Input files
events_file = "outputs/port_disruption_records.json"
ports_file = "outputs/final_13_ports.csv"

# Output files
linked_file = "outputs/linked_port_disruption_records.json"
unmatched_file = "outputs/unmatched_port_disruptions.csv"


def normalize(value):
    if pd.isna(value):
        return ""
    return str(value).strip().casefold()


def link_disruptions():

    # Load data
    with open(events_file, "r", encoding="utf-8") as file:
        events = json.load(file)

    ports = pd.read_csv(ports_file)

    # Build lookup using port name and country
    port_lookup = {}

    for _, row in ports.iterrows():
        key = (
            normalize(row["name"]),
            normalize(row["country"])
        )
        port_lookup[key] = row["id"]

    # Known name and country variations
    port_aliases = {
        "port brisbane": "brisbane"
    }

    country_aliases = {
        "u.s.a.": "united states",
        "usa": "united states"
    }

    linked_records = []
    unmatched_records = []

    for event in events:

        port_name = normalize(event.get("port_name"))
        country = normalize(event.get("Country"))

        # Normalize known variations
        port_name = port_aliases.get(port_name, port_name)
        country = country_aliases.get(country, country)

        key = (port_name, country)

        if key in port_lookup:

            event["matched_node_id"] = port_lookup[key]
            event["matching_status"] = "matched"

            linked_records.append(event)

        else:
            event["matched_node_id"] = None
            event["matching_status"] = "unmatched"

            unmatched_records.append(event)

    # Save only matched disruption records
    os.makedirs("outputs", exist_ok=True)

    with open(linked_file, "w", encoding="utf-8") as file:
        json.dump(linked_records, file, indent=4, ensure_ascii=False)

    # Save unmatched records separately
    pd.DataFrame(unmatched_records).to_csv(
        unmatched_file,
        index=False
    )

    print("Port disruption linking completed!")
    print("Total disruption records:", len(events))
    print("Linked records:", len(linked_records))
    print("Unmatched records:", len(unmatched_records))
    print("Linked JSON:", linked_file)
    print("Unmatched CSV:", unmatched_file)


if __name__ == "__main__":
    link_disruptions()
