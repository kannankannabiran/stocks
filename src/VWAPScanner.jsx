import React, { useState } from "react";
import "./VWAPScanner.css";

function VWAPScanner() {
  const [results, setResults] = useState({ decline: [], rise: [] });
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/scan");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error scanning:", err);
      alert("Failed to fetch VWAP data.");
    }
    setLoading(false);
  };

  const today = new Date().toLocaleDateString("en-IN");

  return (
    <div className="scanner-container">
      <h1 className="scanner-title">VWAP Trend Scanner</h1>

      <div className="scanner-button-wrapper">
        <button onClick={handleScan} className="scanner-button">
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {(results.rise.length > 0 || results.decline.length > 0) && (
        <div className="table-wrapper">
          <table className="scanner-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Symbol</th>
                <th>VWAP (₹)</th>
                <th>Year</th>
                <th>Date</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {[...results.rise, ...results.decline].map((stock, index) => (
                <tr
                  key={index}
                  className={stock.trend === "rise" ? "rise-row" : "decline-row"}
                >
                  <td>{index + 1}</td>
                  <td>{stock.symbol.replace(".NS", "")}</td>
                  <td>₹{stock.current_year_vwap}</td>
                  <td>{stock.current_year}</td>
                  <td>{today}</td>
                  <td className={stock.trend === "rise" ? "trend-up" : "trend-down"}>
                    {stock.trend === "rise" ? "↑ Rising" : "↓ Declining"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.rise.length === 0 && results.decline.length === 0 && !loading && (
        <p className="no-result">No VWAP trend found.</p>
      )}
    </div>
  );
}

export default VWAPScanner;
