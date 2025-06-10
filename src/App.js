import './App.css';
import './index.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chart from './chart';
import VWAPScanner from './VWAPScanner';

const Home = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    <h1>Welcome</h1>
    <Link to="/chart">
      <button className="chart-btn">Chart</button>
    </Link>
    <Link to="/scanner">
      <button className="scanner-btn">Scanner</button>
    </Link>
  </div>
);

const App = () => {
  return (
    <Router>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/scanner" element={<VWAPScanner />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
