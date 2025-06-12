from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
from test import symbols  # Your list of symbols

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
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
    result_decline = []
    result_rise = []

    for symbol in symbols:
        try:
            df = yf.download(symbol, period="5y", interval="1d", progress=False)
            if df.empty:
                continue

            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            required_cols = ["High", "Low", "Close", "Volume"]
            if any(col not in df.columns for col in required_cols):
                continue

            df.dropna(subset=required_cols, inplace=True)
            yearly_vwap = calculate_yearly_vwap(df)

            if len(yearly_vwap) < 5:
                continue

            latest_year = yearly_vwap.index.max()
            previous_years = [latest_year - i for i in range(1, 4 + 1)]

            if not all(y in yearly_vwap.index for y in previous_years):
                continue

            current_vwap = yearly_vwap.loc[latest_year, "VWAP"]
            prev_closes = []
            for y in previous_years:
                ydf = df[df.index.year == y]
                if ydf.empty:
                    break
                prev_closes.append(ydf["Close"].iloc[-1])
            if len(prev_closes) < 4:
                continue

            last_close = df[df.index.year == latest_year]["Close"].iloc[-1]

            if all(prev > current_vwap for prev in prev_closes) and last_close > current_vwap:
                result_decline.append({
                    "symbol": symbol,
                    "current_year": int(latest_year),
                    "current_year_vwap": round(current_vwap, 2),
                    "last_price": round(last_close, 2),
                    "previous_closes": [round(p, 2) for p in prev_closes],
                    "trend": "decline"
                })

            if all(prev < current_vwap for prev in prev_closes) and last_close > current_vwap:
                result_rise.append({
                    "symbol": symbol,
                    "current_year": int(latest_year),
                    "current_year_vwap": round(current_vwap, 2),
                    "last_price": round(last_close, 2),
                    "previous_closes": [round(p, 2) for p in prev_closes],
                    "trend": "rise"
                })

        except Exception as e:
            print(f"Error processing {symbol}: {e}")
            continue

    return {
        "decline": result_decline,
        "rise": result_rise
    }

@app.get("/backtest")
def backtest_vwap_trends():
    backtest_results = []

    for symbol in symbols:
        try:
            df = yf.download(symbol, period="15y", interval="1d", progress=False)
            if df.empty:
                continue

            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            required_cols = ["High", "Low", "Close", "Volume"]
            if any(col not in df.columns for col in required_cols):
                continue

            df.dropna(subset=required_cols, inplace=True)
            yearly_vwap = calculate_yearly_vwap(df)
            all_years = sorted(yearly_vwap.index)

            detailed_results = []

            for i in range(4, len(all_years)):
                current_year = all_years[i]
                prev_years = all_years[i - 4:i]

                current_df = df[df.index.year == current_year]
                if current_df.empty:
                    continue

                current_vwap = yearly_vwap.loc[current_year, "VWAP"]

                prev_closes = []
                for y in prev_years:
                    ydf = df[df.index.year == y]
                    if ydf.empty:
                        prev_closes = []
                        break
                    prev_closes.append(ydf["Close"].iloc[-1])
                if len(prev_closes) < 4:
                    continue

                # Look for breakout date: Close > current_year VWAP and VWAP > all 4 previous closes
                breakout_date = None
                breakout_price = None
                for date, row in current_df.iterrows():
                    if row["Close"] > current_vwap and all(current_vwap > close for close in prev_closes):
                        breakout_date = date
                        breakout_price = row["Close"]
                        break

                if breakout_date is None:
                    continue

                end_date = current_df.index[-1]
                end_price = current_df["Close"].iloc[-1]
                percent_change = ((end_price - breakout_price) / breakout_price) * 100

                trend = "rise" if all(current_vwap > close for close in prev_closes) else "decline"

                detailed_results.append({
                    "year": int(current_year),
                    "trend": trend,
                    "symbol": symbol,
                    "start_date": str(breakout_date.date()),
                    "end_date": str(end_date.date()),
                    "start_price": round(breakout_price, 2),
                    "end_price": round(end_price, 2),
                    "percent_change": round(percent_change, 2)
                })

            if detailed_results:
                backtest_results.append({
                    "symbol": symbol,
                    "occurrences": len(detailed_results),
                    "details": detailed_results
                })

        except Exception as e:
            print(f"Error backtesting {symbol}: {e}")
            continue

    return {"results": backtest_results}
