import './App.css';
import './index.css';
import React, { useState } from "react";
import Chart from './chart';
import VWAPScanner from './VWAPScanner';

const App = () => {
  const [page, setPage] = useState("home"); // default home

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {page === "home" && (
        <>
          <h1>Welcome</h1>
          <button className="chart-btn" onClick={() => setPage("chart")}>
          Chart
        </button>
        <button className="scanner-btn" onClick={() => setPage("scanner")}>
          Scanner
        </button>
        </>
      )}

      {page === "chart" && (
        <>
          <button onClick={() => setPage("home")} style={{ marginBottom: "10px" }}>⬅ Back</button>
          <Chart />
        </>
      )}

      {page === "scanner" && (
        <>
          <button onClick={() => setPage("home")} style={{ marginBottom: "10px" }}>⬅ Back</button>
          <VWAPScanner />
        </>
      )}
    </div>
  );
};

export default App;
