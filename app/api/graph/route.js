import { Pool } from "pg";

export const runtime = "nodejs";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || `postgresql://cnc_user:cnc_pass@localhost:5432/cnc_insight`;
let pool;
if (!global._pgPool) {
  global._pgPool = new Pool({ connectionString });
}
pool = global._pgPool;

export async function POST(req) {
  try {
    const body = await req.json();
    const { section_name, attribute_name, data } = body;

    if (!section_name || !attribute_name || !data) {
      return new Response(JSON.stringify({ error: "section_name, attribute_name and data are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const buffer = Buffer.from(data, "base64");

    const result = await pool.query(
      `INSERT INTO files (section_name, attribute_name, data) VALUES ($1, $2, $3) RETURNING id`,
      [section_name, attribute_name, buffer]
    );

    return new Response(JSON.stringify({ id: result.rows[0].id }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("/api/graph POST error:", err);
    return new Response(JSON.stringify({ error: "failed to save file" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export async function GET(req) {
  try {
    // parse optional query params
    const url = new URL(req.url);
    const section = url.searchParams.get("section_name");
    const attribute = url.searchParams.get("attribute_name");

    // Build files query with optional filters
    let filesQuery = `SELECT id, section_name, attribute_name, created_at FROM files`;
    const where = [];
    const values = [];
    if (section) {
      values.push(section);
      where.push(`section_name = $${values.length}`);
    }
    if (attribute) {
      values.push(attribute);
      where.push(`attribute_name = $${values.length}`);
    }
    if (where.length) {
      filesQuery += ` WHERE ` + where.join(" AND ");
    }
    filesQuery += ` ORDER BY created_at DESC`;

    const filesResult = await pool.query(filesQuery, values);

    // Build distinct filter pairs (unique section/attribute combinations)
    const filtersResult = await pool.query(`SELECT DISTINCT section_name, attribute_name FROM files ORDER BY section_name, attribute_name`);

    const files = filesResult.rows.map((r) => ({
      id: r.id,
      section_name: r.section_name,
      attribute_name: r.attribute_name,
      created_at: r.created_at,
      url: `/api/file/${r.id}`,
    }));

    const filters = filtersResult.rows.map((r) => ({ section_name: r.section_name, attribute_name: r.attribute_name }));

    return new Response(JSON.stringify({ files, filters }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    console.error("/api/graph GET error:", err);
    return new Response(JSON.stringify({ error: "failed to list files" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
