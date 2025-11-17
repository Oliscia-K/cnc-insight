import { Pool } from "pg";

export const runtime = "nodejs";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || `postgresql://cnc_user:cnc_pass@localhost:5432/cnc_insight`;
let pool;
if (!global._pgPool) {
  global._pgPool = new Pool({ connectionString });
}
pool = global._pgPool;

export async function GET(req, { params }) {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const result = await pool.query(`SELECT filename, content_type, data FROM files WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "content-type": "application/json" } });
    }

    const row = result.rows[0];
    const buffer = row.data;
    const contentType = row.content_type || "application/octet-stream";
    const filename = row.filename || `file_${id}`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "content-type": contentType,
        "content-disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (err) {
    console.error("app/api/file GET error:", err);
    return new Response(JSON.stringify({ error: "failed to retrieve file" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
