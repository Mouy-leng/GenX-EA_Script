import os
import sys
import pandas as pd
import argparse
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score
import xgboost as xgb
import lightgbm as lgb
import joblib

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def train_model(df, model_name='random_forest'):
    """
    Trains a machine learning model to predict price movements.
    """
    # Split the data into features (X) and target (y)
    X = df.drop(columns=['timestamp', 'target'])
    y = df['target']

    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    if model_name == 'random_forest':
        model = RandomForestClassifier(random_state=42)
        param_grid = {
            'n_estimators': [100, 200],
            'max_depth': [10, 20, None]
        }
    elif model_name == 'xgboost':
        model = xgb.XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='logloss')
        param_grid = {
            'n_estimators': [100, 200],
            'learning_rate': [0.01, 0.1],
            'max_depth': [3, 5, 7]
        }
    elif model_name == 'lightgbm':
        model = lgb.LGBMClassifier(random_state=42)
        param_grid = {
            'n_estimators': [100, 200],
            'learning_rate': [0.01, 0.1],
            'num_leaves': [31, 50]
        }
    else:
        raise ValueError("Unsupported model name")

    grid_search = GridSearchCV(estimator=model, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2)
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_

    # Make predictions on the test set
    y_pred = best_model.predict(X_test)

    # Evaluate the model
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)

    print(f"Best parameters for {model_name}: {grid_search.best_params_}")
    print(f"Accuracy: {accuracy:.2f}")
    print(f"Precision: {precision:.2f}")
    print(f"Recall: {recall:.2f}")

    return best_model

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train a machine learning model.")
    parser.add_argument("--input", type=str, default="data/features.csv", help="The input CSV file.")
    parser.add_argument("--model", type=str, default="random_forest", choices=['random_forest', 'xgboost', 'lightgbm'], help="The model to train.")
    args = parser.parse_args()

    # Load the features
    df = pd.read_csv(args.input)

    # Train the model
    model = train_model(df, args.model)

    # Save the model
    models_dir = "ai_models"
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    model_file_path = os.path.join(models_dir, f"{args.model}_market_predictor.joblib")
    joblib.dump(model, model_file_path)
    print(f"Model saved to {model_file_path}")
