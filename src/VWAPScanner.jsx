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

      {loading && <p className="mt-4">Scanning stocks...</p>}

      {!loading && results.length === 0 && (
        <p className="mt-4 text-gray-600">No matching stocks found.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-gray-400 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-400 text-left">#</th>
                <th className="px-4 py-2 border border-gray-400 text-left">Symbol</th>
                <th className="px-4 py-2 border border-gray-400 text-left">Last Price</th>
                <th className="px-4 py-2 border border-gray-400 text-left">Current Year VWAP</th>
                <th className="px-4 py-2 border border-gray-400 text-left">Year</th>
              </tr>
            </thead>
            <tbody>
              {results.map((stock, index) => (
                <tr key={index} className="hover:bg-green-50">
                  <td className="px-4 py-2 border border-gray-400">{index + 1}</td>
                  <td className="px-4 py-2 border border-gray-400 font-semibold text-green-700">
                    {stock.symbol.replace(/\.NS$/, "")}
                  </td>
                  <td className="px-4 py-2 border border-gray-400">₹{stock.last_price}</td>
                  <td className="px-4 py-2 border border-gray-400">₹{stock.current_year_vwap}</td>
                  <td className="px-4 py-2 border border-gray-400">{stock.current_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VWAPScanner;
