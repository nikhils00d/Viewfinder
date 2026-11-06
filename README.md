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
Serve frontend and API through the same HTTPS origin, proxy `/api` to Express, and rewrite frontend routes (`/events`, `/admin`, `/admin/login`) to `index.html`. Set `NODE_ENV=production`, `FRONTEND_URL` to the exact public origin, and a strong `JWT_SECRET`. For a separate API origin, set frontend `VITE_API_URL`; both hosts must be same-site for the strict session cookie. MongoDB must be persistent and reachable. Never commit `.env` or administrator credentials. If deploying behind a proxy, configure Express trust proxy for your specific infrastructure so login limits use client IPs.

## Checks
`npm run build` and `npm run lint` in frontend. `node --test` in backend exercises validation, authorization, and password hooks without writing to MongoDB.
