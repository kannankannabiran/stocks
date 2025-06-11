import React, { createContext, useState, useRef } from "react";

export const ScanContext = createContext();

export const ScanProvider = ({ children }) => {
  const [results, setResults] = useState({ decline: [], rise: [] });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const abortControllerRef = useRef(null);

  const handleScan = async () => {
    if (loading || scanning) return;
    setLoading(true);
    setScanning(true);
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("http://localhost:8000/scan", {
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Scan request failed");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Scan error:", err);
        alert("Failed to fetch VWAP data.");
      }
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const cancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setScanning(false);
    }
  };

  return (
    <ScanContext.Provider
      value={{ results, loading, scanning, handleScan, cancelScan }}
    >
      {children}
    </ScanContext.Provider>
  );
};
