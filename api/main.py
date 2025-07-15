import joblib
from fastapi import FastAPI, HTTPException

# Note: The following imports assume your docker-compose `working_dir` is the project root.
# This is configured in the `docker-compose.yml` file.
from services.python.main import get_realtime_data
from scripts.feature_engineering import create_features

app = FastAPI(
    title="GenX-EA Trading Bot API",
    description="API to get market predictions from the AI model.",
    version="1.0.0"
)

# Load the model once on startup
try:
    model = joblib.load("ai_models/market_predictor.joblib")
except FileNotFoundError:
    model = None
    print("WARNING: AI model not found. /predict endpoint will be disabled.")

@app.get("/")
def read_root():
    return {"message": "Welcome to the GenX-EA Trading Bot API"}

@app.get("/predict/{symbol}")
def predict_market(symbol: str):
    """
    Fetches real-time data for a given symbol, creates features,
    and returns the latest prediction from the AI model.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    df = get_realtime_data(symbol.upper())
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail=f"Could not fetch data for symbol {symbol}")

    features_df = create_features(df.copy())
    X = features_df.drop(columns=['target'])
    prediction = model.predict(X.tail(1)) # Predict on the most recent data point
    return {"symbol": symbol, "prediction": int(prediction[0])}
