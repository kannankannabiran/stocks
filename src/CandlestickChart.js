import React from "react";
import ChartWithIndicators from "./ChartWithIndicators";

export default function CandlestickChart({ data, selectedIndicators }) {
  return <ChartWithIndicators data={data} selectedIndicators={selectedIndicators} />;
}
