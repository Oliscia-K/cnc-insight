"use client";

import { useGraphOptions } from "../context/GraphOptionsContext";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GraphInput() {
    const router = useRouter();
    const { graphOptions, setGraphOptions } = useGraphOptions();

        // process state (user selection). We derive a currentProcess for defaults from graphOptions
        const [process, setProcess] = useState("");

        // derive the active process from state or graphOptions defaults
        const currentProcess = process || graphOptions?.processes?.[0] || "";

        // attributes depend on selected process; graphOptions[currentProcess][1] holds the attributes list
            const attributesForProcess = React.useMemo(() => {
                return currentProcess && graphOptions && graphOptions[currentProcess] ? graphOptions[currentProcess][1] : [];
            }, [graphOptions, currentProcess]);
            const [attribute, setAttribute] = useState("");

    const [startPallet, setStartPallet] = useState(1);
    const [totalPallets, setTotalPallets] = useState(1);
    const [binSize, setBinSize] = useState(30);
    const [imageUrl, setImageUrl] = useState("");
    const [imageBlob, setImageBlob] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

        // number of pallets available for the current process (guarded)
        const processPalletCount = graphOptions?.[currentProcess]?.[0] ?? 1;

            // Note: attribute default shown is derived when rendering (attribute || attributesForProcess[0])

    async function handleSubmit(e) {
        e.preventDefault();
            const options = {
                section_name: currentProcess,
                attribute_name: attribute || attributesForProcess?.[0] || "",
                start_index: startPallet,
                num_pallets: totalPallets,
                bins: binSize,
            };
        // save to global state so other pages can use it
        setGraphOptions((prev) => ({ ...(prev || {}), options }));

        // Call /api/plot and display image
        try {
            const res = await fetch("/api/plot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(options),
            });
            if (!res.ok) throw new Error("Plot API error");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
            setImageBlob(blob);
            setHasSubmitted(true);
        } catch (err) {
            setImageUrl("");
            setImageBlob(null);
            setHasSubmitted(true);
            alert("Failed to generate plot: " + err.message);
        }
    }

    async function handleSaveImage() {
        if (!imageBlob) return;
        setIsSaving(true);
        try {
            // convert blob to base64
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = () => reject(new Error("Failed to read blob"));
                reader.onload = () => {
                    const result = reader.result;
                    // result is like data:<type>;base64,AAAA...
                    const parts = result.split(",");
                    resolve(parts[1]);
                };
                reader.readAsDataURL(imageBlob);
            });

            const payload = {
                section_name: currentProcess,
                attribute_name: attribute || attributesForProcess?.[0] || "",
                data: base64,
            };

            const res = await fetch("/api/graph", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to save image");
            }
            alert("Image saved successfully!");
        } catch (err) {
            alert("Failed to save image: " + err.message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Graph Input</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label htmlFor="process">Choose a Process:</label>
                    <br />
                                <select id="process" name="process" value={currentProcess} onChange={(e) => setProcess(e.target.value)}>
                                    {(graphOptions?.processes ?? []).map((proc) => (
                            <option key={proc} value={proc}>
                                {proc}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label htmlFor="attribute">Choose an Attribute:</label>
                    <br />
                                <select id="attribute" name="attribute" value={attribute || attributesForProcess?.[0] || ""} onChange={(e) => setAttribute(e.target.value)}>
                                    {(attributesForProcess ?? []).map((attr) => (
                            <option key={attr} value={attr}>
                                {attr}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label htmlFor="startPallet">Start pallet</label>
                    <br />
                    <input id="startPallet" type="number" min={1} max={processPalletCount} value={startPallet} onChange={(e) => setStartPallet(Number(e.target.value))} />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label htmlFor="totalPallets">Total pallets</label>
                    <br />
                    <input id="totalPallets" type="number" min={1} max={Math.max(1, processPalletCount - startPallet + 1)} value={totalPallets} onChange={(e) => setTotalPallets(Number(e.target.value))} />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label htmlFor="binSize">Bin size</label>
                    <br />
                    <input id="binSize" type="number" min={1} value={binSize} onChange={(e) => setBinSize(Number(e.target.value))} />
                </div>

                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>
            {imageUrl && (
                <div style={{ marginTop: 24 }}>
                    <h2>Plot Result</h2>
                    <Image src={imageUrl} alt="Plot" width={3000} height={3000} />
                    <div style={{ marginTop: 16, padding: 16, border: "1px solid #ccc", borderRadius: 8, backgroundColor: "#f9f9f9" }}>
                        <button 
                            onClick={handleSaveImage} 
                            disabled={isSaving}
                            style={{ padding: "8px 16px", cursor: isSaving ? "not-allowed" : "pointer" }}
                        >
                            {isSaving ? "Saving..." : "Save Image"}
                        </button>
                    </div>
                </div>
            )}
            {hasSubmitted && !imageUrl && (
                <div style={{ marginTop: 24, padding: 16, border: "1px solid #ff6b6b", borderRadius: 8, backgroundColor: "#ffe0e0", color: "#c92a2a" }}>
                    <p>This attribute does not have enough datapoints for a productive histogram</p>
                </div>
            )}
        </div>
    );
}