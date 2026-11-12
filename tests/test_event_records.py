
import json

# Load generated event records
with open("outputs/event_records.json", "r") as file:
    events = json.load(file)

# Check number of events
assert len(events) == 5

# Check required fields
required_fields = [
    "event_id",
    "entity_name",
    "matched_node_id",
    "event_type",
    "location",
    "severity",
    "event_date",
    "source",
    "confidence"
]

for event in events:
    for field in required_fields:
        assert field in event, f"Missing field: {field}"

print("Total events:", len(events))
print("All required fields are present.")
print("Event records test passed!")
