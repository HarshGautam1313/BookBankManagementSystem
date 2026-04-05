import sys
import json
import pandas as pd

def predict_demand(data_json):
    # Load the synthetic transaction data
    df = pd.DataFrame(json.loads(data_json))
    
    if df.empty:
        return json.dumps([])

    # Count occurrences of each book_id in transactions
    # This is a simple frequency-based prediction model
    demand = df['book_id'].value_counts().reset_index()
    demand.columns = ['book_id', 'demand_score']
    
    # Sort by highest demand and return top 5
    top_5 = demand.head(5).to_dict(orient='records')
    return json.dumps(top_5)

if __name__ == "__main__":
    # Receive data from Node.js via command line argument
    if len(sys.argv) > 1:
        print(predict_demand(sys.argv[1]))