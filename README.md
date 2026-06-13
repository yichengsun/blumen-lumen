# Blumen Lumen — Technical Documentation

> A kinetic light sculpture originally built by FoldHaus Collective, premiered Burning Man 2014.
> Donated to Stanford Design School (d.school) by Yicheng (YC) Sun in 2026.
> This document is for students who want to understand, operate, or extend the system.

**System status: Fully working.** All subsystems confirmed operational at Stanford d.school.

---

## Open TODOs

- [ ] Ask Stanford IT to reserve NUC WiFi IP for MAC `F8:63:3F:26:55:D4` (currently `10.34.87.197` by DHCP — will break if it changes)
- [ ] Ask Stanford IT to reserve ESP32 IP for MAC `24:0A:C4:EC:A7:64` (currently `10.34.84.37`) — if a different IP is assigned, update `backend/app.js` line 21
- [ ] Identify the linear actuator model — check the physical unit for a label (brand, stroke length, force rating)
- [ ] Add photos of the fully assembled control box to `Datasheets/` once housing is built
- [ ] Update plaque text once finalized
- [ ] **mDNS (optional)**: Rename NUC to `blumenlumen` (Settings → System → About → Rename this PC) — students can then use `http://blumenlumen.local` instead of an IP
- [ ] **Stanford DNS (optional)**: Ask IT to add `blumen.stanford.edu → NUC reserved IP`

---

## Table of Contents

1. [About This Project](#1-about-this-project)
2. [System Architecture](#2-system-architecture)
3. [Hardware Components](#3-hardware-components)
4. [Wiring & Signal Flow](#4-wiring--signal-flow)
5. [Network Topology](#5-network-topology)
6. [Software Stack](#6-software-stack)
7. [OSC API Reference](#7-osc-api-reference)
8. [How to Start the System](#8-how-to-start-the-system)
9. [How to Hack & Extend](#9-how-to-hack--extend)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. About This Project

### Origin

Blumen Lumen was created by the **[FoldHaus Collective](https://www.foldhaus.com/blumen-lumen)**. It debuted at **Burning Man 2014** as a garden of ten giant origami flowers, 15–22 feet tall, that bloomed in response to people's presence and moved with the wind.

> *"A garden of ten giant origami flowers that bloom in the presence of people and move with the wind, creating a magical experience for their visitors."*
> — FoldHaus Collective

The flowers are built from corrugated polypropylene petals, a steel and aluminum internal mechanism, PVC pipe stems, and a linear actuator that drives the open/close motion. The petal geometry was CNC-routed from corrugated plastic sheet, using a Miura-ori fold pattern.

**Collaborators and supporters:** Black Rock Arts Foundation, IDEO, Kickstarter campaign backers.

### Exhibition History

| Year | Venue | Location |
|---|---|---|
| 2014 | Burning Man (premiere, 10 flowers) | Black Rock Desert, NV |
| 2016 | Exploratorium | San Francisco, CA |
| 2016 | SF City Hall Centennial | San Francisco, CA |
| 2017 | Canal Convergence | Scottsdale, AZ |
| 2017 | KANEKO kinetic | Omaha, NE |
| 2017–18 | KANEKO light | Omaha, NE |

Additional appearances: Las Vegas private event, NIMBY, SuperHero Street Fair, Treasure Island Music Festival, Sea of Dreams, BRAF Artumnal.

### This Unit's History

One flower was acquired by **IDEO** (Palo Alto, CA) after Burning Man 2014. IDEO's team adapted it with WiFi-connected electronics, addressable LEDs, and the web-based control interface documented here. In 2026, **Stanford lecturer Yicheng (YC) Sun** donated it to the **Stanford Design School (d.school)**.

### What It Does

Blumen Lumen is a large-scale kinetic sculpture: a plastic flower overhead that opens and closes like an umbrella, with LED strips in each spoke that animate with color. Visitors connect to the local WiFi and control it from a web app.

- Opens and closes mechanically via a linear actuator (0–100% open)
- Animates addressable LED strips with programmable patterns and color palettes
- Accepts real-time control from any browser on the local network
- Follows an autonomous daily schedule when nobody is interacting (opens at 9am, closes at 5pm)

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STANFORD WiFi NETWORK                        │
│                                                                     │
│  ┌──────────────┐    Socket.IO    ┌──────────────────────────────┐  │
│  │ Phone/Laptop │ ─────────────► │  Intel NUC (Windows PC)      │  │
│  │  Web Browser │                │                              │  │
│  │  port 80     │                │  ┌────────────────────────┐  │  │
│  └──────────────┘                │  │  React app (built)     │  │  │
│                                  │  │  served by backend     │  │  │
│                                  │  └────────────────────────┘  │  │
│                                  │                              │  │
│                                  │  ┌────────────────────────┐  │  │
│                                  │  │  Node.js backend       │  │  │
│                                  │  │  port 80 (HTTP + WS)   │  │  │
│                                  │  └───────────┬────────────┘  │  │
│                                  │              │               │  │
│                                  │    OSC UDP   │               │  │
│                                  │  ┌───────────▼────────────┐  │  │
│                                  │  │  MadMapper             │  │  │
│                                  │  │  port 8000             │  │  │
│                                  │  └───────────┬────────────┘  │  │
│                                  └──────────────┼───────────────┘  │
│                                                 │                  │
│            OSC UDP /1/fader1 ◄──────────────────┤                  │
│                 to ESP32 port 8001              │ Art-Net UDP      │
│                                                 │ (Ethernet)       │
│  ┌─────────────────────────┐                    │                  │
│  │  ESP32 (Arduino)        │                    ▼                  │
│  │  port 8001              │         ┌──────────────────────────┐  │
│  │  GPIO 27 → DIR          │         │  Advatek PixLite 16      │  │
│  │  GPIO 13 → PWM          │         │  (Ethernet, direct cable │  │
│  └────────────┬────────────┘         │   to NUC)                │  │
│               │                      └──────────────────────────┘  │
└───────────────┼──────────────────────────────────┼─────────────────┘
                │ 12V + Direction                   │ 5V data
                ▼                                   ▼
    ┌─────────────────────┐           ┌──────────────────────────────┐
    │  Cytron MD30C R2    │           │  LED Strips on Spokes        │
    │  30A Motor Driver   │           │  (WS2812B, 12 × 70 pixels)   │
    └──────────┬──────────┘           └──────────────────────────────┘
               │
               ▼
    ┌─────────────────────┐
    │  Linear Actuator    │
    │  (opens/closes      │
    │   flower petals)    │
    └─────────────────────┘
```

### Key insight for hackers

There are **two separate control systems** running in parallel:
- **Motor system**: ESP32 → Cytron → Linear Actuator (physical open/close)
- **Lighting system**: MadMapper → Advatek PixLite → LED strips (color/animation)

They are coordinated by the backend, but electrically and computationally independent. You can hack one without touching the other.

---

## 3. Hardware Components

### 3.1 Intel NUC (Hub Computer)

| | |
|---|---|
| **Role** | Central computer — runs all software |
| **OS** | Windows |
| **Login** | Username: `Dream Lab` / Password: `123456` |
| **WiFi MAC** | `F8:63:3F:26:55:D4` |
| **WiFi IP** | `10.34.87.197` (DHCP — reserve with IT) |
| **Ethernet IP** | `192.168.0.1` (static, manual — direct link to PixLite only) |
| **Network** | WiFi (Stanford network) + Ethernet (direct to PixLite) simultaneously |

Both network interfaces are active at the same time. **Do not set Ethernet to DHCP** — the PixLite won't be reachable if you do.

---

### 3.2 ESP32-WROOM-32 (Motor Microcontroller)

| | |
|---|---|
| **Role** | Receives OSC commands over WiFi, drives motor controller |
| **Board** | ESP32 DevKit v1 (Espressif ESP32-WROOM-32 module) |
| **WiFi MAC** | `24:0A:C4:EC:A7:64` |
| **WiFi IP** | `10.34.84.37` (DHCP — reserve with IT) |
| **Power** | 5V via USB Micro → onboard 3.3V regulator |
| **Language** | C++ (Arduino framework) |
| **Source** | `Arduino/blumen-motor/blumen-motor.ino` |
| **Datasheet** | https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf |

**Pin assignments:**

| ESP32 GPIO | Connected To | Purpose |
|---|---|---|
| GPIO 27 | Cytron DIR pin | Motor direction (HIGH = retract/close, LOW = extend/open) |
| GPIO 13 | Cytron PWM pin | Motor speed (0 = stop, 255 = full speed) |
| GND | Cytron GND | Shared ground |
| USB Micro | USB wall adapter | Power only |

**Built-in physical controls:**
- `EN` button — resets the ESP32
- `BOOT` button — holds bootloader mode for flashing

**Serial commands** (open Serial Monitor at 115200 baud while connected via USB):

| Command | Action |
|---|---|
| `open` | Move to fully open (1.0) |
| `close` | Move to fully closed (0.0) |
| `0.5` | Move to any position, e.g. 50% |
| `status` | Print current position, WiFi info, and time |

These are useful for debugging without needing the web app or network.

**Arduino IDE setup (one-time):**
1. Download Arduino IDE from https://www.arduino.cc/en/software
2. Open **Tools → Board → Boards Manager**, search `esp32`, install **"esp32" by Espressif Systems**
3. Go to **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
4. Go to **Tools → Port** and select the port that appears when ESP32 is plugged in

> **Pitfall:** The Serial Monitor must be **closed** before uploading — they share the serial port. Close it, upload, then reopen.

> **Serial Monitor baud rate:** Always use **115200** to match `Serial.begin(115200)` in the sketch.

**To re-flash the ESP32:**
1. Close the Serial Monitor
2. Connect USB cable from ESP32 to your laptop
3. Confirm board is `ESP32 Dev Module` and port is correct
4. Open `Arduino/blumen-motor/blumen-motor.ino`
5. Click Upload

**Getting the MAC address** (if needed):

Flash this minimal sketch, open Serial Monitor at 115200 baud:

```cpp
#include <WiFi.h>
void setup() {
  Serial.begin(115200);
  delay(500);
  WiFi.mode(WIFI_STA);
  Serial.print("MAC address: ");
  Serial.println(WiFi.macAddress());
}
void loop() {}
```

Then re-flash the real sketch.

---

### 3.3 Cytron MD30C R2 (Motor Driver)

| | |
|---|---|
| **Role** | Amplifies ESP32 logic signals to drive the high-current linear actuator |
| **Max current** | 30A continuous |
| **Input voltage** | 12V DC (from PSU1) |
| **Control signals** | 3.3V/5V logic (DIR + PWM from ESP32) |
| **Datasheet** | https://www.cytron.io/p-md30c |
| **User manual** | https://docs.cytron.io/cy-motor-driver/cy-md30c-r2 |

**Control logic (confirmed):**

| DIR pin | PWM pin | Motor action |
|---|---|---|
| LOW | 255 | Extend → flower opens |
| HIGH | 255 | Retract → flower closes |
| Any | 0 | Stop (freeze) |

**Jumper settings (confirmed):**

| Jumper | Setting | Meaning |
|---|---|---|
| PWM SOURCE | `EXT PWM` | ESP32 GPIO 13 controls motor speed |
| Protection | `INT PDT` | Internal peak detection for overcurrent |

---

### 3.4 Linear Actuator

| | |
|---|---|
| **Role** | Converts motor rotation into linear push/pull to open/close the flower |
| **Power** | 12V DC (from Cytron output) |
| **Model** | Unknown — check for label on actuator body |
| **Full travel time** | ~70.5 seconds (`FULL_PERIOD = 70500` ms in sketch — confirmed at Stanford) |

Position is controlled by time: the code calculates how long to run the motor based on the requested open fraction and the known full-travel time. There is **no position sensor** — it's open-loop. If the actuator is moved manually, the ESP32's position tracking will be off until the next full open or close.

**Important:** During movement, the ESP32 uses `delay()` and cannot receive new OSC commands for up to 70 seconds. This is a known limitation noted in the code — a good student improvement project (see [Section 9](#9-how-to-hack--extend)).

> **Note for students:** Adding a limit switch or position encoder would make the system more robust.

---

### 3.5 Advatek PixLite 16 Long Range Mk II v1.1

| | |
|---|---|
| **Role** | Receives Art-Net data from MadMapper and drives LED strips |
| **MAC Address** | `E0-B6-F5-E0-24-8C` |
| **IP Address** | `192.168.0.50` (static, on Ethernet subnet) |
| **Outputs** | 16 × RJ45 (CAT5 differential long-range outputs) |
| **Power** | 5V DC (from PSU2) |
| **Network** | Ethernet — direct cable to Intel NUC |
| **Web config** | `http://192.168.0.50` (connect to NUC Ethernet subnet first) |
| **Manual** | https://www.advateklights.com/downloads/pixlite-16-mkii-user-manual |

**Confirmed output configuration (Advanced mode, 12 active outputs):**

| Physical Output | Art-Net Universe | Pixels |
|---|---|---|
| Output 1 | Universe 6 | 70 |
| Output 2 | Universe 7 | 70 |
| Output 3 | Universe 5 | 70 |
| Output 4 | Universe 8 | 70 |
| Output 5 | Universe 11 | 70 |
| Output 6 | Universe 12 | 70 |
| Output 7 | Universe 10 | 70 |
| Output 8 | Universe 9 | 70 |
| Output 9 | Universe 3 | 70 |
| Output 10 | Universe 4 | 70 |
| Output 11 | Universe 1 | 70 |
| Output 12 | Universe 2 | 70 |

MadMapper fixtures 1–12 are assigned to Art-Net universes 1–12 sequentially. The PixLite's scrambled universe→output mapping handles re-routing to the correct physical RJ45 port.

**Factory reset** (if IP is unknown):
1. Hold `Factory Reset` button for 5 seconds
2. Default IP becomes `192.168.0.50`
3. Connect laptop via Ethernet, set your laptop Ethernet IP to `192.168.0.x`, browse to `192.168.0.50`

---

### 3.6 Power Supplies

| PSU | Model | Output | Max Current | Powers |
|---|---|---|---|---|
| PSU 1 | Mean Well S-300-12 | 12V DC | 25A (300W) | Cytron MD30C → linear actuator |
| PSU 2 | Mean Well S-300-5 | 5V DC | 60A (300W) | Advatek PixLite + LED strips |

Datasheet: https://www.meanwell.com/productPdf.aspx?goods=S-300

> **Safety:** These supplies have exposed AC mains voltage on the input terminals. Never touch the input side while powered. Always power off before working on wiring.

> **Headroom:** The 5V supply supports up to ~1,000 WS2812B LEDs at full white. With 840 pixels installed, you have significant headroom to add more.

---

### 3.7 LED Strips

| | |
|---|---|
| **Type** | WS2812B addressable RGB |
| **Voltage** | 5V |
| **Color order** | G-R-B (configured in PixLite) |
| **Count** | 12 strips × 70 pixels = **840 pixels total** |
| **Controller** | Advatek PixLite 16 (via RJ45 long-range differential outputs) |
| **Location** | One strip per spoke of the flower umbrella |

WS2812B reference: https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf

---

## 4. Wiring & Signal Flow

### Power wiring

```
AC Mains
  │
  ├─► PSU1 (12V) ──► Cytron MD30C POWER terminals
  │                          │
  │                          └──► Linear Actuator (MOTOR terminals)
  │
  └─► PSU2 (5V) ───► Advatek PixLite 16 (PWR+ / PWR-)
                             │
                             └──► LED Strips via RJ45 outputs
```

### Control signal wiring

```
ESP32 GPIO 27 (DIR) ──────────────────► Cytron DIR pin
ESP32 GPIO 13 (PWM) ──────────────────► Cytron PWM pin
ESP32 GND ────────────────────────────► Cytron GND
ESP32 USB Micro ──────────────────────► USB wall adapter (5V power only)

Intel NUC (Ethernet port) ────────────► Advatek PixLite 16 (Ethernet)
  Art-Net UDP → pixel data for LED strips

Intel NUC (WiFi) ─────────────────────► Stanford WiFi router
  OSC UDP :8001 → ESP32 (motor commands)
  OSC UDP :8000 → MadMapper (loopback, same machine)
  HTTP :80 → phones/laptops (web app + Socket.IO on same port)
```

---

## 5. Network Topology

```
                    ┌──────────────────┐
                    │  Stanford WiFi   │
                    │  (router)        │
                    └────────┬─────────┘
                             │ WiFi
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────┐ ┌─────────────┐
      │  Intel NUC   │ │  ESP32   │ │ Phone/Laptop│
      │  (WiFi)      │ │  (WiFi)  │ │  (visitor)  │
      │  10.34.87.197│ │10.34.84.37│ │  DHCP       │
      └──────┬───────┘ └──────────┘ └─────────────┘
             │
             │ Ethernet (direct cable, not on Stanford network)
             │
             ▼
      ┌──────────────┐
      │ Advatek      │
      │ PixLite 16   │
      │ 192.168.0.50 │
      └──────────────┘
```

### IP address table

| Device | Interface | MAC Address | IP Address | Notes |
|---|---|---|---|---|
| Intel NUC | WiFi | `F8:63:3F:26:55:D4` | `10.34.87.197` (DHCP — reserve with IT) | Used by phones to reach the web app |
| Intel NUC | Ethernet | — | `192.168.0.1` (static, manual) | Direct link to PixLite only — not on Stanford network |
| Advatek PixLite 16 | Ethernet | `E0-B6-F5-E0-24-8C` | `192.168.0.50` (static) | Configure at `http://192.168.0.50` |
| ESP32 | WiFi | `24:0A:C4:EC:A7:64` | `10.34.84.37` (DHCP — reserve with IT) | Backend sends OSC here |
| Phones/Laptops | WiFi | personal | DHCP | Assigned by router |

### Ports in use

| Port | Protocol | Service | Direction |
|---|---|---|---|
| 80 | TCP | Backend (HTTP + Socket.IO) — also serves the React app | Browser → NUC |
| 8000 | UDP | OSC → MadMapper (input) | Backend → NUC loopback |
| 9000 | UDP | OSC ← MadMapper (feedback) | MadMapper → Backend loopback |
| 8001 | UDP | OSC → ESP32 motor | Backend → ESP32 |
| 6454 | UDP | Art-Net → PixLite | MadMapper → PixLite |

---

## 6. Software Stack

### 6.1 React Web App (Frontend)

| | |
|---|---|
| **Location** | `frontend/` |
| **Tech** | React 16, Socket.IO client, Framer Motion, Material UI |
| **How it runs** | Compiled to a static build, served by the backend at port 80 |
| **Access** | Any browser on the local WiFi: `http://10.34.87.197` (no port number) |

The frontend is **pre-built** — there is no separate dev server running. The backend at port 80 serves the static files from `frontend/build/`. Students connect to the NUC's IP directly.

**Key file:** `frontend/src/Components/Controller.js` — the Socket.IO connection uses `window.location.hostname`, so it automatically connects back to the NUC regardless of what IP it has. No hardcoded address.

**UI sections:**

- **Blumen Lumen tab** (the main one):
  - **Default / Custom toggle**: Default = autonomous mode (ESP32 schedule + LED default). Custom = manual control.
  - **Behavior presets**: Circular, Stripes, Rotation, Sweep — changes the LED animation pattern.
  - **Open/Close slider** (0–100%): Moves the flower. After you release, the UI locks the slider for ~80 seconds while the motor moves. This is intentional — the ESP32 cannot receive new commands while moving.
  - **Color palette selector**: 4 palettes (see [Section 7](#7-osc-api-reference)).

- **Room Light tab**: Controls for room ambient lighting. Wired up in the code but **not connected to any hardware at Stanford** — the original IDEO room lighting is not installed here. Safe to ignore.

**After any frontend code change**, rebuild before restarting the backend:
```bash
cd frontend
npm install   # first time only
npm run build # compiles React → frontend/build/
```
Then restart the backend — it serves `frontend/build/` automatically.

---

### 6.2 Node.js Backend

| | |
|---|---|
| **Location** | `backend/app.js` |
| **Tech** | Node.js, Express 4, Socket.IO, node-osc |
| **Port** | 80 (HTTP + WebSocket + serves static React build) |

This server translates between the web UI and the physical hardware. It also serves the built React frontend on the same port 80.

**Key lines to know:**
```js
// backend/app.js line 18 — MadMapper on same machine, loopback always correct
const oscClient = new Client('127.0.0.1', 8000);

// backend/app.js line 21 — update if IT reserves a different IP for the ESP32
const oscClientEngine = new Client('10.34.84.37', 8001);
```

**Socket.IO events the backend handles:**

| Event | Payload | What happens |
|---|---|---|
| `blumenMode` | `{blumenMode: 'custom'/'default'}` | Switches autonomous/manual; triggers OSC to MadMapper |
| `blumenBehavior` | `{blumenBehavior: 'circular'/'stripes'/'rotation'/'sweep'}` | Triggers OSC to MadMapper (only in custom mode) |
| `blumenOpenLevel` | `{blumenOpenLevel: 0.01–0.99}` | Triggers OSC `/1/fader1` to ESP32 (only in custom mode) |
| `blumenColorPalette` | `{blumenColorPalette: 0–3}` | Triggers OSC to MadMapper (only in custom mode) |

**Per-connection state:** Each browser tab gets its own independent state object. Two phones can issue conflicting motor commands simultaneously — the ESP32 will just receive both. For a multi-user setup this matters (see [Section 9](#9-how-to-hack--extend)).

**To start manually** (if the startup script isn't available):
```
cd backend
npm start
```

---

### 6.3 MadMapper (LED Lighting Engine)

| | |
|---|---|
| **License** | Licensed on the Intel NUC |
| **Role** | Generates Art-Net pixel data, sends to Advatek PixLite |
| **Active program** | `MadMapper/Blumen Programs/yc-dreamlab-blumen.mad` |
| **OSC input port** | **8000** (backend → MadMapper) |
| **OSC feedback port** | **9000** (MadMapper → backend; feedback IP: auto) |
| **Art-Net output** | Broadcast mode, Ethernet interface `192.168.0.1`, port 6454 |
| **Docs** | https://madmapper.com/documentation |

Art-Net is configured in **Broadcast mode** so all 12 PixLite outputs receive data. It must use the Ethernet interface (`192.168.0.1`), not the WiFi interface.

**OSC messages MadMapper responds to** (on port 8000):

| OSC Address | Value | Meaning |
|---|---|---|
| `/2/default` | `1` | Activate autonomous default pattern |
| `/2/circular_p0` | `1` | Circular pattern, palette 0 |
| `/2/circular_p1` | `1` | Circular pattern, palette 1 |
| `/2/stripes_p0` | `1` | Stripes pattern, palette 0 |
| `/2/rotation_p2` | `1` | Rotation pattern, palette 2 |
| … | … | Pattern: `{behavior}_p{palette}` |

Available behaviors: `circular`, `stripes`, `rotation`, `sweep`  
Available palette indices: `0`, `1`, `2`, `3`

---

### 6.4 Arduino Sketch (Motor Control Firmware)

| | |
|---|---|
| **Files** | `Arduino/blumen-motor/blumen-motor.ino`, `MotorController.h`, `MotorController.cpp` |
| **Board** | ESP32 Dev Module |
| **Libraries** | WiFi, WiFiUdp, OSCMessage (CNMAT), time.h |
| **IDE** | Arduino IDE 2.x |

**Configuration at top of `blumen-motor.ino`** — these are the only values you'd normally change:

```cpp
const char SSID[] = "Stanford";          // WiFi network name (open, MAC-registered)
const unsigned long FULL_PERIOD = 70500; // ms for actuator full travel
                                         // Increase if flower undershoots; decrease if overshoots
```

The ESP32 uses DHCP (no static IP in the sketch). Stanford WiFi is open — no password needed once the MAC is registered with IT.

**WiFi watchdog:** The sketch automatically reconnects if WiFi drops and re-syncs NTP on reconnect.

---

### 6.4.1 Boot Behavior

On every power-on or reset, the ESP32:
1. Attempts to connect to Stanford WiFi (20-second timeout; prints IP and MAC to Serial)
2. Syncs time via NTP from `pool.ntp.org` (up to 10 retries; timezone PST/PDT)
3. **Retracts to fully closed** — runs the motor for a full `FULL_PERIOD` regardless of current position, then sets position to 0.0

Step 3 is intentional: it guarantees the position tracking is accurate on startup. The flower always starts closed, then re-opens when the schedule fires or a user opens it manually.

> **What this means in practice:** Every time the NUC reboots or the ESP32 is reset, the flower closes for ~70 seconds. Normal.

If WiFi doesn't connect, the ESP32 continues with motor and serial commands still working — OSC and the schedule are disabled until WiFi comes back.

---

### 6.4.2 Autonomous Schedule

When no OSC commands are received, the ESP32 follows this daily schedule (PST/PDT):

| Time | Position | Description |
|---|---|---|
| 8:45 am | 0.00 | Fully closed |
| 9:00 am | 0.25 | Quarter open |
| 9:15 am | 0.50 | Half open |
| 9:30 am | 0.75 | Three-quarters open |
| 9:59 am | 0.99 | Fully open |
| 4:00 pm | 0.99 | Fully open (holds through afternoon) |
| 4:15 pm | 0.75 | Three-quarters open |
| 4:30 pm | 0.50 | Half open |
| 4:59 pm | 0.25 | Quarter open |
| 5:05 pm | 0.00 | Fully closed |

This runs entirely on the ESP32 — no NUC or network needed once flashed.

**Manual control vs. schedule:** Manual OSC commands (from the web app) override the schedule immediately. The schedule resumes at the next scheduled time — if a student manually closes the flower at 10am, it stays closed until the 4pm entry fires.

**To change the schedule**, edit the `SCHEDULE` array in `blumen-motor.ino`:
```cpp
const ScheduleEntry SCHEDULE[] = {
  {8,  45, 0.00},   // { hour (24h), minute, position (0.0–1.0) }
  {9,   0, 0.25},
  // ...
};
```
Reflash after editing.

---

## 7. OSC API Reference

OSC (Open Sound Control) is the protocol between all components. Any device on the network can send OSC packets to control the flower directly — useful for custom scripts and student projects.

### Motor control (→ ESP32 at `10.34.84.37:8001`)

| Address | Type | Range | Description |
|---|---|---|---|
| `/1/fader1` | float | 0.0 – 1.0 | Set flower open position. 0.0 = closed, 1.0 = open. Movement is timed, not instant — and the ESP32 cannot receive new commands until it finishes. |

Example (Python):
```python
# pip install python-osc
from pythonosc.udp_client import SimpleUDPClient
client = SimpleUDPClient("10.34.84.37", 8001)
client.send_message("/1/fader1", 0.5)  # open to 50%
```

### Lighting control (→ MadMapper at `127.0.0.1:8000` from the NUC, or `10.34.87.197:8000` from another device)

| Address | Type | Value | Description |
|---|---|---|---|
| `/2/default` | int | 1 | Return to autonomous default pattern |
| `/2/{behavior}_p{palette}` | int | 1 | Activate named preset |

Example:
```python
client = SimpleUDPClient("10.34.87.197", 8000)
client.send_message("/2/circular_p2", 1)  # circular pattern, palette 2
```

### Color palettes

| Index | Colors (R,G,B) |
|---|---|
| 0 | Deep blue `(55,38,166)`, Violet `(91,68,242)`, Yellow `(242,230,53)`, Red `(245,1,1)` |
| 1 | Dark red `(149,0,0)`, Red `(255,0,0)`, Lime `(85,255,0)`, Green `(0,156,0)` |
| 2 | Yellow `(255,255,0)`, Magenta `(234,3,255)`, Sky `(85,170,255)`, Green `(0,255,0)` |
| 3 | Pink `(239,48,242)`, Teal `(3,120,166)`, Cyan `(5,242,242)`, Yellow-green `(221,242,61)` |

---

## 8. How to Start the System

**NUC login:** Username `Dream Lab` / Password `123456`

**Pre-flight checklist:**
- [ ] Intel NUC is on and connected to Stanford WiFi
- [ ] Advatek PixLite 16 is powered and connected to NUC via Ethernet
- [ ] ESP32 is powered via USB
- [ ] Both power supplies (12V, 5V) are switched on
- [ ] Linear actuator wiring is connected to Cytron motor driver

**Startup sequence:**

1. **Run `Startup/blumen-startup.bat` as Administrator** — right-click → Run as administrator. This opens one window:
   - **"Blumen Backend"** — Node.js server on port 80 (also serves the React app)

   > If the window shows an error and exits, read it before closing. Most common cause: port 80 requires Administrator.

2. **MadMapper** should open automatically (configured as a Windows startup item). If it didn't launch, open it manually and load `MadMapper/Blumen Programs/yc-dreamlab-blumen.mad`.

3. **On any phone or laptop on Stanford WiFi:** Go to `http://10.34.87.197` — no port number needed.

4. **Verify:** Toggle to Custom mode, drag the open slider — the flower should move (~70 seconds). Try changing a behavior preset — LEDs should change immediately.

> **Startup state:** The ESP32 always retracts to closed when powered on (~70 seconds calibration step). The web app slider starts at 0% to match. This is intentional.

### Windows autostart configuration

The NUC is set up to run automatically without anyone needing to log in and start things manually. Two items live in the Windows Startup folder (`shell:startup` — press Win+R, type `shell:startup`, hit Enter to open it):

| Shortcut name | What it runs | Notes |
|---|---|---|
| `lumen-startup` | `Startup/blumen-startup.bat` (as Administrator) | Starts the Node.js backend on port 80 |
| `yc-madmapper` | MadMapper application | Opens MadMapper with the last-used `.mad` file |

If either stops auto-launching, check that its shortcut is still in `shell:startup` and that the target path is correct.

### Automatic power on/off (9am–5pm)

The NUC is configured to power on and shut down automatically so the sculpture runs only during d.school hours. This is most likely set up in the **BIOS/UEFI** (look for "Scheduled Power On" or "RTC Wake" under Power settings), though it may alternatively be a Windows Task Scheduler task.

> **If the NUC doesn't power on automatically:** Enter BIOS/UEFI on boot (usually F2 or Delete key), find the scheduled power / RTC wake setting, and confirm it's enabled and set to the right time.

> **If you need to change the hours:** Update both the power-on schedule (BIOS or Task Scheduler) and the ESP32's `SCHEDULE[]` array in `blumen-motor.ino` so they stay in sync. The flower's autonomous schedule currently opens at 9am and closes at 5pm to match.

**Repository layout:**

```
blumen-lumen/
├── Arduino/blumen-motor/   ← ESP32 sketch — reflash only if sketch changes
├── backend/                ← npm start (port 80) — also serves built React app
├── frontend/               ← npm run build after any frontend changes
│   └── build/              ← what the backend actually serves (pre-built)
├── MadMapper/              ← .mad files (open yc-dreamlab-blumen.mad)
├── Startup/                ← blumen-startup.bat (run as admin)
└── Datasheets/             ← hardware PDFs
```

---

## 9. How to Hack & Extend

### Entry points

| What you want to do | Where to start |
|---|---|
| Change LED color palette | `frontend/src/Controllers/States.js` — edit `colorPaletteArray` |
| Add a new behavior preset button | `frontend/src/Components/BlumenLumenContent.js` — add a `<Button>`, then handle the new event in `backend/app.js` |
| Change the daily schedule | `Arduino/blumen-motor/blumen-motor.ino` — edit the `SCHEDULE[]` array and reflash |
| Adjust full-open travel time | `Arduino/blumen-motor/blumen-motor.ino` — change `FULL_PERIOD` (currently 70500ms) and reflash; also update `defaultTimeOfOpening` in `frontend/src/Components/Controller.js` to match (must be ≥ FULL_PERIOD/1000) |
| Send OSC from a custom script | See [OSC API](#7-osc-api-reference) |
| Add a physical sensor | Wire to unused ESP32 GPIO, read in `loop()`, respond directly |
| Add a new MadMapper preset | Open MadMapper, create a new cue, assign OSC address `/2/yourname_p0` |
| Build a different UI | Anything that speaks Socket.IO to port 80, or sends OSC directly |
| Fix the blocking motor | Rewrite `motorMover()` in the Arduino sketch as a non-blocking state machine using `millis()` (see TODO comment in `blumen-motor.ino`) |
| Multi-user state sync | Lift `blumen` state above the connection handler in `backend/app.js` so all tabs see the same position (see TODO comment in `app.js`) |

### Adding a physical sensor (example: proximity sensor)

```cpp
// In blumen-motor.ino, add to setup():
pinMode(TRIG_PIN, OUTPUT);
pinMode(ECHO_PIN, INPUT);

// In loop(), read and respond:
long distance = readUltrasonic();
if (distance < 50) {  // someone within 50cm
    motorMover(0.99);  // open fully
}
```

### Adding a new web UI control

1. Add a button or slider in `frontend/src/Components/BlumenLumenContent.js`
2. Emit a Socket.IO event from `frontend/src/Components/Controller.js`
3. Handle that event in `backend/app.js` and send the appropriate OSC message
4. Run `npm run build` in `frontend/` and restart the backend

### Talking to the flower from Python

```python
# pip install python-osc
from pythonosc.udp_client import SimpleUDPClient

motor  = SimpleUDPClient("10.34.84.37", 8001)   # ESP32
lights = SimpleUDPClient("10.34.87.197", 8000)  # MadMapper (via NUC)

motor.send_message("/1/fader1", 0.75)        # open flower to 75%
lights.send_message("/2/circular_p3", 1)     # circular pattern, palette 3
```

### Ideas for student projects

- **Sensor-reactive**: Open the flower when someone approaches (ultrasonic sensor on ESP32)
- **Sound-reactive**: Change colors based on ambient sound level (microphone on ESP32)
- **Scheduled generative art**: New color palettes generated daily by an algorithm
- **Multi-user voting**: Let multiple phones vote on what the flower does
- **Data visualization**: Map real-world data (weather, stock price) to flower position and color
- **Computer vision**: Camera feed + ML to detect crowd size and react
- **Voice control**: Voice interface that sends OSC commands
- **Non-blocking motor**: Rewrite `motorMover()` as a state machine so the ESP32 stays responsive during movement

---

## 10. Troubleshooting

### Flower doesn't move when I drag the slider

1. Make sure you're in **Custom mode** (Default mode ignores slider input)
2. Wait — the slider locks out for ~80 seconds after a move. If it just moved, this is normal.
3. Check that the backend server is running (the "Blumen Backend" CMD window should show OSC log messages)
4. Check the ESP32 is connected to WiFi — open Serial Monitor at 115200 baud to see connection status
5. Verify the ESP32 IP in `backend/app.js` line 21 matches what the ESP32 actually got (check Serial Monitor output)
6. Check the Cytron motor driver — green PWM LED should blink when a command is received

### LEDs don't respond

1. Check MadMapper is open and `yc-dreamlab-blumen.mad` is loaded
2. Verify MadMapper's OSC input is configured to port 8000 (MadMapper → Preferences → OSC)
3. Check the Advatek PixLite 16 is powered (status LEDs should be on)
4. Verify the Ethernet cable between NUC and PixLite is connected
5. Open the PixLite web config (`http://192.168.0.50`) to confirm it's receiving Art-Net — connect a laptop to the NUC's Ethernet subnet first

### Web app can't connect (spinning or no response)

1. Confirm your phone is on Stanford WiFi (not eduroam or Stanford Visitor — different network)
2. Confirm the backend is running on the NUC
3. Try `http://10.34.87.197` directly — if this doesn't load, the NUC IP may have changed (check with `ipconfig` on the NUC)

### ESP32 won't connect to WiFi

1. Confirm the SSID in the sketch is `"Stanford"` (case-sensitive)
2. Make sure the router is broadcasting 2.4GHz — ESP32 does not support 5GHz
3. Make sure the ESP32's MAC `24:0A:C4:EC:A7:64` is registered with Stanford IT
4. Open Serial Monitor at 115200 baud and watch the boot output

### Flower moves but doesn't reach correct position

Position tracking is open-loop (timed). If the actuator was manually moved, `prevState` can drift. To recalibrate:
1. Send `/1/fader1` value `0.0` and wait the full ~70 seconds until fully retracted
2. Then send `1.0` — this re-establishes the timing baseline

Or use the Serial Monitor: type `close`, wait for it to finish, then `open`.

### ESP32 won't take OSC commands from a custom script

Remember: the ESP32 cannot receive new OSC while its motor is moving (`delay()` blocks the loop). Wait until the current move finishes. Also confirm you're sending UDP to port 8001.

---

## Credits

| Role | Credit |
|---|---|
| Original sculpture design & fabrication | [FoldHaus Collective](https://www.foldhaus.com/blumen-lumen) |
| Electronics, WiFi integration & software | IDEO (Palo Alto, CA) |
| Donation to Stanford d.school | Yicheng (YC) Sun, Stanford lecturer, 2026 |
| Original supporters | Black Rock Arts Foundation, Kickstarter backers |

**Repositories:**
- Canonical: https://github.com/yichengsun/blumen-lumen (this repo — all work goes here)
- Archived reference: https://github.com/FoldHaus/blumen-lumen-ideo (do not edit)
- Archived reference: https://github.com/ideo/ddl-ipad (do not edit)

*Documentation written June 2026. Sculpture originally built by FoldHaus Collective, premiered Burning Man 2014. Displayed at IDEO Palo Alto for ~10 years before donation to Stanford Design School.*
