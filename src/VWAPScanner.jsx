import React, { useState } from "react";

function VWAPScanner() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/scan");
      const data = await res.json();
      setResults(data.price_above_all_yearly_vwaps || []);
    } catch (err) {
      console.error("Error scanning:", err);
      alert("Failed to fetch VWAP data.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">VWAP Above All Years Scanner</h1>
      <button
        onClick={handleScan}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Scanning..." : "Scan"}
      </button>

      <ul className="mt-4">
        {!loading && results.length === 0 && <li>No matching stocks found.</li>}

        {results.length > 0 && (
          <>
            <h2 className="text-green-600 font-semibold mt-4">Strong Stocks (Price Above All Yearly VWAPs):</h2>
            {results.map((stock, index) => (
              <li key={index} className="mt-1 text-green-800">
                <strong>{stock.symbol}</strong>: Price ₹{stock.last_price} > VWAP ₹{stock.current_year_vwap} ({stock.current_year})
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}

export default VWAPScanner;
