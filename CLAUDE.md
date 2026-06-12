# Blumen Lumen — Claude Code Instructions

Kinetic flower sculpture donated by YC Sun to Stanford d.school in 2026.
Full docs: https://github.com/yichengsun/blumen-lumen

## Directory layout

```
Blumen-IDEO-All/
├── DOCUMENTATION.md          # Student-facing docs (deployed to yichengsun/blumen-lumen)
├── blumen-lumen-ideo/        # Main code repo (FoldHaus/blumen-lumen-ideo, branch: stanford-test)
│   ├── Arduino/blumen-motor/ # ESP32 motor controller sketch
│   ├── iPad/ddl-ipad-backend/# Node.js + Socket.IO backend (runs on NUC)
│   └── Startup/              # blumen-startup.bat (runs on NUC at boot)
└── ddl-ipad/                 # React frontend (separate repo, gitignored here)
    └── src/Components/Controller.js
```

`blumen-lumen-ideo/` and `ddl-ipad/` are gitignored from this directory — they are tracked in their own repos.

## Branching

- All code changes go to the `stanford-test` branch of `FoldHaus/blumen-lumen-ideo`
- Documentation changes go to `main` of `yichengsun/blumen-lumen`
- Do not commit to `main` of `FoldHaus/blumen-lumen-ideo`

## Key files to know

| File | Purpose |
|------|---------|
| `blumen-lumen-ideo/Arduino/blumen-motor/blumen-motor.ino` | ESP32 sketch — OSC listener, motor control, NTP schedule |
| `blumen-lumen-ideo/iPad/ddl-ipad-backend/app.js` | Node backend — receives Socket.IO from browser, sends OSC |
| `ddl-ipad/src/Components/Controller.js` | React UI — slider, mode toggle, color palette |
| `blumen-lumen-ideo/Startup/blumen-startup.bat` | NUC startup script |

## IPs and ports (pending Stanford IT DHCP reservations — all TBD)

| Device | IP | Port |
|--------|----|------|
| Intel NUC (WiFi) | TBD | — |
| Intel NUC (Ethernet to PixLite) | TBD | — |
| ESP32 motor controller | TBD | 8001 (OSC) |
| Advatek PixLite | TBD | — |
| MadMapper (on NUC) | 127.0.0.1 | 8000 (OSC) |
| Node backend (on NUC) | — | 80 (HTTP/Socket.IO) |

Once IT provides IPs, update: `app.js` oscClient/oscClientEngine, `blumen-motor.ino` (no change needed — uses DHCP), `Controller.js` socketIOClient URL.

## Pending TODOs (high priority)

- Fill in MAC addresses and DHCP-reserved IPs in DOCUMENTATION.md
- Update `app.js` `oscClientEngine` IP with ESP32's reserved IP
- Update `app.js` `oscClient` to use `127.0.0.1` (MadMapper is on same machine)
- Update `Controller.js` Socket.IO URL to use `window.location.hostname`
- Flash `blumen-motor.ino` (stanford-test) to ESP32 via USB
- Recalibrate `FULL_PERIOD` at new Stanford location
- Rename NUC computer name to `blumenlumen` for mDNS
