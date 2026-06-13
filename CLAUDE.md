# Blumen Lumen — Claude Code Instructions

Kinetic flower sculpture donated by YC Sun to Stanford d.school in 2026.
Full docs: `README.md` (this repo) or https://github.com/yichengsun/blumen-lumen

## This repo is the canonical source

Everything lives in `yichengsun/blumen-lumen` on `main`. The old repos
(`FoldHaus/blumen-lumen-ideo`, `ideo/ddl-ipad`) are archived references only.

## Directory layout

```
blumen-lumen/
├── README.md                          # Full technical documentation
├── CLAUDE.md                          # This file
├── Arduino/blumen-motor/              # ESP32 motor controller sketch
│   ├── blumen-motor.ino
│   ├── MotorController.h
│   └── MotorController.cpp
├── backend/                           # Node.js + Socket.IO server (port 80)
│   └── app.js                         # Also serves frontend/build/ statically
├── frontend/                          # React web app source
│   ├── src/Components/Controller.js   # Socket.IO client, slider, mode toggle
│   ├── src/Controllers/States.js      # Color palette data
│   └── build/                         # Pre-built output — what the backend serves
├── MadMapper/Blumen Programs/
│   └── yc-dreamlab-blumen.mad         # Active MadMapper program
└── Startup/
    └── blumen-startup.bat             # Run as Administrator — starts backend on port 80
```

## Branching

All changes go to `main`. No other branches or repos to maintain.

## Key files

| File | Purpose |
|------|---------|
| `Arduino/blumen-motor/blumen-motor.ino` | ESP32 sketch — WiFi, OSC listener, motor control, NTP schedule |
| `backend/app.js` | Node backend — Socket.IO → OSC bridge; serves `frontend/build/` |
| `frontend/src/Components/Controller.js` | React UI — slider, mode toggle, color palette |
| `frontend/src/Controllers/States.js` | Color palette RGB values |
| `Startup/blumen-startup.bat` | NUC startup script |

## Confirmed IPs and ports

| Device | IP | Port |
|--------|----|------|
| Intel NUC (WiFi) | `10.34.87.197` (DHCP — pending IT reservation) | — |
| Intel NUC (Ethernet to PixLite) | `192.168.0.1` (static) | — |
| ESP32 motor controller | `10.34.84.37` (DHCP — pending IT reservation) | 8001 (OSC in) |
| Advatek PixLite | `192.168.0.50` (static) | — |
| MadMapper (on NUC) | `127.0.0.1` | 8000 (OSC in), 9000 (OSC feedback) |
| Node backend (on NUC) | — | 80 (HTTP + Socket.IO + static React) |

## How to start the system

1. Right-click `Startup/blumen-startup.bat` → Run as administrator
   - Opens **one** CMD window: "Blumen Backend" (port 80)
2. MadMapper opens automatically (Windows startup item). If not, open it and load `yc-dreamlab-blumen.mad`.
3. Students visit `http://10.34.87.197` on any phone or laptop — no port number.

## Frontend build workflow

The backend serves the **pre-built** React app. After any frontend code change:

```
cd frontend
npm run build
```

Then restart the backend. Do NOT run `npm start` in the frontend — there is no separate frontend dev server.

## ESP32 notes

- On boot: always retracts to fully closed (~70s calibration), then starts NTP schedule
- Motor movement is blocking (`delay()`) — ESP32 cannot receive new OSC during a move
- Serial commands via Arduino IDE Monitor (115200 baud): `open`, `close`, `0.5`, `status`
- WiFi watchdog built in — auto-reconnects on drop

## Pending actions (not code changes)

1. Ask Stanford IT to reserve NUC MAC `F8:63:3F:26:55:D4` → current DHCP IP `10.34.87.197`
2. Ask Stanford IT to reserve ESP32 MAC `24:0A:C4:EC:A7:64` → current DHCP IP `10.34.84.37`
   - If IT assigns a different IP, update `backend/app.js` line 21: `const oscClientEngine = new Client('<new-IP>', 8001);`
3. Find linear actuator model label on the physical unit
4. (Optional) Rename NUC to `blumenlumen` → students use `http://blumenlumen.local`
5. (Optional) Ask IT for `blumen.stanford.edu` DNS entry
