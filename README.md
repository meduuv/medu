# medu

Full-screen, ad-filtered live mirror of [guns.lol/meduu](https://guns.lol/meduu).

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npx vercel dev
```

Open the local URL printed by Vercel. The mirror fetches the public profile through `/api/profile`, removes common advertising elements server-side, and refreshes the embedded page every 60 seconds.

## Deploy

Import this repository into Vercel and deploy with the default settings. No build command or output directory is required.

## Notes

- Profile content, styling, and assets are fetched from the public source page on each sync.
- Ad filtering is applied before the page is returned to the browser.
- The source site can change its markup or block automated requests; if that happens, the proxy may need its selectors or request headers updated.
- This is a live mirror, not a copy of the account's private settings or analytics.
