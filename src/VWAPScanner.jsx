import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

  const today = new Date().toISOString().slice(0, 10);

  const exportToCSV = (data, filename) => {
    const headers = ["S.No", "Symbol", "VWAP (₹)", "Year", "Date", "Trend"];
    const rows = data.map((stock, index) => [
      index + 1,
      stock.symbol.replace(".NS", ""),
      `₹${stock.current_year_vwap}`,
      stock.current_year,
      today,
      stock.trend === "rise" ? "↑ Rising" : "↓ Declining",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data, filename) => {
    const sheetData = data.map((stock, index) => ({
      "S.No": index + 1,
      Symbol: stock.symbol.replace(".NS", ""),
      "VWAP (₹)": stock.current_year_vwap,
      Year: stock.current_year,
      Date: today,
      Trend: stock.trend === "rise" ? "↑ Rising" : "↓ Declining",
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "VWAP Trends");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, `${filename}_${today}.xlsx`);
  };

  const allResults = [...results.rise, ...results.decline];

  return (
    <div className="scanner-container">
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <h1 className="scanner-title">VWAP Yearly Scanner</h1>

      <div className="scanner-button-wrapper">
        <button onClick={handleScan} className="scanner-button">
          {loading ? "Scanning..." : "Scan"}
        </button>

        {allResults.length > 0 && (
          <>
            <button
              onClick={() => exportToCSV(allResults, "VWAP_Trends")}
              className="scanner-button download-button"
            >
              Download CSV
            </button>
            <button
              onClick={() => exportToExcel(allResults, "VWAP_Trends")}
              className="scanner-button download-button"
            >
              Download Excel
            </button>
          </>
        )}
      </div>

      {allResults.length > 0 && (
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
              {allResults.map((stock, index) => (
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

      {allResults.length === 0 && !loading && (
        <p className="no-result">No VWAP trend found.</p>
      )}
    </div>
  );
}

export default VWAPScanner;
