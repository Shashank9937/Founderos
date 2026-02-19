# FounderOS First Website (Original)

This folder contains the original first website version (separate from the newer React/Vite version).

## Run locally

```bash
cd /Users/shashankmishra/Documents/FounderOS-FirstWebsite
npm install
npm start
```

Then open: http://localhost:3000

## Notes

- Frontend is `index.html` + `app.js` + `styles.css`
- Data is saved in SQLite at `data/founder-os.db`
- On first run, legacy `data/founder-os-state.json` is auto-migrated into SQLite
- Backend API is served by `server.js`
- DB health endpoint: `GET /api/db/status`

## Render deploy notes

- This repo now includes `render.yaml` for Docker deploys.
- Keep a persistent disk mounted and set `DB_PATH` to that disk, default: `/var/data/founder-os.db`
- Use `Pull Sync` and `Push Sync` in the UI to sync local browser data with the server database
