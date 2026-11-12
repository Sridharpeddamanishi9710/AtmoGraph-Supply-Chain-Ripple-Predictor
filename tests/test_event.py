
import sys
sys.path.append("src/nlp")

from event_extraction import create_event

article = "A major strike at Port of Rotterdam in Netherlands disrupted shipping."

entities = [
    {"entity": "Port of Rotterdam", "type": "FAC"},
    {"entity": "Netherlands", "type": "GPE"}
]

event = create_event("N001", article, entities)

print("Generated Disruption Event:")
print(event)

assert event["event_type"] == "strike"
assert event["severity"] == "high"
assert event["location"] == "Netherlands"

print("\nEvent test passed!")
