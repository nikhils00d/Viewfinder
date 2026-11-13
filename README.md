# Viewfinder
Confluenz photography club introduction and public Google Drive event directory.

## Local setup
Requires Node.js and a MongoDB database.

1. In `backend`, run `npm install`, copy `.env.example` to `.env`, and set `MONGO_URI`, a strong random `JWT_SECRET`, and `NODE_ENV=development`.
2. Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (at least 12 characters) in your local environment, then run `node makeAdmin.js` from `backend`. This creates or resets that administrator. No default credentials are shipped. Remove ADMIN_PASSWORD from the environment after provisioning.
3. Start the API with `npm run dev` from `backend`.
4. In `frontend`, run `npm install` and `npm run dev`. Vite proxies `/api` to localhost:5000.
5. Double-click **Confluenz** in the landing page footer, or open `/admin/login`. Public registration is disabled.

## Managing content
- Events: title, date, Google Drive URL, description, searchable tags, folder artwork, draft/published status, pin and numeric pin order. Lower pin orders display first. Unpinned events sort newest first. Published events only are returned by the public API.
- Photo walks: exactly eight fixed slots preserve the current gallery layout and motion. Each can be replaced with a title, direct HTTPS thumbnail image URL, destination URL, location, and date label. Destination links can be Instagram posts, Drive folders, or any HTTPS page. Images remain externally hosted; Google Drive sharing pages are not direct image URLs.
- Unconfigured photo walk slots retain the original demonstration images and inspection interaction until a real destination is saved. No placeholder links are invented. Add your eight real destinations in the dashboard.
- Event links open Google Drive; configure sharing permissions in Drive. The website stores only metadata and links, never the photo collections.

## Deployment
Serve frontend and API through the same HTTPS origin, proxy `/api` to Express, and rewrite frontend routes (`/events`, `/admin`, `/admin/login`) to `index.html`. Set `NODE_ENV=production`, `FRONTEND_URL` to the exact public origin, and a strong `JWT_SECRET`. For a separate API origin, set frontend `VITE_API_URL`; use HTTPS for both hosts; production sessions use HttpOnly, Secure, SameSite=None cookies. Browser policies that block third-party cookies may still require a same-site API proxy. MongoDB must be persistent and reachable. Never commit `.env` or administrator credentials. If deploying behind a proxy, configure Express trust proxy for your specific infrastructure so login limits use client IPs.

## Checks
`npm run build` and `npm run lint` in frontend. `node --test` in backend exercises validation, authorization, and password hooks without writing to MongoDB.

## Reliability and interface improvements
The archive includes year filters, shareable search URLs (`/events?q=festival&year=2026`), tag filtering, nine events per page, and direct folder links to Drive. The mobile menu supports Escape; photo previews support keyboard navigation, Escape, focus containment and focus restoration. The carousel keeps its wheel motion and supports touch dragging. Broken external thumbnails display a fallback.

Admin forms show unsaved changes, warn before leaving through dashboard links or closing the browser, preview event folder artwork, and preserve edits in other photo walk slots when saving. Browser Back may still leave an unsaved dashboard; save before navigating away. Network requests time out and expose retry/error states.

Contact email requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and optionally CONTACT_RECIPIENT in backend/.env. Without SMTP credentials, the form reports that delivery is unavailable rather than reporting success. Chitraka is managed through Events & collections: choose Chitraka under Publish to. It shares the draft, publication, pin, search and Drive-link workflow; demonstration collections are no longer presented as real content.

The API refuses to start with the shipped example JWT secret, validates calendar dates and allowed URLs, limits request size, and disables admin response caching. Local development permits loopback origins on alternate Vite ports; production permits the exact Vercel frontend origin https://viewfinderconfluenz.vercel.app and FRONTEND_URL. The health endpoint `/api/health` reports database readiness. No automatic tests send email or modify the configured MongoDB database.

## Vercel cross-origin sessions
Set backend `NODE_ENV=production` and `FRONTEND_URL=https://viewfinderconfluenz.vercel.app`. Set frontend `VITE_API_URL` to the HTTPS backend origin (without `/api`) and rebuild/redeploy the frontend. Express trusts one reverse proxy hop; verify this matches your hosting topology. Production login and logout use the same cookie path and cross-site attributes. All authentication and admin requests use the shared API client, which enforces `credentials: include`. Login verifies `/api/admin/me` before navigating to the dashboard. The dashboard waits for its session check before rendering or redirecting; network failures display an error instead of redirecting. A browser that blocks third-party cookies entirely can still prevent cross-site sessions; use a same-site `/api` proxy or related custom domains in that case.
