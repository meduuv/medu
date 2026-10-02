const SOURCE = "https://guns.lol/meduu";

const SOCIAL_HOSTS = [
  "github.com", "discord.com", "discord.gg", "instagram.com", "x.com",
  "twitter.com", "tiktok.com", "youtube.com", "youtu.be", "spotify.com",
  "soundcloud.com", "telegram.me", "t.me", "twitch.tv", "reddit.com",
  "roblox.com", "steamcommunity.com", "linkedin.com", "threads.net"
];

function decode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstream = await fetch(SOURCE, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MeduPortfolio/2.0)",
        "Accept": "text/html,application/xhtml+xml"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12000)
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Source unavailable" });
    }

    const html = await upstream.text();
    const socials = [];
    const seen = new Set();
    const links = html.match(/<a\\b[^>]*href=(["'])(.*?)\\1[^>]*>/gi) || [];

    for (const link of links) {
      const match = link.match(/href=(["'])(.*?)\\1/i);
      if (!match) continue;
      let href = decode(match[2]).trim();
      try {
        const url = new URL(href, SOURCE);
        const host = url.hostname.replace(/^www\\./, "").toLowerCase();
        if (!SOCIAL_HOSTS.some((allowed) => host === allowed || host.endsWith("." + allowed))) continue;
        const normalized = url.toString();
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        socials.push({ host, url: normalized });
      } catch {}
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).json({ source: SOURCE, updatedAt: new Date().toISOString(), socials });
  } catch {
    return res.status(502).json({ error: "Unable to sync source data" });
  }
}