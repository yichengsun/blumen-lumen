# Blumen Lumen — Claude Code Instructions

Kinetic flower sculpture donated by YC Sun to Stanford d.school in 2026.
Full docs and code: https://github.com/yichengsun/blumen-lumen

## This repo IS the canonical source

Everything lives in `yichengsun/blumen-lumen` — one repo, one branch (`main`), no dependencies on FoldHaus or IDEO org access. The old repos (`FoldHaus/blumen-lumen-ideo`, `ideo/ddl-ipad`) are archived references only.

## Directory layout

```
blumen-lumen/
├── DOCUMENTATION.md / README.md   # Student-facing docs
├── CLAUDE.md                      # This file — Claude Code context
├── Arduino/blumen-motor/          # ESP32 motor controller sketch
│   ├── blumen-motor.ino
│   ├── MotorController.h
│   └── MotorController.cpp
├── backend/                       # Node.js + Socket.IO server (port 80)
│   └── app.js
├── frontend/                      # React web app (port 3000)
│   └── src/Components/Controller.js
├── MadMapper/                     # MadMapper .mad program files
│   └── Blumen Programs/yc-dreamlab-blumen.mad
└── Startup/
    └── blumen-startup.bat         # NUC autostart script
```

## Branching

- All changes go to `main` of `yichengsun/blumen-lumen`
- No other branches or repos to maintain

## Key files

| File | Purpose |
|------|---------|
| `Arduino/blumen-motor/blumen-motor.ino` | ESP32 sketch — WiFi, OSC listener, motor control, NTP schedule |
| `backend/app.js` | Node backend — Socket.IO → OSC bridge |
| `frontend/src/Components/Controller.js` | React UI — slider, mode toggle, color palette |
| `Startup/blumen-startup.bat` | NUC startup script — opens backend + frontend windows |

## IPs and ports (pending Stanford IT DHCP reservations)

| Device | IP | Port |
|--------|----|------|
| Intel NUC (WiFi) | TBD | — |
| Intel NUC (Ethernet to PixLite) | TBD | — |
| ESP32 motor controller | TBD (DHCP-reserved) | 8001 (OSC in) |
| Advatek PixLite | TBD | — |
| MadMapper (on NUC) | 127.0.0.1 | 8000 (OSC in) |
| Node backend (on NUC) | — | 80 (HTTP/Socket.IO) |
| React frontend (on NUC) | — | 3000 (HTTP) |

Once IT provides the ESP32's reserved IP, update `backend/app.js`:
```js
const oscClientEngine = new Client('<ESP32-IP>', 8001);
```
Everything else is already correct — MadMapper uses `127.0.0.1`, frontend uses `window.location.hostname`.

## Startup behavior (important)

- **`blumen-startup.bat`**: opens two named CMD windows — "Blumen Backend" (port 80) and "Blumen Frontend" (port 3000). Must be run as Administrator for port 80 to bind.
- **MadMapper**: launches automatically via Windows startup items. If not open, load `MadMapper/Blumen Programs/yc-dreamlab-blumen.mad` manually.
- **ESP32 on boot**: always retracts to fully closed (~70s), then starts NTP schedule. UI slider initializes at 0 to match.

## Pending TODOs (high priority)

- Fill in MAC addresses and DHCP-reserved IPs in DOCUMENTATION.md
- Update `backend/app.js` `oscClientEngine` IP with ESP32's reserved IP once IT provides it
- Flash `Arduino/blumen-motor/blumen-motor.ino` to ESP32 via USB
- Recalibrate `FULL_PERIOD` in `blumen-motor.ino` at the Stanford location (currently 70500ms from IDEO install)
- Rename NUC computer name to `blumenlumen` for mDNS (`http://blumenlumen.local`)
- Update `Startup/blumen-startup.bat` CD paths to match wherever the repo is cloned on the NUC
