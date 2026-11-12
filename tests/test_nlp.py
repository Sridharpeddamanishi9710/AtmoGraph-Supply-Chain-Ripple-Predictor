
import sys
sys.path.append("src/nlp")

from preprocessing import preprocess_text
from entity_extraction import extract_entities

# Test news article
news = "A strike at Port of Rotterdam in Netherlands disrupted shipping."

# Test preprocessing
cleaned = preprocess_text(news)

print("Preprocessing Test:")
print(cleaned)

# Test entity extraction
entities = extract_entities(news)

print("\nNER Test:")

for entity in entities:
    print(entity)

# Basic validation
assert cleaned != ""
assert len(entities) > 0

print("\nAll basic tests passed!")
