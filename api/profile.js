import * as cheerio from "cheerio";

const PROFILE_URL = "https://guns.lol/meduu";

const REMOVE_SELECTORS = [
  "script[src*='googlesyndication']",
  "script[src*='doubleclick']",
  "iframe[src*='doubleclick']",
  "iframe[src*='googlesyndication']",
  "iframe[src*='googleadservices']",
  ".adsbygoogle",
  "[id*='google_ads']",
  "[class*='google-ad']",
  "[id*='advertisement']",
  "[class*='advertisement']",
  "[id*='ad-container']",
  "[class*='ad-container']",
  "[data-ad]",
  "[data-ad-slot]"
];

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).send("Method not allowed");
  }

  try {
    const upstream = await fetch(PROFILE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MeduProfileMirror/1.0)",
        "Accept": "text/html,application/xhtml+xml"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12000)
    });

    if (!upstream.ok) {
      return res.status(502).send("The source profile is temporarily unavailable.");
    }

    const html = await upstream.text();
    const $ = cheerio.load(html);

    for (const selector of REMOVE_SELECTORS) {
      $(selector).remove();
    }

    // Remove common ad-network and ad-injection scripts without touching profile scripts.
    $("script[src]").each((_, element) => {
      const src = ($(element).attr("src") || "").toLowerCase();
      if (/(adsystem|adservice|adserver|doubleclick|googlesyndication|googleadservices)/.test(src)) {
        $(element).remove();
      }
    });

    // Resolve source-relative assets and links while keeping the source page's own styling.
    $("head").prepend('<base href="https://guns.lol/">');
    $("head").append(`
      <style id="medu-ad-free-overrides">
        html, body { min-height: 100% !important; }
        [class*="advertisement"], [id*="advertisement"],
        [class*="ad-container"], [id*="ad-container"],
        .adsbygoogle, [data-ad], [data-ad-slot] { display: none !important; }
      </style>
    `);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return res.status(200).send($.html());
  } catch (error) {
    return res.status(502).send("Unable to sync the source profile right now.");
  }
};