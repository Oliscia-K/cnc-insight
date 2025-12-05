"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function GraphHistoryPage() {
  const [files, setFiles] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sections, setSections] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function fetchGraphs(section, attribute) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (section) params.set("section_name", section);
      if (attribute) params.set("attribute_name", attribute);
      const url = `/api/graph${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch graphs: ${res.status}`);
      const body = await res.json();
      setFiles(body.files || []);
      setFilters(body.filters || []);

      // derive unique sections for dropdowns
      const uniqueSections = Array.from(new Set((body.filters || []).map((f) => f.section_name))).filter(Boolean);
      setSections(uniqueSections);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load: all graphs ordered by created_at (API default)
    fetchGraphs();
  }, []);

  useEffect(() => {
    // refetch when filters change
    fetchGraphs(selectedSection, selectedAttribute);
  }, [selectedSection, selectedAttribute]);

  // Recompute attributes list based on selected section and available filters
  useEffect(() => {
    const list = (filters || [])
      .filter((f) => (selectedSection ? f.section_name === selectedSection : true))
      .map((f) => f.attribute_name)
      .filter(Boolean);
    const uniqueAttributes = Array.from(new Set(list));
    setAttributes(uniqueAttributes);

    // if currently selected attribute is no longer available for this section, clear it
    if (selectedAttribute && !uniqueAttributes.includes(selectedAttribute)) {
      setSelectedAttribute("");
    }
  }, [filters, selectedSection, selectedAttribute]);

  return (
    <div className="w-screen h-screen p-5">
        <button className="self-start font-bold bg-gray-400 h-9 w-24 rounded-md hover:bg-gray-200 p-2" onClick={() => router.push("/")}>
            Home
        </button>
      <h1 className="text-3xl text-center w-full mb-8">Graph History</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Section</label>
          <select className="bg-gray-800 h-9 rounded-md font-bold hover:bg-gray-600" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ minWidth: 200 }}>
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Attribute</label>
          <select className="bg-gray-800 h-9 rounded-md font-bold hover:bg-gray-600" value={selectedAttribute} onChange={(e) => setSelectedAttribute(e.target.value)} style={{ minWidth: 200 }}>
            <option value="">All attributes</option>
            {attributes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            className="bg-gray-800 h-9 rounded-md font-bold hover:bg-gray-600 px-4"
           onClick={() => { setSelectedSection(""); setSelectedAttribute(""); }} style={{ height: 32 }}>
            Clear
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div style={{ color: "#c92a2a", marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {files.map((file) => (
          <div key={file.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, background: "#fff" }}>
            <div style={{ marginBottom: 8, fontSize: 13, color: "#374151" }}>
              <strong>{file.section_name}</strong> — {file.attribute_name}
            </div>
            <div style={{ marginBottom: 8, color: "#6b7280", fontSize: 12 }}>{new Date(file.created_at).toLocaleString()}</div>
            <div style={{ textAlign: "center" }}>
              <Image
                src={file.url}
                alt={`${file.section_name}_${file.attribute_name}`}
                width={800}
                height={450}
                style={{ maxWidth: "100%", height: "auto", borderRadius: 4 }}
              />
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={async () => {
                  const ok = window.confirm("This will permanently delete the image. Would you like to continue?");
                  if (!ok) return;
                  try {
                    const res = await fetch(`/api/file/${file.id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
                    // remove from local list
                    setFiles((prev) => prev.filter((p) => p.id !== file.id));
                  } catch (err) {
                    console.error(err);
                    alert("Failed to delete image: " + (err.message || err));
                  }
                }}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
                className="text-red-600 hover:text-red-300 font-bold"
              >
                Delete
              </button>
              <a className="text-blue-400 hover:text-blue-200 font-bold" href={file.url} download={`plot_${file.id}.png`}>Download</a>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && !loading && <p style={{ marginTop: 16 }}>No graphs found for the selected filters.</p>}
    </div>
  );
}
