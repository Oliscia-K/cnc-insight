"use client";

import React, { createContext, useContext, useState } from "react";

const GraphOptionsContext = createContext(null);

export function GraphOptionsProvider({ children }) {
  const [graphOptions, setGraphOptions] = useState(null);
  return (
    <GraphOptionsContext.Provider value={{ graphOptions, setGraphOptions }}>
      {children}
    </GraphOptionsContext.Provider>
  );
}

export function useGraphOptions() {
  const ctx = useContext(GraphOptionsContext);
  if (!ctx) {
    throw new Error("useGraphOptions must be used within a GraphOptionsProvider");
  }
  return ctx;
}

export default GraphOptionsContext;
