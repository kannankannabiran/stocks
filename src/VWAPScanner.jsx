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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">VWAP Trend Scanner</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleScan}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {(results.rise.length > 0 || results.decline.length > 0) && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300 shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Symbol</th>
                <th className="border px-4 py-2 text-left">VWAP (₹)</th>
                <th className="border px-4 py-2 text-left">Year</th>
                <th className="border px-4 py-2 text-left">Trend</th>
              </tr>
            </thead>
            <tbody>
              {results.rise.map((stock, index) => (
                <tr key={"rise" + index} className="bg-green-50 hover:bg-green-100">
                  <td className="border px-4 py-2 font-semibold text-green-800">
                    {stock.symbol.replace(".NS", "")}
                  </td>
                  <td className="border px-4 py-2">₹{stock.current_year_vwap}</td>
                  <td className="border px-4 py-2">{stock.current_year}</td>
                  <td className="border px-4 py-2 text-green-600 font-bold">↑ Rising</td>
                </tr>
              ))}
              {results.decline.map((stock, index) => (
                <tr key={"decline" + index} className="bg-red-50 hover:bg-red-100">
                  <td className="border px-4 py-2 font-semibold text-red-800">
                    {stock.symbol.replace(".NS", "")}
                  </td>
                  <td className="border px-4 py-2">₹{stock.current_year_vwap}</td>
                  <td className="border px-4 py-2">{stock.current_year}</td>
                  <td className="border px-4 py-2 text-red-600 font-bold">↓ Declining</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.rise.length === 0 && results.decline.length === 0 && !loading && (
        <p className="text-center text-gray-600 mt-6">No VWAP trend found.</p>
      )}
    </div>
  );
}

export default VWAPScanner;
