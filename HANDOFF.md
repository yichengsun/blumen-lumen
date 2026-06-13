# Blumen Lumen — Session Handoff
*Last updated: 2026-06-12. Pick up from here on the NUC.*

---

## What's working right now

- **ESP32 motor controller** — fully flashed, tested, working
  - Connects to Stanford WiFi automatically
  - Opens and closes correctly via serial commands AND daily schedule
  - MAC: `24:0A:C4:EC:A7:64` — registered with Stanford IT
  - Current DHCP IP: `10.34.84.37` (not yet reserved — pending IT)
  - Sketch on: `github.com/yichengsun/blumen-lumen` main branch → `Arduino/blumen-motor/`

- **Advatek PixLite 16 Long Range** — found and responding
  - Nickname: "Blumen 1", Firmware: V2.0.14
  - IP changed to static: `192.168.0.50`
  - NUC Ethernet set to: `192.168.0.1` / `255.255.255.0`
  - **Advatek LED tester works** — LEDs light up, wiring is correct
  - Web UI (`http://192.168.0.50`) not loading in browser — skip it for now

---

## Currently in progress: MadMapper → PixLite → LEDs

The LED hardware works. The missing link is getting MadMapper to send Art-Net to the PixLite.

### Exact next steps

1. **Open MadMapper** on the NUC — load `yc-dreamlab-blumen.mad`
   - File is at: `blumen-lumen\MadMapper\Blumen Programs\yc-dreamlab-blumen.mad`
   - (once repo is cloned to NUC)

2. **Configure Art-Net output in MadMapper:**
   - Go to Output settings
   - Art-Net destination IP: `192.168.0.50`
   - **Network interface must be set to the Ethernet adapter (`192.168.0.1`), NOT WiFi**
   - This is the most likely gotcha — MadMapper may default to WiFi

3. **Verify universes match** — the PixLite universe assignments need to match what MadMapper sends. Take a screenshot of MadMapper's output config when you find it.

4. **Test** — LEDs should animate when MadMapper is running with Art-Net enabled

---

## NUC network config (important — two adapters)

| Adapter | IP | Purpose |
|---------|-----|---------|
| WiFi | Stanford DHCP (TBD reserved) | Web app access, OSC to ESP32 |
| Ethernet | `192.168.0.1` (static, manual) | Art-Net to PixLite only |

**Do not change the Ethernet adapter back to DHCP** — PixLite won't be reachable.

---

## All known IPs

| Device | IP | Notes |
|--------|-----|-------|
| Intel NUC (WiFi) | TBD | Pending IT DHCP reservation |
| Intel NUC (Ethernet) | `192.168.0.1` | Direct cable to PixLite |
| Advatek PixLite | `192.168.0.50` | Set today via Advatek Assistant |
| ESP32 motor controller | `10.34.84.37` | Current DHCP, not yet reserved |
| MadMapper (on NUC) | `127.0.0.1:8000` | Localhost OSC input |

---

## Repo on GitHub

Everything is at: **https://github.com/yichengsun/blumen-lumen**

Clone to NUC:
```
git clone https://github.com/yichengsun/blumen-lumen.git
```

Key folders:
```
Arduino/blumen-motor/    ← already flashed to ESP32, don't need to re-flash
backend/                 ← npm start (port 80) — update oscClientEngine IP once IT reserves ESP32 IP
frontend/                ← npm start (port 3000)
MadMapper/               ← .mad files
Startup/                 ← blumen-startup.bat (update CD paths after clone)
```

---

## backend/app.js — one line still needs updating

Once IT provides the ESP32's reserved IP, update line 9 of `backend/app.js`:
```js
const oscClientEngine = new Client('TBD', 8001);  // ← replace TBD with ESP32 reserved IP
```
Current DHCP IP is `10.34.84.37` but may change until reserved.

---

## startup.bat — update paths after cloning

`Startup/blumen-startup.bat` still has old IDEO paths. After cloning the repo to the NUC, update the two CD lines to wherever the repo lives, e.g.:
```
CD C:\Users\Dream Lab\Documents\GitHub\blumen-lumen\backend
CD C:\Users\Dream Lab\Documents\GitHub\blumen-lumen\frontend
```

---

## What still needs doing (in order)

1. ✅ Motor controller — done
2. 🔄 **MadMapper → PixLite → LEDs** ← YOU ARE HERE
3. Clone `blumen-lumen` repo to NUC
4. Update `backend/app.js` with ESP32 reserved IP (pending IT)
5. Update `Startup/blumen-startup.bat` with correct paths
6. Run `npm install` in `backend/` and `frontend/`
7. Test full system end-to-end (web app → motor + LEDs)
8. Get Stanford IT to reserve NUC WiFi IP too
