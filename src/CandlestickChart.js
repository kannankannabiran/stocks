// CandlestickChart.jsx
import React from "react";
import Chart from "react-apexcharts";

export default function CandlestickChart({ data }) {
  const series = [
    {
      data: data.map((item) => ({
        x: new Date(item.time).getTime(), // convert date string to timestamp
        y: [item.open, item.high, item.low, item.close],
      })),
    },
  ];

  const options = {
    chart: {
      type: "candlestick",
      height: 350,
    },
    title: {
      text: "Candlestick Chart",
      align: "left",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return <Chart options={options} series={series} type="candlestick" height={600} />;
}
