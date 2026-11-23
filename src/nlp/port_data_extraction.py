
import pandas as pd
import json
import os

# Excel dataset path
input_path = (
    "data/raw/port_disruption/"
    "Port_Disruption_database-master/"
    "Port_Disruption_database-master/"
    "Port-disruption-database.xlsx"
)

# Output JSON path
output_path = "outputs/port_disruption_records.json"

def extract_port_disruptions():

    # Read Excel file
    df = pd.read_excel(input_path)

    # Clean text columns
    df["Event"] = df["Event"].astype(str).str.strip()
    df["port_name"] = df["port_name"].astype(str).str.strip()
    df["Country"] = df["Country"].astype(str).str.strip()

    # Convert records to dictionaries
    records = df.to_dict(orient="records")

    # Convert dates to JSON-compatible strings
    for record in records:
        if pd.notna(record["Date"]):
            record["Date"] = pd.to_datetime(
                record["Date"]
            ).strftime("%Y-%m-%d")
        else:
            record["Date"] = None

    # Save JSON
    os.makedirs("outputs", exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(records, file, indent=4, default=str)

    print("Port disruption extraction completed!")
    print("Total records:", len(records))
    print("Unique ports:", df["port_name"].nunique())
    print("Unique events:", df["Event"].nunique())
    print("JSON saved at:", output_path)


if __name__ == "__main__":
    extract_port_disruptions()
