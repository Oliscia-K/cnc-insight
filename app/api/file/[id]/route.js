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
    // In Next.js route handlers `params` can be a promise; await it before accessing properties
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: { "content-type": "application/json" } });
    }
    const result = await pool.query(`SELECT section_name, attribute_name, data, created_at FROM files WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "content-type": "application/json" } });
    }

    const row = result.rows[0];
    const buffer = row.data;
    // Table no longer stores filename/content_type; create a sensible filename and default content type
    const section = row.section_name || "section";
    const attr = row.attribute_name || "attribute";
    const filename = `${section}_${attr}_${id}.png`;
    const contentType = "image/png";

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
