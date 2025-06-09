from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
from test import symbols  # Your list of symbols

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_yearly_vwap(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["Year"] = df.index.year
    df["TP"] = (df["High"] + df["Low"] + df["Close"]) / 3
    df["TPV"] = df["TP"] * df["Volume"]
    yearly = df.groupby("Year").agg({"TPV": "sum", "Volume": "sum"})
    yearly["VWAP"] = yearly["TPV"] / yearly["Volume"]
    return yearly[["VWAP"]]

@app.get("/scan")
def scan_vwap_trends():
    result_above_all_vwaps = []

    for symbol in symbols:
        try:
            df = yf.download(symbol, period="5y", interval="1d", progress=False)
            if df.empty:
                print(f"No data for {symbol}")
                continue

            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            required_cols = ["High", "Low", "Close", "Volume"]
            if any(col not in df.columns for col in required_cols):
                print(f"Missing columns for {symbol}")
                continue

            df.dropna(subset=required_cols, inplace=True)

            yearly_vwap = calculate_yearly_vwap(df)
            if len(yearly_vwap) < 5:
                print(f"Not enough years of data for {symbol}")
                continue

            latest_year = yearly_vwap.index.max()
            previous_years = [latest_year - i for i in range(1, 5)]

            if not all(y in yearly_vwap.index for y in previous_years):
                print(f"Missing previous years for {symbol}")
                continue

            current_vwap = yearly_vwap.loc[latest_year, "VWAP"]
            prev_vwaps = [yearly_vwap.loc[y, "VWAP"] for y in previous_years]
            last_price = df["Close"].iloc[-1]

            if all(last_price > vwap for vwap in prev_vwaps + [current_vwap]):
                result_above_all_vwaps.append({
                    "symbol": symbol,
                    "last_price": round(last_price, 2),
                    "current_year": int(latest_year),
                    "current_year_vwap": round(current_vwap, 2),
                    "previous_years": {str(y): round(yearly_vwap.loc[y, "VWAP"], 2) for y in previous_years},
                    "trend": "price_above_all_yearly_vwaps"
                })

        except Exception as e:
            print(f"Error processing {symbol}: {e}")
            continue

    return {
        "price_above_all_yearly_vwaps": result_above_all_vwaps
    }
