import './App.css';
import React from "react";
import CandlestickChart from "./CandlestickChart";
import Reliance from './candles/RELIANCE.json';

const sampleData = Reliance;

export default function App() {
  return (
    <div>
      <h2>RELIANCE Candlestick Chart (ApexCharts)</h2>
      <CandlestickChart data={sampleData} />
    </div>
  );
}