import path from "path";
import { Pool } from "pg";

// Ensure this route runs on the Node runtime (so fs and pg are available)
export const runtime = "nodejs";

// Reuse pool across invocations in serverless environments
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || `postgresql://cnc_user:cnc_pass@localhost:5432/cnc_insight`;
let pool;
if (!global._pgPool) {
  global._pgPool = new Pool({ connectionString });
}
pool = global._pgPool;

export async function POST(req) {
  try {
    const body = await req.json();
    const { filename, data } = body || {};
    if (!filename || !data) {
      return new Response(JSON.stringify({ error: "filename and data are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Basic filename sanitization: remove path chars and keep safe characters
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");

    // data may be a data URL like 'data:...;base64,XXXXX' or raw base64
    let contentType = null;
    let base64 = data;
    if (typeof data === "string" && data.startsWith("data:")) {
      const match = data.match(/^data:([^;]+);base64,(.*)$/s);
      if (match) {
        contentType = match[1];
        base64 = match[2];
      } else if (data.includes(",")) {
        base64 = data.split(",")[1];
      }
    }

    const buffer = Buffer.from(base64, "base64");

    /*const insert = await pool.query(
      `INSERT INTO files (filename, content_type, data) VALUES ($1, $2, $3) RETURNING id`,
      [safeName, contentType, buffer]
    );

    const id = insert.rows[0].id;
    const publicUrl = `/api/file/${id}`;*/

    // Call external R plumber API (/parse) with multipart/form-data
    const R_BASE = process.env.R_API_URL || "http://127.0.0.1:19306";
    let rResult = null;
    try {
      const form = new FormData();
      // Create a Blob from the file buffer so FormData can send it with a filename
      const blob = new Blob([buffer], { type: contentType || "application/octet-stream" });
      form.append("input_file", blob, safeName);

      const rRes = await fetch(`${R_BASE}/parse`, {
        method: "POST",
        body: form,
      });

      if (!rRes.ok) {
        const text = await rRes.text();
        console.error("R API returned non-OK:", rRes.status, text);
      } else {
        // try to parse JSON result; if not JSON, leave rResult null
        try {
          rResult = await rRes.json();
        } catch (e) {
          rResult = await rRes.text();
        }
        console.log("R API result:", rResult);
      }
    } catch (err) {
      console.error("Failed to call R API:", err);
    }

    return new Response(JSON.stringify(rResult), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("app/api/upload DB error:", err);
    return new Response(JSON.stringify({ error: "upload failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
