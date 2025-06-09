from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
from test import symbols  # Your stock list
import uvicorn

app = FastAPI()

# CORS middleware for React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/scan")
def scan_below_vwap():
    result = []

    for symbol in symbols:
        try:
            df = yf.download(symbol, period="7d", interval="5m", progress=False)

            # Handle no data case
            if df.empty:
                print(f"No data for {symbol}")
                continue

            # Flatten multi-index columns (if any)
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            required_cols = ["High", "Low", "Close", "Volume"]
            if not all(col in df.columns for col in required_cols):
                print(f"Missing required columns for {symbol}, skipping.")
                continue

            df.dropna(subset=required_cols, inplace=True)

            tp = (df["High"] + df["Low"] + df["Close"]) / 3
            vwap = (tp * df["Volume"]).cumsum() / df["Volume"].cumsum()

            last_close = float(df["Close"].iloc[-1])
            last_vwap = float(vwap.iloc[-1])

            if last_close < last_vwap:
                result.append({
                    "symbol": symbol,
                    "close": round(last_close, 2),
                    "vwap": round(last_vwap, 2),
                    "diff_pct": round((last_vwap - last_close) / last_vwap * 100, 2)
                })

        except Exception as e:
            print(f"Error processing {symbol}: {e}")
            continue

    return result
