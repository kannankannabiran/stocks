import React, { useState } from "react";

function VWAPScanner() {
  const [results, setResults] = useState([]);
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
      <h1 className="text-2xl font-bold mb-4">VWAP Below Scanner</h1>
      <button
        onClick={handleScan}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Scanning..." : "Scan"}
      </button>

      <ul className="mt-4">
        {results.length === 0 && !loading && (
          <li>No stocks below VWAP.</li>
        )}
        {results.map((stock, index) => (
          <li key={index} className="mt-2">
            <strong>{stock.symbol}</strong>: ₹{stock.close} (VWAP ₹{stock.vwap}, -{stock.diff_pct}%)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VWAPScanner;
