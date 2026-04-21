# Agent Instructions for Albion Online Analyzer

Welcome, autonomous agent! This repository contains the Albion Online Analyzer, an Electron-based desktop app for exploring Albion resource and player-state behavior.

As an agent working on this repository, you **must** adhere strictly to the guidelines and context provided below to ensure changes are robust, safe, and aligned with the project's architecture.

## 1. Project Overview & Architecture

The application is built with:
- **Electron (`main.js`)**: Acts as the bootstrap and child-process supervisor.
- **Backend (`backend/`)**: A Node.js environment featuring a WebSocket server, simulation mode, packet sniffer, and decoder logic.
- **Frontend (`frontend/`)**: A React application (built with Vite) that provides an interactive map and UI.
- **Logging (`logging/`)**: Structured logging with session rotation.
- **Graphify (`graphify-out/`)**: Committed knowledge-graph outputs.

**Important**:
- **Safety Note**: Live packet inspection can be sensitive from a game policy perspective. This repository keeps simulation mode available as the safe fallback. Do not introduce OCR, Tesseract, or external map-scraping runtime dependencies.

## 2. Agent Onboarding & Code Navigation

Before beginning broad exploration or making significant architectural changes, you **must**:
1. Read `graphify-out/GRAPH_REPORT.md`.
2. Use the committed graph outputs as your first-pass architecture map.
3. Review the "God Nodes" (e.g., `PacketSniffer`, `PhotonProtocol18Deserializer`, `BufferCursor`) and "Community Hubs" outlined in the report to understand core abstractions.

### Refreshing Graphify
If you make substantial structural changes and need to update the graph:
- You can attempt a safe local refresh via `RunGraphify.bat` (Windows) or `python scripts/run_graphify_refresh.py`.
- If the script refuses to overwrite due to uncached non-code files, you should run the graphify skill or `/graphify .` in your coding assistant environment for a full semantic rebuild.

## 3. Environment Setup & Dependencies

When testing or running the application, use the following manual setup commands if you are not using the Windows `.bat` scripts:

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
python -m pip install -r requirements.txt
```

Environment variables are defined in `.env.example`. Key variables include:
- `RADAR_MODE=simulation` (Default safe mode)
- `LOG_LEVEL=info`
- `LOG_PACKET_VERBOSE=false`
- `LOG_UI_STREAM_LEVEL=info`

## 4. Testing and Validation

You **must** validate your changes before finalizing any task. Use the provided validation script:

```bash
npm run check
```
This runs:
- `node --check main.js`
- `node --check backend/server.js`
- `node --check backend/sniffer.js`
- `node --check backend/simulator.js`
- `npm --prefix frontend run build`
- `npm --prefix frontend run lint`

Ensure all these checks pass without errors.

## 5. Logging

Structured logs are written to `logs/current/` (e.g., `electron.log`, `backend.log`, `frontend.log`).
If you need deeper live-mode debugging, adjust the environment variables:
- `LOG_LEVEL=debug`
- `LOG_PACKET_VERBOSE=true`
- `LOG_UI_STREAM_LEVEL=debug`

Always ensure any new components you add utilize the existing structured logging mechanisms appropriately rather than relying solely on `console.log`.

## 6. General Directives
- **Do not edit build artifacts**. Only modify source code.
- **Verify after every change**. Use tools like `cat`, `ls`, or test commands to ensure your changes were applied correctly and had the intended effect.
- **Diagnose before modifying the environment**. If a test fails, check code and configuration first before attempting to change dependencies.