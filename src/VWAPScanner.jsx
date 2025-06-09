import React, { useState } from "react";

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">VWAP Trend Scanner</h1>
      <button
        onClick={handleScan}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Scanning..." : "Scan"}
      </button>

      <ul className="mt-4">
        {results.decline.length === 0 && results.rise.length === 0 && !loading && (
          <li>No VWAP trend found.</li>
        )}

        {results.rise.length > 0 && (
          <>
            <h2 className="text-green-600 font-semibold mt-4">Rising VWAP:</h2>
            {results.rise.map((stock, index) => (
              <li key={"rise" + index} className="mt-1 text-green-800">
                <strong>{stock.symbol}</strong>: VWAP ₹{stock.current_year_vwap} ({stock.current_year}), ↑
              </li>
            ))}
          </>
        )}

        {results.decline.length > 0 && (
          <>
            <h2 className="text-red-600 font-semibold mt-4">Declining VWAP:</h2>
            {results.decline.map((stock, index) => (
              <li key={"decline" + index} className="mt-1 text-red-800">
                <strong>{stock.symbol}</strong>: VWAP ₹{stock.current_year_vwap} ({stock.current_year}), ↓
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}

export default VWAPScanner;
