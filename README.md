# Lapsr

Focus timer with expiring credits: a weekly/monthly budget of focus sessions, claimable only inside a daily 5-hour window. Miss the day's share and it's forfeited. Single static PWA, local-only, no backend.

Live: **https://mehdi-hossaini.github.io/Lapsr/**

## Run

```bash
python3 -m http.server 8080   # serve over http:// so the service worker registers
# open http://localhost:8080
```

Self-check: `http://localhost:8080/?test=1` → console prints `Lapsr self-check passed`.

## Data

Lives in the browser only. Move it via **Plan → Backup & transfer → Export / Import** (JSON file). No sync.
