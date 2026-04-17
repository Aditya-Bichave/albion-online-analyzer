# Albion Online Analyzer

Albion Online Analyzer is an Electron-based desktop app for exploring Albion
resource and player-state behavior with:

- a live packet-sniffing backend
- a safe simulation mode
- a React/Vite frontend
- structured rotating logs
- committed graphify knowledge-graph outputs for faster agent onboarding

## Safety Note

Live packet inspection can be sensitive from a game policy perspective. This
repository keeps simulation mode available as the safe fallback and does not
ship OCR, Tesseract, or external map-scraping runtime dependencies.

## Repository Layout

- `main.js`: Electron bootstrap and child-process supervision
- `backend/`: WebSocket server, simulator, packet sniffer, decoder logic
- `frontend/`: React app and interactive map
- `logging/`: structured logger and log-session rotation
- `graphify-out/`: committed graph report, graph JSON/HTML, and graph cache
- `third_party/`: reference-only external material

## Quick Start

### Windows setup

1. Double-click `SetupEnvironment.bat`
2. Review `.env.example` and adjust environment variables if needed
3. Double-click `start.bat`

### Manual setup

```powershell
npm install
cd backend
npm install
cd ..\frontend
npm install
cd ..
python -m pip install -r requirements.txt
```

## Environment Variables

Copy `.env.example` to `.env` if you want a local file for overrides.

- `RADAR_MODE=simulation`
- `LOG_LEVEL=info`
- `LOG_PACKET_VERBOSE=false`
- `LOG_UI_STREAM_LEVEL=info`
- `LOG_DIR=logs`

## Logging

Structured logs are written to:

- `logs/current/electron.log`
- `logs/current/backend.log`
- `logs/current/frontend.log`
- `logs/current/session.json`

When the app restarts, the previous session is gzipped into `logs/archive/`.
Only the latest five archived sessions are retained.

For deeper live-mode debugging:

```powershell
$env:LOG_LEVEL = "debug"
$env:LOG_PACKET_VERBOSE = "true"
$env:LOG_UI_STREAM_LEVEL = "debug"
```

## Graphify

This repository intentionally commits graphify outputs so future contributors and
agents can onboard faster.

Committed outputs:

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/graph_summary.json`
- `graphify-out/cache/`

To attempt a safe local refresh, double-click `RunGraphify.bat`.

The helper script will:

- reuse fresh AST extraction for code files
- reuse cached semantic graph data for non-code files
- refuse to overwrite the committed graph if uncached non-code files would make
  the refresh incomplete

If that happens, run the graphify skill or `/graphify .` in the coding assistant
for a full semantic rebuild.

## Validation Commands

```powershell
node --check main.js
node --check backend/server.js
node --check backend/sniffer.js
node --check backend/simulator.js
npm --prefix frontend run build
npm --prefix frontend run lint
```

Or run:

```powershell
npm run check
```

## Autonomous Agents

The canonical agent instructions live in `AGENTS.md`.

Agents should read `graphify-out/GRAPH_REPORT.md` before broad exploration and
use the committed graph outputs as the first-pass architecture map.

## License

This repository is licensed under the MIT License. See `LICENSE`.

Reference-only third-party materials are documented in
`THIRD_PARTY_NOTICES.md`.
