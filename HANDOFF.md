# Blumen Lumen — Session Handoff
*Last updated: 2026-06-12. Pick up from here on the NUC.*

---

## System status: FULLY WORKING

All subsystems tested and confirmed operational at Stanford d.school.

| Subsystem | Status | Notes |
|---|---|---|
| ESP32 motor controller | ✅ Working | Connects to Stanford WiFi, opens/closes correctly, schedule running |
| MadMapper → PixLite → LEDs | ✅ Working | All 12 spokes lit, Art-Net broadcast confirmed |
| Web app | ✅ Working | Mobile-responsive, served on port 80 |
| Backend → ESP32 OSC | ✅ Working | `/1/fader1` commands move the flower |
| Backend → MadMapper OSC | ✅ Working | Cue triggers change LED patterns |
| Startup script | ✅ Working | `blumen-startup.bat` starts backend only (no separate frontend server) |

---

## How to start the system

1. **Run `Startup/blumen-startup.bat` as Administrator** — opens "Blumen Backend" window (port 80)
2. **Open MadMapper** — load `MadMapper/Blumen Programs/yc-dreamlab-blumen.mad` (auto-starts via Windows startup items)
3. **Students visit** `http://10.34.87.197` on any phone/laptop — no port number needed

---

## All known IPs

| Device | Interface | IP | MAC | Notes |
|--------|-----------|-----|-----|-------|
| Intel NUC | WiFi | `10.34.87.197` (DHCP) | `F8:63:3F:26:55:D4` | **Reserve with IT** |
| Intel NUC | Ethernet | `192.168.0.1` (static) | — | Direct cable to PixLite only |
| Advatek PixLite | Ethernet | `192.168.0.50` (static) | `E0-B6-F5-E0-24-8C` | Config at `http://192.168.0.50` |
| ESP32 | WiFi | `10.34.84.37` (DHCP) | `24:0A:C4:EC:A7:64` | **Reserve with IT** |
| MadMapper (on NUC) | loopback | `127.0.0.1` | — | OSC input port 8000 |

**Action needed:** Ask Stanford IT to provision DHCP reservations for NUC (`F8:63:3F:26:55:D4`) and ESP32 (`24:0A:C4:EC:A7:64`) so their IPs don't change.

---

## NUC network config (do not change)

| Adapter | IP | Purpose |
|---------|-----|---------|
| WiFi | `10.34.87.197` (DHCP — reserve with IT) | Web app access, OSC to ESP32 |
| Ethernet | `192.168.0.1` (static, manual) | Art-Net to PixLite only |

**Do not set Ethernet to DHCP** — PixLite won't be reachable.

---

## MadMapper config (confirmed)

- Art-Net: **Broadcast mode**, network interface `192.168.0.1` (Ethernet, not WiFi)
- OSC input port: **8000**
- OSC feedback port: **9000**, feedback IP: **auto**
- Fixtures 1–12 on Art-Net universes 1–12 (PixLite remaps to physical outputs internally)

---

## What still needs doing

1. **Stanford IT**: Reserve NUC WiFi IP for MAC `F8:63:3F:26:55:D4`
2. **Stanford IT**: Reserve ESP32 IP for MAC `24:0A:C4:EC:A7:64` — then update `backend/app.js` line:
   ```js
   const oscClientEngine = new Client('10.34.84.37', 8001); // ← replace with reserved IP
   ```
3. **mDNS** (optional but nice): Rename NUC to `blumenlumen` (Settings → System → About → Rename this PC) → students use `http://blumenlumen.local`
4. **Stanford DNS** (optional): Ask IT for `blumen.stanford.edu` pointing to NUC's reserved IP
5. **Linear actuator**: Find model label on physical unit (still unknown)
6. **Control box photos**: Add to `Datasheets/` once housing is built

---

## Repo

Everything at: **https://github.com/yichengsun/blumen-lumen** (main branch)

```
Arduino/blumen-motor/    ← flashed to ESP32 — reflash only if sketch changes
backend/                 ← npm start (port 80) — also serves built React app
frontend/                ← npm run build after any frontend changes
MadMapper/               ← .mad files
Startup/                 ← blumen-startup.bat
Datasheets/              ← hardware PDFs
```

After any frontend code change:
```
cd frontend
npm run build
```
Then restart the backend — it serves `frontend/build/` automatically.
