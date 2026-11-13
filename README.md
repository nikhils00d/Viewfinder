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
Serve frontend and API through the same HTTPS origin, proxy `/api` to Express, and rewrite frontend routes (`/events`, `/admin`, `/admin/login`) to `index.html`. Set `NODE_ENV=production`, `FRONTEND_URL` to the exact public origin, and a strong `JWT_SECRET`. Production API requests use the same-origin Vercel rewrite described below, with HttpOnly, Secure, SameSite=Lax cookies. MongoDB must be persistent and reachable. Never commit `.env` or administrator credentials. If deploying behind a proxy, configure Express trust proxy for your specific infrastructure so login limits use client IPs.

## Checks
`npm run build` and `npm run lint` in frontend. `node --test` in backend exercises validation, authorization, and password hooks without writing to MongoDB.

## Reliability and interface improvements
The archive includes year filters, shareable search URLs (`/events?q=festival&year=2026`), tag filtering, nine events per page, and direct folder links to Drive. The mobile menu supports Escape; photo previews support keyboard navigation, Escape, focus containment and focus restoration. The carousel keeps its wheel motion and supports touch dragging. Broken external thumbnails display a fallback.

Admin forms show unsaved changes, warn before leaving through dashboard links or closing the browser, preview event folder artwork, and preserve edits in other photo walk slots when saving. Browser Back may still leave an unsaved dashboard; save before navigating away. Network requests time out and expose retry/error states.

Contact email requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and optionally CONTACT_RECIPIENT in backend/.env. Without SMTP credentials, the form reports that delivery is unavailable rather than reporting success. Chitraka is managed through Events & collections: choose Chitraka under Publish to. It shares the draft, publication, pin, search and Drive-link workflow; demonstration collections are no longer presented as real content.

The API refuses to start with the shipped example JWT secret, validates calendar dates and allowed URLs, limits request size, and disables admin response caching. Local development permits loopback origins on alternate Vite ports; production permits the exact Vercel frontend origin https://viewfinderconfluenz.vercel.app and FRONTEND_URL. The health endpoint `/api/health` reports database readiness. No automatic tests send email or modify the configured MongoDB database.

## Vercel same-origin API proxy
This is a Vite/React SPA, with Vercel Root Directory set to `frontend`. `frontend/vercel.json` forwards `/api/:path*` to `https://viewfinder-b2aa.onrender.com/api/:path*` before applying the SPA fallback. The API prefix is preserved. The browser calls only relative `/api` URLs for all requests, including contact submissions. `VITE_API_URL` is no longer used and can be removed from Vercel settings.

Set Render `NODE_ENV=production`, `FRONTEND_URL=https://viewfinderconfluenz.vercel.app`, `MONGO_URI`, and a strong `JWT_SECRET`. Deploy the backend and redeploy the Vercel frontend after committing these changes. Login/logout cookies are host-only, HttpOnly, Secure in production, SameSite=Lax, Path=/; no Domain attribute is set. Through the rewrite they belong to the frontend host. All frontend fetch requests include credentials. The existing local Vite proxy still forwards `/api` to localhost:5000.

After deployment, verify `/api/health` returns JSON on the Vercel domain and refreshing `/admin/login` loads the SPA. Clear old session cookies or sign out, sign in, and confirm `/api/auth/login` and `/api/admin/me` both use the Vercel domain. The protected dashboard waits for its session check before rendering. Network failures display errors instead of forcing login redirects.
