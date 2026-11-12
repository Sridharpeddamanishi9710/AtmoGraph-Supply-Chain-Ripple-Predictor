

import uuid
import re

def create_event(article_id, article_text, entities):
    text = article_text.lower()

    # Identify disruption type
    if "strike" in text:
        event_type = "strike"
    elif "flood" in text:
        event_type = "flood"
    elif "fire" in text:
        event_type = "fire"
    elif "delay" in text:
        event_type = "shipping_delay"
    else:
        event_type = "unknown"

    # Identify affected supply-chain entity
    entity_name = None
    entity_type = None

    # Detect ports
    port = re.search(
    r"\b(Port of\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
    article_text
)

    if port:
        entity_name = port.group()
        entity_type = "PORT"

    # Detect manufacturing companies
    elif "manufacturing companies" in text:
        entity_name = "manufacturing companies"
        entity_type = "INDUSTRY"

    # Detect factory
    elif "factory" in text:
        entity_name = "factory"
        entity_type = "FACILITY"

    # Detect railway
    elif "railway" in text:
        entity_name = "railway"
        entity_type = "INFRASTRUCTURE"

    # Fallback to extracted entities
    elif entities:
        entity_name = entities[0]["entity"]
        entity_type = entities[0]["type"]

    # Identify location
    location = None

    for entity in entities:
        if entity["type"] == "GPE":
            location = entity["entity"]
            break

    # If country is not extracted, use port name
    if location is None and port:
        location = port.group(1).replace("Port of ", "")

    # Assign basic sample severity
    if any(word in text for word in ["major", "heavy", "emergency"]):
        severity = "high"
    elif event_type == "unknown":
        severity = "unknown"
    else:
        severity = "medium"

    event = {
        "event_id": "EVT-" + str(uuid.uuid4())[:8],
        "article_id": article_id,
        "entity_name": entity_name,
        "entity_type": entity_type,
        "matched_node_id": None,
        "event_type": event_type,
        "location": location,
        "severity": severity,
        "event_date": None,
        "source": "sample_test_data",
        "confidence": 0.70
    }

    return event
