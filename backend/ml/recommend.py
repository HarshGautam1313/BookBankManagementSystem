import sys
import json
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import LabelEncoder


def recommend_books(user_data, all_books_data):
    # Convert JSON strings to DataFrames
    user_df = pd.DataFrame(json.loads(user_data))
    books_df = pd.DataFrame(json.loads(all_books_data))

    if user_df.empty or books_df.empty:
        return json.dumps(
            books_df["book_id"].head(5).tolist() if not books_df.empty else []
        )

    # --- STEP 1: Feature Engineering ---
    # We use Label Encoding to turn categories into numbers
    le = LabelEncoder()
    # Combine all categories to ensure the encoder knows every possible category
    all_categories = pd.concat([user_df["category"], books_df["category"]]).astype(str)
    le.fit(all_categories)

    # Create a "Feature Matrix" for all books (One-Hot Encoding)
    # This turns a category like 'Java' into a vector [0, 1, 0, 0]
    books_encoded = pd.get_dummies(books_df["category"])
    book_vectors = books_encoded.values

    # Create a mapping of book_id to its vector index
    book_id_to_idx = {book_id: i for i, book_id in enumerate(books_df["book_id"])}

    # --- STEP 2: Create the User Profile Vector ---
    # We find the vectors of all books the user has already borrowed
    user_borrowed_ids = user_df["book_id"].tolist()
    user_vectors = []

    for b_id in user_borrowed_ids:
        if b_id in book_id_to_idx:
            user_vectors.append(book_vectors[book_id_to_idx[b_id]])

    if not user_vectors:
        return json.dumps(books_df["book_id"].head(5).tolist())

    # The User Profile is the average (centroid) of all books they've borrowed
    # This represents the "center" of their interest in the vector space
    user_profile = np.mean(user_vectors, axis=0).reshape(1, -1)

    # --- STEP 3: Calculate Cosine Similarity ---
    # Calculate how similar the user profile is to every book in the library
    # Cosine Similarity returns a value between 0 (totally different) and 1 (identical)
    similarities = cosine_similarity(user_profile, book_vectors)[0]

    # Add similarity scores to the books dataframe
    books_df["similarity"] = similarities

    # --- STEP 4: Filter and Rank ---
    # 1. Remove books the user has already borrowed
    # 2. Sort by similarity score in descending order
    recommendations = books_df[~books_df["book_id"].isin(user_borrowed_ids)]
    recommendations = recommendations.sort_values(by="similarity", ascending=False)

    # Return top 5 book IDs
    result = recommendations["book_id"].head(5).tolist()
    return json.dumps(result)


if __name__ == "__main__":
    # Expects two arguments: User history and All books list
    if len(sys.argv) > 2:
        try:
            print(recommend_books(sys.argv[1], sys.argv[2]))
        except Exception as e:
            # Return empty list on error so Node.js doesn't crash
            print(json.dumps([]))
