import React, { useState } from "react";
import Select from "react-select";
import CandlestickChart from "./CandlestickChart";

// Dynamically require all JSON files in ./Data folder
const dataFiles = require.context('./Data', false, /\.json$/);

const stockData = {};
dataFiles.keys().forEach((filename) => {
  // filename example: './RELIANCE.json'
  const key = filename.replace('./', '').replace('.json', '');
  stockData[key] = dataFiles(filename);
});

// Create options for react-select
const stockOptions = Object.keys(stockData).map(symbol => ({
  value: symbol,
  label: symbol,
}));

const availableIndicators = [
  { value: "VWAP", label: "VWAP" },
  { value: "SMA10", label: "SMA 10" },
  { value: "RSI14", label: "RSI 14" },
  { value: "EMA20", label: "EMA 20" },
  { value: "EMA50", label: "EMA 50" },
  { value: "EMA100", label: "EMA 100" },
  { value: "EMA200", label: "EMA 200" },
  { value: "PivotCPR", label: "Pivot & CPR" },
];

export default function Chart() {
  const [selectedStock, setSelectedStock] = useState(stockOptions[0]);
  const [selectedIndicators, setSelectedIndicators] = useState([]);

  const handleStockChange = (selectedOption) => {
    setSelectedStock(selectedOption);
  };

  const handleIndicatorChange = (selectedOptions) => {
    setSelectedIndicators(selectedOptions || []);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h4>Symbol and Indicator Search</h4>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '25%', minWidth: '150px' }}>
          <Select
            options={stockOptions}
            value={selectedStock}
            onChange={handleStockChange}
            placeholder="Search and select a symbol"
            isClearable={false}
          />
        </div>
        <div style={{ width: '50%', minWidth: '300px' }}>
          <Select
            isMulti
            options={availableIndicators}
            value={selectedIndicators}
            onChange={handleIndicatorChange}
            placeholder="Search and select indicators"
          />
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <CandlestickChart data={stockData[selectedStock.value]} selectedIndicators={selectedIndicators} />
      </div>
    </div>
  );
}
