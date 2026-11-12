
import pandas as pd
import json

from preprocessing import preprocess_text
from entity_extraction import extract_entities
from event_extraction import create_event

# Read news dataset
df = pd.read_csv("data/raw/news_articles.csv")

all_results = []
all_events = []

# Process each article
for index, row in df.iterrows():

    article_id = row["article_id"]
    article = row["text"]

    # Clean news text
    cleaned_text = preprocess_text(article)

    # Extract entities
    entities = extract_entities(article)

    # Create structured event
    event = create_event(article_id, article, entities)

    # Store complete result
    result = {
        "article_id": article_id,
        "original_text": article,
        "cleaned_text": cleaned_text,
        "entities": entities,
        "event": event
    }

    all_results.append(result)
    all_events.append(event)

    print("\nArticle ID:", article_id)
    print("Extracted Entities:", entities)
    print("Generated Event:", event)

# Save results
with open("outputs/extracted_entities.json", "w") as file:
    json.dump(all_results, file, indent=4)

print("\nAll articles processed successfully!")
print("Results saved in outputs/extracted_entities.json")
# Save only structured event records
with open("outputs/event_records.json", "w") as file:
    json.dump(all_events, file, indent=4)

print("Event records saved in outputs/event_records.json")
