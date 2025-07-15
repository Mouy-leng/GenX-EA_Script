from fastapi import FastAPI
from core.execution.capital import CapitalCom

app = FastAPI()
capital_com = CapitalCom()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Trading Bot API"}

# Add other API endpoints here
