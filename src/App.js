import './App.css';
import './index.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chart from './chart';
import VWAPScanner from './VWAPScanner';
// Import other pages as needed: StocksList, Backtest, Logout

const Home = () => (
  <div className="container text-center mt-4">
    <h1>Welcome</h1>
    <p>Select a page from the navigation bar above.</p>
  </div>
);

const App = () => {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/">AK</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse justify-content-left" id="navbarNav">
            <ul className="navbar-nav gap-3">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/chart">Chart</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/scanner">Scanner</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/stocks">Stocks List</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/backtest">Backtest</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/algo">Algo</Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/logout">Logout</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid custom_margin">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/scanner" element={<VWAPScanner />} />
          {/* Add placeholder routes */}
          <Route path="/stocks" element={<div>Stocks List Page</div>} />
          <Route path="/backtest" element={<div>Backtest Page</div>} />
          <Route path="/algo" element={<div>Algo Page</div>} />
          <Route path="/logout" element={<div>Logging out...</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
