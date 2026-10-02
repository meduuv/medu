const LANYARD = "https://api.lanyard.rest/v1/users/";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = process.env.DISCORD_ID;
  if (!id || !/^\\d{17,20}$/.test(id)) {
    return res.status(200).json({ ok: false, error: "DISCORD_ID is not configured" });
  }

  try {
    const response = await fetch(LANYARD + id, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return res.status(502).json({ ok: false, error: "Presence unavailable" });
    const json = await response.json();
    return res.status(200).json({ ok: true, data: json.data });
  } catch {
    return res.status(502).json({ ok: false, error: "Presence unavailable" });
  }
}