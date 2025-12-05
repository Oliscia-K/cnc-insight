"use client";

import { useGraphOptions } from "../context/GraphOptionsContext";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import JsonViewer from "../components/JsonViewer";

export default function GraphInput() {
    const router = useRouter();
    function handleHomeClick() {
        if (window.confirm(
            "Returning to Home will require you to upload your data file again to create new graphs. Any unsaved graphs will remain unsaved.\n\nDo you want to continue?"
        )) {
            router.push("/");
        }
    }
    const { graphOptions, setGraphOptions, parsedJson } = useGraphOptions();

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
    // Track the process/attribute used for the last successful plot
    const [lastPlotProcess, setLastPlotProcess] = useState("");
    const [lastPlotAttribute, setLastPlotAttribute] = useState("");

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
            // Save the process/attribute used for this plot
            setLastPlotProcess(options.section_name);
            setLastPlotAttribute(options.attribute_name);
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

            // Always use the process/attribute that generated the image
            const payload = {
                section_name: lastPlotProcess,
                attribute_name: lastPlotAttribute,
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
        <div className="w-screen min-h-screen flex flex-col items-center p-6 bg-black text-zinc-50">
            <button className="self-start font-bold bg-gray-400 h-9 w-24 rounded-md hover:bg-gray-200 p-2" onClick={handleHomeClick}> 
                Home
            </button>
            <h1 className="font-bold text-2xl mb-8">Graph Input</h1>
            <form className="flex flex-col" onSubmit={handleSubmit}>
                <div className="flex flex-row gap-6">
                    <div style={{ marginBottom: 12 }}>
                        <label className="font-bold" htmlFor="process">Choose a Process:</label>
                        <br />
                                    <select className="bg-gray-400 h-9 rounded-md font-bold hover:bg-gray-200" id="process" name="process" value={currentProcess} onChange={(e) => setProcess(e.target.value)}>
                                        {(graphOptions?.processes ?? []).map((proc) => (
                                <option key={proc} value={proc}>
                                    {proc}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label className="font-bold" htmlFor="attribute">Choose an Attribute:</label>
                        <br />
                                    <select className="bg-gray-400 h-9 rounded-md font-bold hover:bg-gray-200" id="attribute" name="attribute" value={attribute || attributesForProcess?.[0] || ""} onChange={(e) => setAttribute(e.target.value)}>
                                        {(attributesForProcess ?? []).map((attr) => (
                                <option key={attr} value={attr}>
                                    {attr}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-row gap-6 justify-between">
                    <div style={{ marginBottom: 12 }}>
                        <label className="font-bold" htmlFor="startPallet">Start pallet (max: {processPalletCount})</label>
                        <br />
                        <input className="w-24 bg-gray-400 rounded-md font-bold text-center" id="startPallet" type="number" min={1} max={processPalletCount} value={startPallet} onChange={(e) => setStartPallet(Number(e.target.value))} />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label className="font-bold" htmlFor="totalPallets">Total pallets (max: {Math.max(1, processPalletCount - startPallet + 1)})</label>
                        <br />
                        <input className="w-24 bg-gray-400 rounded-md font-bold text-center" id="totalPallets" type="number" min={1} max={Math.max(1, processPalletCount - startPallet + 1)} value={totalPallets} onChange={(e) => setTotalPallets(Number(e.target.value))} />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label className="font-bold" htmlFor="binSize">Bin size</label>
                        <br />
                        <input className="w-24 bg-gray-400 rounded-md font-bold text-center" id="binSize" type="number" min={1} value={binSize} onChange={(e) => setBinSize(Number(e.target.value))} />
                    </div>
                </div>

                <div className="w-full h-full flex justify-center mt-5">
                    <button className="font-bold bg-gray-400 h-9 w-28 rounded-md hover:bg-gray-200 p-2" type="submit">Submit</button>
                </div>
            </form>
            {imageUrl && (
                <div style={{ marginTop: 24 }}>
                    <h2>Plot Result</h2>
                        <div style={{ maxHeight: '50vh', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', padding: 8 }}>
                            <Image
                                src={imageUrl}
                                alt="Plot"
                                width={3000}
                                height={3000}
                                style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', objectPosition: 'top' }}
                            />
                        </div>
                    <div className="w-full flex justify-center mt-5">
                        <button 
                            onClick={handleSaveImage} 
                            disabled={isSaving}
                            style={{ cursor: isSaving ? "not-allowed" : "pointer" }}
                            className="font-bold bg-gray-400 h-18 w-36 rounded-md hover:bg-gray-200 p-2"
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
            {parsedJson && typeof parsedJson === "object" && (
                <div className="w-[75%]" style={{ marginTop: 24 }}>
                    <h3>View Raw Data Table</h3>
                    <JsonViewer data={parsedJson} />
                </div>
            )}
        </div>
    );
}