"use client";

import { useState } from "react";

export default function FileUploadPage() {
	const [file, setFile] = useState(null);
	const [status, setStatus] = useState("");
	const [uploadedUrl, setUploadedUrl] = useState(null);

	function handleChange(e) {
		setFile(e.target.files?.[0] ?? null);
		setUploadedUrl(null);
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
			setUploadedUrl(body.url);
			setStatus("Upload complete");
		} catch (err) {
			console.error(err);
			setStatus("Upload failed: " + (err.message || err));
		}
	}

	return (
		<div style={{ padding: 20 }}>
			<h1>Upload a file</h1>
			<input type="file" onChange={handleChange} />
			<div style={{ marginTop: 12 }}>
				<button onClick={handleUpload} disabled={!file}>
					Upload
				</button>
			</div>

			{status && (
				<div style={{ marginTop: 12 }}>
					<strong>Status:</strong> {status}
				</div>
			)}

			{uploadedUrl && (
				<div style={{ marginTop: 12 }}>
					<strong>Uploaded:</strong>{" "}
					<a href={uploadedUrl} target="_blank" rel="noreferrer">
						{uploadedUrl}
					</a>
				</div>
			)}
		</div>
	);
}
