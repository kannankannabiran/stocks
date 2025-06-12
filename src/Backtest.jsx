import React, { useState } from "react";

const Backtest = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRunBacktest = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/backtest");
      const result = await response.json();
      setData(result.results || []);
    } catch (err) {
      console.error("Backtest failed:", err);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <div className="text-center">
      <h2>Backtest</h2>
      <button className="btn btn-primary mb-3" onClick={handleRunBacktest}>
        Run Backtest
      </button>
      
      {loading && <p>Loading backtest results...</p>}
      </div>
      {data.length > 0 && data.map((item) => (
        <div key={item.symbol} className="mb-4">
          <h5>{item.symbol} ({item.occurrences} matches)</h5>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Year</th>
                <th>Trend</th>
                <th>Start Date</th>
                <th>Start Price</th>
                <th>End Date</th>
                <th>End Price</th>
                <th>% Change</th>
              </tr>
            </thead>
            <tbody>
              {item.details.map((d, index) => (
                <tr key={index}>
                  <td>{d.year}</td>
                  <td>{d.trend}</td>
                  <td>{d.start_date}</td>
                  <td>{d.start_price}</td>
                  <td>{d.end_date}</td>
                  <td>{d.end_price}</td>
                  <td style={{ color: d.percent_change >= 0 ? "green" : "red" }}>
                    {d.percent_change}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Backtest;
