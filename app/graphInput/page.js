"use client";

import { useGraphOptions } from "../context/GraphOptionsContext";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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

        // number of pallets available for the current process (guarded)
        const processPalletCount = graphOptions?.[currentProcess]?.[0] ?? 1;

            // Note: attribute default shown is derived when rendering (attribute || attributesForProcess[0])

    function handleSubmit(e) {
        e.preventDefault();
            const options = {
                process: currentProcess,
                attribute: attribute || attributesForProcess?.[0] || "",
                startPallet,
                totalPallets,
                binSize,
            };
        // save to global state so other pages can use it
        setGraphOptions((prev) => ({ ...(prev || {}), options }));
        // navigate to wherever you want; here we'll go back to home
        router.push("/");
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
        </div>
    );
}