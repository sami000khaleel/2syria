# Deploying 2Syria on Render (one service: Express API + React app)

## Locally
```bash
cp server/example.env server/.env      # fill it in
npm run build                          # builds browser/dist and installs server deps
npm start                              # http://localhost:3000  (app + /api)
```
For development with hot reload run `npm run dev:server` and `npm run dev:client`
(Vite proxies `/api` to `localhost:3000`).

## Render
Either **New > Blueprint** (uses `render.yaml`) or **New > Web Service**:

| Setting | Value |
|---|---|
| Root directory | *(empty — repo root)* |
| Build command | `npm run build` |
| Start command | `npm start` |
| Health check path | `/api/health` |
| Environment | every variable from `server/example.env` |

The server serves `browser/dist` and sends `index.html` for every non-`/api` route,
so refreshing `/map` or `/login` works.

## Notes
- The AI image search is optional at runtime: if `SIMILARITY_URL` is empty, asleep or down,
  users get "the AI image search service is not available right now".
- Uploaded images are forwarded to the AI service from memory — nothing is saved,
  so the old `server/uploads/` folder can be deleted.
- Place photos: see "Photos on R2" below.

## Photos on R2 (one time)
The bucket stays **private**. The server reads each photo from R2 and streams it to the
browser at `/api/place/image?...` — the browser never contacts R2.

1. Cloudflare > R2 > create a bucket (e.g. `2syria-images`). Leave public access OFF.
2. R2 > Manage R2 API Tokens > create a token with **Object Read & Write** for that bucket.
3. Put `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` in `server/.env`, then:
   ```bash
   cd server
   npm install
   npm run upload-images -- --dry   # preview
   npm run upload-images            # upload (safe to run again — skips what is already there)
   ```
4. Add the same four variables on Render.
   Without them, the server serves `server/data/images` (local development).
