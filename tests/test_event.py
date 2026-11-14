
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

from event_extraction import extract_event_date

# Test date extraction
date = extract_event_date("A strike occurred on November 12, 2026.")

assert date == "2026-11-12"

# Test article without date
no_date = extract_event_date("A major strike disrupted shipping.")

assert no_date is None

print("Date extraction tests passed!")
