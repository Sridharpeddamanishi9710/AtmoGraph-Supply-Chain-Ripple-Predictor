
import re

def preprocess_text(text):

    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)

    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Remove unnecessary special characters
    text = re.sub(r'[^a-zA-Z0-9\s.,!?-]', ' ', text)

    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)

    return text.strip()


# Test the preprocessing function
if __name__ == "__main__":

    news = """
    BREAKING!!! A major strike at Port C
    in Europe has disrupted shipping operations.
    """

    cleaned_text = preprocess_text(news)

    print("Original News:")
    print(news)

    print("\nCleaned News:")
    print(cleaned_text)
