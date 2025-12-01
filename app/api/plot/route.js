export const runtime = "nodejs";

// POST endpoint to call R /plot and return image
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      section_name = "29101_PROBE PART3246",
      attribute_name = "PROBED.3246.DIAM..",
      start_index = 1,
      num_pallets = 10,
      bins = 30,
    } = body || {};

    // Call R plumber /plot endpoint
    const R_BASE = process.env.R_API_URL || "http://127.0.0.1:19306";
    const rRes = await fetch(`${R_BASE}/plot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_name,
        attribute_name,
        start_index,
        num_pallets,
        bins,
      }),
    });

    if (!rRes.ok) {
      const text = await rRes.text();
      return new Response(text, { status: rRes.status, headers: { "content-type": "text/plain" } });
    }

    // Assume R returns image/png or image/jpeg
    const contentType = rRes.headers.get("content-type") || "image/png";
    const imageBuffer = await rRes.arrayBuffer();
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "content-type": contentType,
        "content-disposition": `inline; filename=plot.png`,
      },
    });
  } catch (err) {
    console.error("/api/plot error:", err);
    return new Response("Plot API error", { status: 500 });
  }
}