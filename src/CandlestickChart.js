import React from "react";
import Chart from "react-apexcharts";

export default function CandlestickChart({ data, selectedIndicators }) {
  // Prepare candlestick data
  const candleSeries = data.map((item) => ({
    x: new Date(item.time).getTime(),
    y: [item.open, item.high, item.low, item.close],
  }));

  // VWAP calculation
  const calcVWAP = (data) => {
    let cumulativeTPV = 0;
    let cumulativeVol = 0;
    return data.map((item) => {
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

  // SMA calculation
  const calcSMA = (data, period = 10) => {
    const closes = data.map((item) => item.close);
    let smaArray = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        smaArray.push({ x: new Date(data[i].time).getTime(), y: null });
      } else {
        const slice = closes.slice(i - period + 1, i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        const avg = sum / period;
        smaArray.push({ x: new Date(data[i].time).getTime(), y: avg });
      }
    }
    return smaArray;
  };

  // RSI calculation
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
        const prevGain = data[i - period].close - data[i - period - 1].close;
        const gain = prevGain > 0 ? prevGain : 0;
        const loss = prevGain < 0 ? -prevGain : 0;
        gains = (gains * (period - 1) + gain) / period;
        losses = (losses * (period - 1) + loss) / period;
      }

      const rs = losses === 0 ? 100 : gains / losses;
      const rsi = 100 - 100 / (1 + rs);
      rsiArray.push({ x: new Date(data[i].time).getTime(), y: rsi });
    }

    return rsiArray;
  };

  // EMA calculation
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

  // Calculate pivot points and CPR lines based on the previous day
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

  // Map selectedIndicators to actual series data
  let series = [
    {
      name: "Candlestick",
      type: "candlestick",
      data: candleSeries,
    },
  ];

  let colors = ["#008FFB"];
  let strokeWidths = [1];

  // Prepare a map for indicator series for tooltip lookup
  const indicatorSeriesMap = {};

  selectedIndicators.forEach((ind) => {
    if (ind.value === "VWAP") {
      const vwapData = calcVWAP(data);
      series.push({ name: ind.label, type: "line", data: vwapData, color: "#FF4560" });
      indicatorSeriesMap[ind.label] = vwapData;
      colors.push("#FF4560");
      strokeWidths.push(2);
    } else if (ind.value === "SMA10") {
      const smaData = calcSMA(data, 10);
      series.push({ name: ind.label, type: "line", data: smaData, color: "#00E396" });
      indicatorSeriesMap[ind.label] = smaData;
      colors.push("#00E396");
      strokeWidths.push(2);
    } else if (ind.value === "RSI14") {
      const rsiData = calcRSI(data, 14);
      series.push({ name: ind.label, type: "line", data: rsiData, color: "#775DD0" });
      indicatorSeriesMap[ind.label] = rsiData;
      colors.push("#775DD0");
      strokeWidths.push(2);
    } else if (ind.value === "EMA20") {
      const ema20Data = calcEMA(data, 20);
      series.push({ name: ind.label, type: "line", data: ema20Data, color: "#FF9800" });
      indicatorSeriesMap[ind.label] = ema20Data;
      colors.push("#FF9800");
      strokeWidths.push(2);
    } else if (ind.value === "EMA50") {
      const ema50Data = calcEMA(data, 50);
      series.push({ name: ind.label, type: "line", data: ema50Data, color: "#2196F3" });
      indicatorSeriesMap[ind.label] = ema50Data;
      colors.push("#2196F3");
      strokeWidths.push(2);
    } else if (ind.value === "EMA100") {
      const ema100Data = calcEMA(data, 100);
      series.push({ name: ind.label, type: "line", data: ema100Data, color: "#9C27B0" });
      indicatorSeriesMap[ind.label] = ema100Data;
      colors.push("#9C27B0");
      strokeWidths.push(2);
    } else if (ind.value === "EMA200") {
      const ema200Data = calcEMA(data, 200);
      series.push({ name: ind.label, type: "line", data: ema200Data, color: "#009688" });
      indicatorSeriesMap[ind.label] = ema200Data;
      colors.push("#009688");
      strokeWidths.push(2);
    } else if (ind.value === "PivotCPR") {
      const lines = calcPivotAndCPR(data);
      lines.forEach((line) => {
        series.push(line);
        // For pivot lines, no need to add to indicatorSeriesMap because these are constant horizontal lines
        colors.push(line.color);
        strokeWidths.push(2);
      });
    }
  });

const options = {
  chart: {
    height: 700,
    type: "candlestick",
    toolbar: { show: true },
  },
  xaxis: {
    type: "datetime",
  },
  stroke: {
    width: strokeWidths,
    curve: "smooth",
  },
  colors: colors,
  tooltip: {
    shared: true,
    intersect: false,
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      if (dataPointIndex === -1) return ''; // no data point

      // Get the OHLC data at hovered candle
      const candle = data[dataPointIndex];
      if (!candle) return '';

      // Build OHLC info
      const ohlcInfo = `
        <div><strong>O:</strong> ${candle.open.toFixed(2)}</div>
        <div><strong>H:</strong> ${candle.high.toFixed(2)}</div>
        <div><strong>L:</strong> ${candle.low.toFixed(2)}</div>
        <div><strong>C:</strong> ${candle.close.toFixed(2)}</div>
      `;

      // Build indicator info for this point
      // series contains all series data arrays, including candlestick series at index 0
      // We skip candlestick (seriesIndex 0) and show values for other series

      let indicatorsInfo = '';
      for (let i = 1; i < series.length; i++) {
        const val = series[i][dataPointIndex];
        const name = w.config.series[i].name;

        if (val !== null && val !== undefined) {
          indicatorsInfo += `<div><strong>${name}:</strong> ${val.toFixed(2)}</div>`;
        }
      }

      return `
        <div style="padding: 8px; font-size: 13px; line-height: 1.3;">
          <div><strong>Date:</strong> ${new Date(candle.time).toLocaleString()}</div>
          ${ohlcInfo}
          <hr style="margin: 6px 0;" />
          ${indicatorsInfo}
        </div>
      `;
    }
  },
  grid: {
    yaxis: { lines: { show: false } },
    xaxis: { lines: { show: false } },
  },
  yaxis: [
    {
      seriesName: "Candlestick",
      labels: {
        formatter: (val) => val.toFixed(2),
      },
      title: {
        text: "Price",
      },
    },
    ...(selectedIndicators.some((ind) => ind.value === "RSI14")
      ? [{
          opposite: true,
          seriesName: "RSI 14",
          min: 0,
          max: 100,
          labels: {
            formatter: (val) => val.toFixed(0),
          },
          title: {
            text: "RSI",
          },
        }]
      : []),
  ],
};


  return <Chart options={options} series={series} type="candlestick" height={700} />;
}
