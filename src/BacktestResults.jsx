import React, { useEffect, useState } from "react";

const BacktestResults = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBacktest = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/backtest");
        const result = await response.json();
        setData(result.results);
      } catch (err) {
        console.error("Failed to fetch backtest data:", err);
      }
      setLoading(false);
    };

    fetchBacktest();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">VWAP Backtest Results</h2>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No results found.</p>
      ) : (
        data.map((item) => (
          <div key={item.symbol} className="mb-4">
            <h4>{item.symbol} ({item.occurrences} occurrences)</h4>
            <table border="1" cellPadding="8" style={{ width: "100%", marginBottom: "1rem" }}>
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
                    <td
                      style={{
                        color: d.percent_change >= 0 ? "green" : "red",
                      }}
                    >
                      {d.percent_change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default BacktestResults;
