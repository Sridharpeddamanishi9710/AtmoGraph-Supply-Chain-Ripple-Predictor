
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_entities(text):

    doc = nlp(text)

    entities = []

    for ent in doc.ents:
        entities.append({
            "entity": ent.text,
            "type": ent.label_
        })

    return entities


if __name__ == "__main__":

    news = """
    A major strike at the Port of Rotterdam
    in the Netherlands has disrupted shipping.
    Several companies are facing delays.
    """

    results = extract_entities(news)

    print("Original News:")
    print(news)

    print("\nExtracted Entities:")

    for item in results:
        print(item["entity"], ":", item["type"])
