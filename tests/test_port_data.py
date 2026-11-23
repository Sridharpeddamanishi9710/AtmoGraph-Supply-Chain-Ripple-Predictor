
import json
import os

file_path = "outputs/port_disruption_records.json"

assert os.path.exists(file_path), "JSON file not found!"

with open(file_path, "r", encoding="utf-8") as file:
    records = json.load(file)

required_fields = [
    "Event",
    "port_name",
    "Country",
    "Year",
    "Date",
    "reduction",
    "shutdown",
    "recovery",
    "total_affected_days",
    "severity"
]

for record in records:
    for field in required_fields:
        assert field in record, f"Missing field: {field}"

print("Total records:", len(records))
print("All required fields are present!")

missing_ports = sum(
    not record["port_name"] for record in records
)

print("Missing port names:", missing_ports)
print("Port data validation passed!")
