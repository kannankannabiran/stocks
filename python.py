import yfinance as yf
import pandas as pd
import json
import os

# CONFIGURATION
symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS"]  # List of stock symbols
period = "10y"        # Change to "1mo", "1d", etc.
interval = "1d"      # Change to "1d", "1h", "15m", etc.
output_dir = "candles"  # Output folder

# Make output directory if not exists
os.makedirs(output_dir, exist_ok=True)

for symbol in symbols:
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period, interval=interval)

        if data.empty:
            print(f"No data for {symbol}, skipping.")
            continue

        # Use 'Datetime' for intraday intervals, 'Date' for daily
        time_col = 'Datetime' if 'm' in interval or 'h' in interval else 'Date'
        formatted = data.reset_index()[[time_col, 'Open', 'High', 'Low', 'Close']]
        formatted[time_col] = pd.to_datetime(formatted[time_col]).dt.strftime('%Y-%m-%dT%H:%M:%S')

        json_data = [
            {
                "time": row[time_col],
                "open": row["Open"],
                "high": row["High"],
                "low": row["Low"],
                "close": row["Close"]
            } for _, row in formatted.iterrows()
        ]

        filename = os.path.join(output_dir, f"{symbol.split('.')[0]}.json")
        with open(filename, "w") as f:
            json.dump(json_data, f, indent=2)

        print(f"Saved {interval} data for {symbol} to {filename}")

    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
