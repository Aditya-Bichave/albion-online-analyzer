# Logging

The app now writes structured JSON-line logs for each process into the shared session folder:

- `logs/current/electron.log`
- `logs/current/backend.log`
- `logs/current/frontend.log`
- `logs/current/session.json`

On the next app start:

- the previous `logs/current/` files are gzipped into `logs/archive/<session-id>/`
- only the 5 most recent archived sessions are kept
- anything older is deleted automatically

## Levels

Supported levels, from most verbose to least:

- `verbose`
- `debug`
- `info`
- `warning`
- `error`

## Environment Variables

- `LOG_LEVEL`
  Default: `info`
- `LOG_PACKET_VERBOSE`
  Default: `false`
  When `true`, raw packet previews are written in verbose mode.
- `LOG_UI_STREAM_LEVEL`
  Default: `info`
  Controls which backend/frontend log records are streamed into the in-app console.
- `LOG_DIR`
  Default: `<project>/logs`

## Suggested Debug Settings

For live-mode packet debugging, use:

```powershell
$env:LOG_LEVEL = 'debug'
$env:LOG_PACKET_VERBOSE = 'true'
$env:LOG_UI_STREAM_LEVEL = 'debug'
```

Then start the app normally and inspect:

- `logs/current/backend.log` for packet capture, decode, and movement tracking
- `logs/current/frontend.log` for websocket receipt and UI state transitions
- `logs/current/electron.log` for process startup and shutdown issues
