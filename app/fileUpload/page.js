"use client";

import { useState } from "react";
import getGraphOption from "../helperFunctions/getGraphOptions";
import { useRouter } from 'next/navigation';
import { useGraphOptions } from "../context/GraphOptionsContext";

export default function FileUploadPage() {
	const [file, setFile] = useState(null);
	const [status, setStatus] = useState("");
	const router = useRouter();
	const { setGraphOptions, setParsedJson } = useGraphOptions();
	function handleChange(e) {
		setFile(e.target.files?.[0] ?? null);
		setStatus("");
	}

	async function handleUpload() {
		if (!file) return setStatus("Select a file first.");
		setStatus("Reading file...");

		// Read file as data URL then strip header to get base64
		const dataUrl = await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = (e) => reject(e);
			reader.readAsDataURL(file);
		});

		setStatus("Uploading...");

		const base64 = typeof dataUrl === "string" ? dataUrl : "";
		try {
			const res = await fetch("/api/upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ filename: file.name, data: base64 }),
			});

			const body = await res.json();
			if (!res.ok) throw new Error(body?.error || "Upload failed");
			console.log("Upload response:", body);
			setStatus("Upload complete");
			// store the parsed JSON returned by the R /parse endpoint so other pages can use it
			if (setParsedJson) setParsedJson(body);
			const graphOptions = getGraphOption(body);
			// save to global state so /graphInput can read it
			setGraphOptions(graphOptions);
			router.push("/graphInput");
            
		} catch (err) {
			console.error(err);
			setStatus("Upload failed: " + (err.message || err));
		}
	}

	return (
		<div className=" h-screen w-screen flex flex-col justify-center items-center p-6 bg-black text-zinc-50">
			<button className="self-start font-bold bg-gray-400 h-9 w-24 rounded-md hover:bg-gray-200 p-2" onClick={() => router.push("/")}>
                Home
            </button>
			<h1 className="font-bold text-2xl mb-8">Upload .OUT File to Process</h1>
			<input 
				className="bg-gray-800 rounded-md mb-4 p-2 font-medium hover:bg-gray-600 w-[700px]"
				type="file" 
				onChange={handleChange} 
			/>
			<div className="bg-white text-black rounded-md p-2 hover:bg-gray-400">
				<button onClick={handleUpload} disabled={!file}>
					Upload
				</button>
			</div>

			{status && (
				<div className="font-bold text-2xl" style={{ marginTop: 12 }}>
					<strong>Status:</strong> {status}
				</div>
			)}

		</div>
	);
}
