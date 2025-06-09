import yfinance as yf
import pandas as pd
import json
import os

# CONFIGURATION
from test import symbols 

period = "5y"        # Example: "1mo", "5d", "1y"
interval = "1d"      # Example: "1d", "5m", "1h"
output_dir = "E:\Kannabiran\stocks\src\Data"  # Use double backslashes in Windows paths

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

for symbol in symbols:
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period, interval=interval)

        if data.empty:
            print(f"No data for {symbol}, skipping.")
            continue

        # Use 'Datetime' if intraday, otherwise 'Date'
        time_col = 'Datetime' if 'm' in interval or 'h' in interval else 'Date'
        formatted = data.reset_index()[[time_col, 'Open', 'High', 'Low', 'Close', 'Volume']]
        formatted[time_col] = pd.to_datetime(formatted[time_col]).dt.strftime('%Y-%m-%dT%H:%M:%S')

        json_data = [
            {
                "time": row[time_col],
                "open": row["Open"],
                "high": row["High"],
                "low": row["Low"],
                "close": row["Close"],
                "volume": row["Volume"]
            }
            for _, row in formatted.iterrows()
        ]

        filename = os.path.join(output_dir, f"{symbol.split('.')[0]}.json")
        with open(filename, "w") as f:
            json.dump(json_data, f, indent=2)

        print(f"Saved {interval} data with volume for {symbol} to {filename}")

    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
