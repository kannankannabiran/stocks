import React from "react";
import Chart from "react-apexcharts";

// Helper function to get group key by timeframe
function getTimeframeKey(date, timeframe) {
  const d = new Date(date);

  switch (timeframe) {
    case "day":
      return d.toISOString().split("T")[0];

    case "week": {
      // Calculate ISO week number
      const target = new Date(d.valueOf());
      const dayNum = (d.getUTCDay() + 6) % 7;
      target.setUTCDate(target.getUTCDate() - dayNum + 3);
      const firstThursday = target.valueOf();
      target.setUTCMonth(0, 1);
      if (target.getUTCDay() !== 4) {
        target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
      }
      const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
      return `${d.getUTCFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
    }

    case "month":
      return `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, "0")}`;

    case "quarter": {
      const quarter = Math.floor(d.getUTCMonth() / 3) + 1;
      return `${d.getUTCFullYear()}-Q${quarter}`;
    }

    case "year":
      return `${d.getUTCFullYear()}`;

    default:
      return d.toISOString().split("T")[0];
  }
}

// VWAP calculation with timeframe grouping
const calcVWAP = (data, timeframe = "day") => {
  let cumulativeTPV = 0;
  let cumulativeVol = 0;
  let lastGroupKey = "";

  return data.map((item) => {
    const groupKey = getTimeframeKey(item.time, timeframe);
    if (groupKey !== lastGroupKey) {
      cumulativeTPV = 0;
      cumulativeVol = 0;
      lastGroupKey = groupKey;
    }

    const typicalPrice = (item.high + item.low + item.close) / 3;
    const volume = item.volume ?? 0;
    cumulativeTPV += typicalPrice * volume;
    cumulativeVol += volume;

    return {
      x: new Date(item.time).getTime(),
      y: cumulativeVol === 0 ? null : cumulativeTPV / cumulativeVol,
    };
  });
};

// Your other indicator functions (SMA, RSI, EMA, Pivot/CPR) go here (unchanged)...

const calcSMA = (data, period = 10) => {
  const closes = data.map((item) => item.close);
  let smaArray = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      smaArray.push({ x: new Date(data[i].time).getTime(), y: null });
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;
      smaArray.push({ x: new Date(data[i].time).getTime(), y: avg });
    }
  }
  return smaArray;
};

const calcRSI = (data, period = 14) => {
  let gains = 0;
  let losses = 0;
  let rsiArray = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      rsiArray.push({ x: new Date(data[i].time).getTime(), y: null });
      continue;
    }

    const change = data[i].close - data[i - 1].close;
    gains += change > 0 ? change : 0;
    losses += change < 0 ? -change : 0;

    if (i < period) {
      rsiArray.push({ x: new Date(data[i].time).getTime(), y: null });
      if (i === period - 1) {
        gains /= period;
        losses /= period;
      }
      continue;
    }

    if (i > period) {
      const prevChange = data[i - period].close - data[i - period - 1].close;
      const gain = prevChange > 0 ? prevChange : 0;
      const loss = prevChange < 0 ? -prevChange : 0;
      gains = (gains * (period - 1) + gain) / period;
      losses = (losses * (period - 1) + loss) / period;
    }

    const rs = losses === 0 ? 100 : gains / losses;
    const rsi = 100 - 100 / (1 + rs);
    rsiArray.push({ x: new Date(data[i].time).getTime(), y: rsi });
  }

  return rsiArray;
};

const calcEMA = (data, period) => {
  const k = 2 / (period + 1);
  let emaArray = [];
  let emaPrev = 0;

  data.forEach((item, i) => {
    const price = item.close;
    if (i === 0) {
      emaPrev = price;
    } else {
      emaPrev = price * k + emaPrev * (1 - k);
    }
    emaArray.push({ x: new Date(item.time).getTime(), y: emaPrev });
  });

  return emaArray;
};

const calcPivotAndCPR = (data) => {
  if (!data.length) return [];

  const groupByDay = {};
  data.forEach((item) => {
    const day = new Date(item.time).toISOString().slice(0, 10);
    if (!groupByDay[day]) groupByDay[day] = [];
    groupByDay[day].push(item);
  });

  const days = Object.keys(groupByDay).sort();
  if (days.length < 2) return [];

  const prevDayData = groupByDay[days[days.length - 2]];
  const high = Math.max(...prevDayData.map((d) => d.high));
  const low = Math.min(...prevDayData.map((d) => d.low));
  const close = prevDayData[prevDayData.length - 1].close;

  const pivot = (high + low + close) / 3;
  const s1 = 2 * pivot - high;
  const r1 = 2 * pivot - low;
  const s2 = pivot - (high - low);
  const r2 = pivot + (high - low);

  const bc = (high + low) / 2;
  const tc = pivot + (pivot - bc);

  const minTime = new Date(data[0].time).getTime();
  const maxTime = new Date(data[data.length - 1].time).getTime();

  return [
    { name: "Pivot", type: "line", data: [{ x: minTime, y: pivot }, { x: maxTime, y: pivot }], color: "#FFA500" },
    { name: "S1", type: "line", data: [{ x: minTime, y: s1 }, { x: maxTime, y: s1 }], color: "#FF6347" },
    { name: "R1", type: "line", data: [{ x: minTime, y: r1 }, { x: maxTime, y: r1 }], color: "#9ACD32" },
    { name: "S2", type: "line", data: [{ x: minTime, y: s2 }, { x: maxTime, y: s2 }], color: "#FF4500" },
    { name: "R2", type: "line", data: [{ x: minTime, y: r2 }, { x: maxTime, y: r2 }], color: "#32CD32" },
    { name: "BC (CPR Bottom)", type: "line", data: [{ x: minTime, y: bc }, { x: maxTime, y: bc }], color: "#00CED1" },
    { name: "TC (CPR Top)", type: "line", data: [{ x: minTime, y: tc }, { x: maxTime, y: tc }], color: "#20B2AA" },
  ];
};

export default function ChartWithIndicators({ data, selectedIndicators }) {
  const candleSeries = data.map((item) => ({
    x: new Date(item.time).getTime(),
    y: [item.open, item.high, item.low, item.close],
  }));

  // Build series
  let series = [{ name: "Candlestick", type: "candlestick", data: candleSeries }];
  let colors = ["#008FFB"];
  let strokeWidths = [1];

  selectedIndicators.forEach((ind) => {
    let lineData;

    if (ind.value === "VWAP") {
      // Add multiple VWAP timeframes
      const timeframes = ["day", "week", "month", "quarter", "year"];
      const vwapsColors = ["red", "green", "purple", "orange", "red"];

      timeframes.forEach((tf, idx) => {
        lineData = calcVWAP(data, tf);
        series.push({ name: `VWAP (${tf})`, type: "line", data: lineData });
        colors.push(vwapsColors[idx]);
        strokeWidths.push(2);
      });
      return; // Skip further adding
    } else if (ind.value === "SMA10") {
      lineData = calcSMA(data, 10);
      colors.push("#00E396");
    } else if (ind.value === "RSI14") {
      lineData = calcRSI(data, 14);
      colors.push("#775DD0");
    } else if (ind.value === "EMA20") {
      lineData = calcEMA(data, 20);
      colors.push("#FF9800");
    } else if (ind.value === "EMA50") {
      lineData = calcEMA(data, 50);
      colors.push("#2196F3");
    } else if (ind.value === "EMA100") {
      lineData = calcEMA(data, 100);
      colors.push("#9C27B0");
    } else if (ind.value === "EMA200") {
      lineData = calcEMA(data, 200);
      colors.push("#009688");
    } else if (ind.value === "PivotCPR") {
      const lines = calcPivotAndCPR(data);
      lines.forEach((line) => {
        series.push(line);
        colors.push(line.color);
        strokeWidths.push(2);
      });
      return; // skip rest
    }

    if (lineData) {
      series.push({ name: ind.label, type: "line", data: lineData });
      strokeWidths.push(2);
    }
  });

  const options = {
    chart: { height: 700, type: "candlestick", toolbar: { show: true } },
    xaxis: { type: "datetime" },
    stroke: { width: strokeWidths, curve: "smooth" },
    colors,
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        if (dataPointIndex === -1) return "";
        const candle = data[dataPointIndex];
        if (!candle) return "";
        const ohlc = `
          <div><strong>O:</strong> ${candle.open.toFixed(2)}</div>
          <div><strong>H:</strong> ${candle.high.toFixed(2)}</div>
          <div><strong>L:</strong> ${candle.low.toFixed(2)}</div>
          <div><strong>C:</strong> ${candle.close.toFixed(2)}</div>
        `;
        let indicators = "";
        for (let i = 1; i < series.length; i++) {
          const val = series[i][dataPointIndex];
          const name = w.config.series[i].name;
          if (val != null) {
            indicators += `<div><strong>${name}:</strong> ${val.toFixed(2)}</div>`;
          }
        }
        return `
          <div style="padding: 8px;">
            <div><strong>Date:</strong> ${new Date(candle.time).toLocaleString()}</div>
            ${ohlc}
            <hr style="margin: 6px 0;" />
            ${indicators}
          </div>`;
      },
    },
    yaxis: [
      {
        seriesName: "Candlestick",
        labels: { formatter: (val) => val.toFixed(2) },
        title: { text: "Price" },
      },
      ...(selectedIndicators.some((ind) => ind.value === "RSI14")
        ? [
            {
              opposite: true,
              min: 0,
              max: 100,
              labels: { formatter: (val) => val.toFixed(0) },
              title: { text: "RSI" },
            },
          ]
        : []),
    ],
    grid: {
      yaxis: { lines: { show: false } },
      xaxis: { lines: { show: false } },
    },
  };

  return <Chart options={options} series={series} type="candlestick" height={700} />;
}
