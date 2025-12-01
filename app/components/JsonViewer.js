"use client";

import React, { useState } from "react";

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function Primitive({ value }) {
  return <span className="text-black">{String(value)}</span>;
}

function JsonNode({ data, name }) {
  const [open, setOpen] = useState(false);

  if (data === null) return <Primitive value={"null"} />;
  if (data === undefined) return <Primitive value={"undefined"} />;

  if (Array.isArray(data)) {
    return (
      <div style={{ fontFamily: "monospace", fontSize: 13 }}>
        <div>
          <button onClick={() => setOpen((v) => !v)} style={{ marginRight: 8 }}>
            {open ? "▾" : "▸"}
          </button>
          <strong>{name ?? "Array"}</strong> <span className="text-black">[{data.length}]</span>
        </div>
        {open && (
          <div style={{ marginLeft: 20, marginTop: 6 }}>
            {data.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 6 }}>
                <span className="text-black" style={{ marginRight: 8 }}>{idx}:</span>
                <JsonNode data={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isObject(data)) {
    const keys = Object.keys(data);
    return (
      <div style={{ fontFamily: "monospace", fontSize: 13 }}>
        <div>
          <button className="text-black" onClick={() => setOpen((v) => !v)} style={{ marginRight: 8 }}>
            {open ? "▾" : "▸"}
          </button>
          <strong className="text-black">{name ?? "Object"}</strong> <span className="text-black">{{}.toString()}</span>
        </div>
        {open && (
          <div style={{ marginLeft: 20, marginTop: 6 }}>
            {keys.map((k) => (
              <div key={k} style={{ marginBottom: 6 }}>
                <span style={{ color: "#111827", fontWeight: 600, marginRight: 8 }}>{k}:</span>
                <JsonNode data={data[k]} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // primitive
  return <Primitive value={data} />;
}

export default function JsonViewer({ data }) {
  return (
    <div
      style={{
        padding: 12,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
        maxHeight: "60vh",
        overflowY: "auto",
      }}
    >
      <JsonNode data={data} />
    </div>
  );
}
