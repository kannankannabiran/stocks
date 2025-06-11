import React, { useContext } from "react";
import { ScanContext } from "./ScanContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./VWAPScanner.css";

function VWAPScanner() {
  const { results, loading, scanning, handleScan, cancelScan } = useContext(ScanContext);

  const today = new Date().toISOString().slice(0, 10);
  const allResults = [...results.rise, ...results.decline];

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

  const openTradingView = (symbol) => {
    const cleanSymbol = symbol.replace(".NS", "");
    const url = `https://www.tradingview.com/chart/?symbol=NSE:${cleanSymbol}`;
    window.open(url, "_blank");
  };

  return (
    <div className="scanner-container">
      {(loading || scanning) && (
        <div className="fullscreen-spinner-overlay">
          <div className="spinner"></div>
          <button className="cancel-button" onClick={cancelScan}>
            Cancel Scan
          </button>
        </div>
      )}

      <h1 className="scanner-title">VWAP Yearly Scanner</h1>

      <div className="scanner-button-wrapper">
        <button
          onClick={handleScan}
          className="scanner-button"
          disabled={loading || scanning}
        >
          {loading || scanning ? "Scanning..." : "Scan"}
        </button>

        {!scanning && allResults.length > 0 && (
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

      {!loading && allResults.length > 0 && (
        <div className="table-wrapper">
          <table className="scanner-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Symbol</th>
                <th>VWAP (₹)</th>
                <th>Date</th>
                <th>Trend</th>
                <th>Chart</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((stock, index) => {
                const cleanSymbol = stock.symbol.replace(".NS", "");
                return (
                  <tr
                    key={index}
                    className={stock.trend === "rise" ? "rise-row" : "decline-row"}
                  >
                    <td>{index + 1}</td>
                    <td>{cleanSymbol}</td>
                    <td>₹{stock.current_year_vwap}</td>
                    <td>{today}</td>
                    <td className={stock.trend === "rise" ? "trend-up" : "trend-down"}>
                      {stock.trend === "rise" ? "↑ Rising" : "↓ Declining"}
                    </td>
                    <td>
                      <button
                        className="tv-button"
                        onClick={() => openTradingView(stock.symbol)}
                        title="Open in TradingView"
                      >
                        📈
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && allResults.length === 0 && (
        <p className="no-result">No VWAP trend found.</p>
      )}
    </div>
  );
}

export default VWAPScanner;
