# Blumen Lumen — Technical Documentation

> A kinetic light sculpture by IDEO. Originally built ~2017, reinstalled at Stanford 2026.
> This document is for students who want to understand, operate, or extend the system.

---

## Document Status

### Open TODOs
- [ ] Fill in all IP addresses once IT provisions the dedicated WiFi network (see [Section 5](#5-network-topology))
- [ ] Once IT confirms the ESP32's DHCP-reserved IP, update `blumen-lumen-ideo/iPad/ddl-ipad-backend/app.js` line: `const oscClientEngine = new Client('<ESP32-IP>', 8001)`
- [ ] Identify the linear actuator model — check the physical unit for a label (brand, stroke length, force rating)
- [x] Confirm which LED strip model is on the spokes — check the strip itself for markings (e.g. WS2812B, SK6812)
- [ ] Recalibrate `FULL_PERIOD` in the Arduino sketch at the new location — 70,500ms was measured at the original IDEO installation; mechanical friction and actuator wear may have changed travel time
- [x] Verify Cytron MD30C R2 jumpers — confirmed `EXT PWM` + `INT PDT`
- [ ] Confirm MadMapper OSC cue names match what the backend sends — open `yc-dreamlab-blumen.mad` in MadMapper and verify the OSC triggers are `/2/circular_p0`, `/2/stripes_p0`, etc.
- [ ] Document the actual Art-Net universe assignments in MadMapper and the PixLite config
- [ ] Document how many LED spokes there are and how many pixels per spoke
- [ ] Add photos of the fully assembled control box once housing is built
- [ ] Update the credit and web access plaque text here once finalized
- [ ] **mDNS setup**: Rename NUC computer name to `blumenlumen` (Settings → System → About → Rename this PC), then students can reach the app at `http://blumenlumen.local` — no IT needed, works on all modern devices
- [ ] **Stanford DNS entry**: Ask IT to add a DNS record `blumen.stanford.edu → NUC's reserved IP` for a permanent polished URL independent of the local network
- [ ] **Eliminate port number from URL**: Update backend (`app.js`) to also serve the built React app statically on port 80, so students go to `http://blumenlumen.local` or `http://blumen.stanford.edu` with no `:3000` needed (`Controller.js` already uses `window.location.hostname` — ✅ done)

### Low-Confidence Sections — Help Needed

These are areas where the documentation is based on code + photos but not confirmed hands-on. Answering these questions will sharpen the docs.

| Section | What I'm Unsure About | How to Verify |
|---|---|---|
| **LED strips** | Strip model — Based on the era (~2017), visual confirmation of the number of solder pads: WS2813A/B, 5V. In the housing it is hooked up to a PixLite Long Range receiver|
| **NUC network interfaces** | The NUC needs to be on WiFi (for router/Arduino) AND Ethernet (for PixLite) simultaneously. I assumed NUC has both active. If the NUC only has one Ethernet port and no WiFi, you'll need a small switch. | On the NUC, open Network Settings and check how many active adapters there are. |
| **Advatek ↔ NUC connection** | You said the PixLite connects "directly to the NUC via ethernet." If it's truly a direct cable (no switch), the NUC's Ethernet IP must be on the same subnet as the PixLite's IP, and the WiFi IP must be on the router's different subnet. This is the expected setup but worth confirming it's working. | Open MadMapper → Output settings and confirm it shows the PixLite as detected/connected. |
| ~~**Cytron PWM jumper**~~ | ✅ Confirmed: `EXT PWM` + `INT PDT` | — |
| **Motor direction vs. open/close** | Code says `extend = DIR pin LOW` (flower opens) and `retract = DIR pin HIGH` (flower closes). This matches the code comments but I don't know if the actuator is mounted in the standard or inverted orientation. If the flower closes when you send `1.0`, the directions are swapped. | Send `0.5` via the web app slider from a known closed state — does it open? If not, swap GPIO 27 HIGH/LOW in the code. |
| **MadMapper OSC cues** | I listed `/2/circular_p0` etc. based on what the backend *sends*, but I haven't read the `.mad` file to confirm MadMapper is actually configured to *receive* those exact addresses. | In MadMapper with `yc-dreamlab-blumen.mad` open: go to OSC triggers panel and screenshot the configured addresses. |
| ~~**Power supply amperage**~~ | ✅ Confirmed: Mean Well S-300-12 (12V/25A) and S-300-5 (5V/60A) | — |

---

## Table of Contents
1. [What Is Blumen Lumen?](#1-what-is-blumen-lumen)
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

Blumen Lumen was created by the **[FoldHaus Collective](https://www.foldhaus.com/blumen-lumen)**, an art and engineering collective. The project originally debuted at **Burning Man 2014** as a garden of ten giant origami flowers, 15–22 feet tall, that bloomed in response to people's presence and moved with the wind.

> *"A garden of ten giant origami flowers that bloom in the presence of people and move with the wind, creating a magical experience for their visitors."*
> — FoldHaus Collective

The flowers are structurally based on an adapted version of the **Miura-ori fold pattern**, a well-known origami tessellation. Each flower is built from corrugated polypropylene petals, a steel and aluminum internal mechanism, PVC pipe stems bent using custom molds, and a linear actuator that drives the open/close motion. The petal geometry was CNC-routed from corrugated plastic sheet.

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

One of the original ten flowers was acquired by **IDEO** (Palo Alto, CA), where it was displayed in the studio for approximately a decade following Burning Man 2014. During that time, IDEO's design and engineering team adapted it with WiFi-connected electronics, addressable LEDs, and the web-based control interface documented here.

In 2026, **Stanford lecturer Yicheng (YC) Sun** donated the sculpture to the **Stanford Design School (d.school)**, with the hope that it will be maintained and built upon by students. This documentation exists to make that possible.

### What It Does (Technical Summary)

Blumen Lumen ("flower light") is a large-scale kinetic sculpture — a plastic flower mounted overhead that opens and closes like an umbrella, with LED strips running through each spoke that animate with color. It is interactive: visitors connect to a local WiFi network and control the flower's position, lighting patterns, and color palette through a web app on their phone.

- Opens and closes mechanically via a linear actuator (0–100% open)
- Animates addressable LED strips with programmable patterns and color palettes
- Accepts real-time control commands from any browser on the local network
- Follows an autonomous daily schedule when no one is interacting (opens in the morning, closes in the evening)

---

## 2. System Architecture

The full data flow from user interaction to physical motion:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LOCAL WiFi NETWORK                           │
│                                                                     │
│  ┌──────────────┐    Socket.IO    ┌──────────────────────────────┐  │
│  │ Phone/Laptop │ ─────────────► │  Intel NUC (Windows PC)      │  │
│  │  Web Browser │                │                              │  │
│  │  port 3000   │                │  ┌────────────────────────┐  │  │
│  └──────────────┘                │  │  ddl-ipad (React)      │  │  │
│                                  │  │  port 3000             │  │  │
│                                  │  └────────────────────────┘  │  │
│                                  │                              │  │
│                                  │  ┌────────────────────────┐  │  │
│                                  │  │  ddl-ipad-backend      │  │  │
│                                  │  │  (Node.js) port 80     │  │  │
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
│  │  static IP :8001        │         ┌──────────────────────────┐  │
│  │  GPIO 27 → DIR          │         │  Advatek PixLite 16      │  │
│  │  GPIO 13 → PWM          │         │  (Ethernet, direct cable │  │
│  └────────────┬────────────┘         │   to NUC)                │  │
│               │                      └──────────────────────────┘  │
└───────────────┼──────────────────────────────────┼─────────────────┘
                │ 12V + Direction                   │ 5V data
                ▼                                   ▼
    ┌─────────────────────┐           ┌──────────────────────────────┐
    │  Cytron MD30C R2    │           │  LED Strips on Spokes        │
    │  30A Motor Driver   │           │  (WS2812B-type, addressable) │
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
- **Motor system**: ESP32 → Cytron → Linear Actuator (controls physical open/close)
- **Lighting system**: MadMapper → Advatek PixLite → LED strips (controls color/animation)

These are coordinated by the backend server sending OSC to both, but they are electrically and computationally independent. You can hack one without touching the other.

---

## 3. Hardware Components

### 3.1 Intel NUC (Hub Computer)

| | |
|---|---|
| **Role** | Central computer — runs all software |
| **OS** | Windows |
| **Login** | Username: `Dream Lab` / Password: `123456` |
| **WiFi MAC** | `TBD — run ipconfig /all in Windows terminal, look for "Wireless LAN adapter Wi-Fi"` |
| **Network** | WiFi (to router) + Ethernet (direct to Advatek) |
| **Static IP** | Configured at install time (see Network section) |

The NUC has two network interfaces: its WiFi adapter connects to the local router (same network as phones/laptops and the Arduino), and its Ethernet port connects directly to the Advatek PixLite for Art-Net communication.

---

### 3.2 ESP32-WROOM-32 (Motor Microcontroller)

| | |
|---|---|
| **Role** | Receives OSC commands over WiFi, drives motor controller |
| **Board** | ESP32 DevKit v1 (Espressif ESP32-WROOM-32 module) |
| **WiFi MAC** | `24:0A:C4:EC:A7:64` |
| **Power** | 5V via USB Micro → onboard 3.3V regulator |
| **Language** | C++ (Arduino framework) |
| **Source** | `blumen-lumen-ideo/Arduino/blumen-motor/blumen-motor.ino` |
| **Datasheet** | https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf |
| **Arduino Docs** | https://docs.espressif.com/projects/arduino-esp32/en/latest/ |

**Pin assignments:**

| ESP32 GPIO | Connected To | Purpose |
|---|---|---|
| GPIO 27 | Cytron DIR pin | Motor direction (HIGH = retract, LOW = extend) |
| GPIO 13 | Cytron PWM pin | Motor speed (0 = stop, 255 = full speed) |
| GND | Cytron GND | Shared ground |
| USB Micro | USB wall adapter | Power only |

**Built-in physical controls** (on the DevKit board itself):
- `EN` button — resets the ESP32
- `BOOT` button — holds bootloader mode for flashing

**Arduino IDE setup (one-time):**
1. Download Arduino IDE from https://www.arduino.cc/en/software (use 1.8.x or 2.x)
2. Open **Tools → Board → Boards Manager**, search `esp32`, install **"esp32" by Espressif Systems**
3. Go to **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
4. Go to **Tools → Port** and select the port that appears when the ESP32 is plugged in (on Mac: `/dev/cu.usbserial-XXXX`)

> **Common pitfall:** The Serial Monitor must be **closed** before uploading — both cannot use the serial port at the same time. Close the monitor window, upload, then reopen it.

> **Serial Monitor baud rate:** Always set to **115200** to match `Serial.begin(115200)` in the sketch. Using any other rate (e.g. 19200, 9600) produces garbage output.

**To re-flash the ESP32:**
1. Close the Serial Monitor if open
2. Connect USB cable from ESP32 to your laptop
3. Confirm board is set to `ESP32 Dev Module` and correct port is selected
4. Open `blumen-lumen-ideo/Arduino/blumen-motor/blumen-motor.ino`
5. Click Upload — the IDE will compile then flash; you'll see `Connecting...` then a progress bar

**Getting the MAC address:**

The MAC address is printed during boot but only after a successful WiFi connection. Since the sketch connects to the old IDEO network, the easiest way to read it without connecting to any network is to flash this minimal sketch first:

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

Open Serial Monitor at **115200 baud** — the MAC address prints immediately on boot. Record it for IT network registration, then re-flash the real `blumen-motor.ino` sketch.

---

### 3.3 Cytron MD30C R2 (Motor Driver)

| | |
|---|---|
| **Role** | Amplifies low-current ESP32 signals to drive the high-current linear actuator |
| **Max current** | 30A continuous |
| **Input voltage** | 12V DC (from PSU1) |
| **Control signals** | 3.3V/5V logic (DIR + PWM from ESP32) |
| **Datasheet** | https://www.cytron.io/p-md30c |
| **User manual** | https://docs.cytron.io/cy-motor-driver/cy-md30c-r2 |

**How it works:** The ESP32 sends a direction signal (HIGH or LOW on GPIO 27) and a PWM signal (0–255 on GPIO 13). The Cytron uses these logic-level signals to control its internal H-bridge, which switches the 12V supply to drive the motor forward or reverse at the commanded speed. The large capacitors on the corners absorb voltage spikes from motor braking.

**Control logic:**

| DIR pin | PWM pin | Motor action |
|---|---|---|
| LOW | 255 | Extend (open flower) |
| HIGH | 255 | Retract (close flower) |
| Any | 0 | Stop (freeze) |

**Jumper settings (confirmed):**

| Jumper | Setting | Meaning |
|---|---|---|
| PWM SOURCE | `EXT PWM` | ESP32 GPIO 13 controls motor speed externally |
| Protection | `INT PDT` | Internal peak detection for overcurrent protection |

---

### 3.4 Linear Actuator

| | |
|---|---|
| **Role** | Converts motor rotation into linear push/pull motion to open/close the flower |
| **Power** | 12V DC (from Cytron output) |
| **Model** | Unknown — check for label on actuator body |
| **Full travel time** | ~70.5 seconds (hardcoded as `FULL_PERIOD = 70500` ms in sketch) |

The flower's position is controlled by time: the code calculates how long to run the motor based on the requested open fraction and the known full-travel time. There is **no position sensor** — it's open-loop. If the actuator ever hits a mechanical limit, the motor driver will stall (the Cytron handles this safely up to its current rating).

> **Note for students:** Adding a limit switch or a position encoder would make the system much more robust. See [Section 9](#9-how-to-hack--extend).

---

### 3.5 Advatek PixLite 16 Long Range Mk II v1.1

| | |
|---|---|
| **Role** | Receives Art-Net lighting data from MadMapper and drives LED strips |
| **Universes** | 16 Art-Net universes |
| **Outputs** | 16 × RJ45 (CAT5 differential long-range outputs) |
| **Protocols** | Art-Net, sACN (E1.31) |
| **Power** | 5V DC (from PSU2) |
| **Network** | Ethernet — direct cable to Intel NUC |
| **Web config** | Access at `http://<PixLite-IP>` in a browser |
| **Manual** | https://www.advateklights.com/downloads/pixlite-16-mkii-user-manual |
| **Product page** | https://www.advateklights.com/pixlite16-mk2 |

The PixLite has its own IP address on the Ethernet interface. MadMapper is configured to send Art-Net UDP packets to this IP. The PixLite then converts Art-Net universe data into physical pixel signals for each LED strip output.

**Factory reset procedure** (if IP address is unknown):
1. Hold the `Factory Reset` button for 5 seconds
2. Default IP becomes `192.168.0.50`
3. Connect a laptop directly via Ethernet, set your laptop's Ethernet IP to `192.168.0.x`, browse to `192.168.0.50`

---

### 3.6 Power Supplies

Two switching power supplies live in the base enclosure:

| PSU | Model | Input | Output | Max Current | Powers |
|---|---|---|---|---|---|
| PSU 1 | Mean Well S-300-12 | AC mains (120V) | 12V DC | 25A (300W) | Cytron MD30C → linear actuator |
| PSU 2 | Mean Well S-300-5 | AC mains (120V) | 5V DC | 60A (300W) | Advatek PixLite + LED strips |

Datasheet: https://www.meanwell.com/productPdf.aspx?goods=S-300

> **Safety warning:** These power supplies have exposed AC mains voltage on their input terminals. Do not touch the input side while powered. The protective casing is specifically for this. Always power off before working on wiring.

> **Headroom note for students:** The 5V supply can deliver up to 60A (300W). A typical WS2812B LED draws ~60mA at full white. That means this PSU can theoretically power ~1,000 LEDs at full brightness before hitting the supply limit. You have significant headroom to add more LEDs.

---

### 3.7 LED Strips

| | |
|---|---|
| **Type** | WS2812B-type addressable RGB (built ~2017) |
| **Voltage** | 5V |
| **Data protocol** | Single-wire NeoPixel-compatible |
| **Controller** | Advatek PixLite 16 (via RJ45 long-range differential outputs) |
| **Location** | One strip per spoke of the flower umbrella structure |

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

Intel NUC (WiFi) ─────────────────────► Local WiFi router
  OSC UDP :8001 → ESP32 (motor commands)
  OSC UDP :8000 → MadMapper (lighting commands, received locally on NUC)
  HTTP :3000 → phones/laptops (web app)
  Socket.IO :80 → phones/laptops (real-time events)
```

---

## 5. Network Topology

```
                    ┌──────────────────┐
                    │   WiFi Router    │
                    │  (dedicated)     │
                    └────────┬─────────┘
                             │ WiFi
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────┐ ┌─────────────┐
      │  Intel NUC   │ │  ESP32   │ │ Phone/Laptop│
      │  (WiFi)      │ │  (WiFi)  │ │  (visitor)  │
      │  static IP   │ │static IP │ │  DHCP IP    │
      └──────┬───────┘ └──────────┘ └─────────────┘
             │
             │ Ethernet (direct)
             │
             ▼
      ┌──────────────┐
      │ Advatek      │
      │ PixLite 16   │
      │ static IP    │
      └──────────────┘
```

### IP address table (update after IT sets up WiFi)

| Device | Interface | MAC Address | IP Address | Notes |
|---|---|---|---|---|
| Intel NUC | WiFi | `TBD` | `TBD` | Needs static assignment; get MAC via `ipconfig /all` |
| Intel NUC | Ethernet | N/A | `TBD` | Same subnet as PixLite; not registered with IT |
| Advatek PixLite 16 | Ethernet | N/A | `TBD` | Configure via web UI; not on Stanford network |
| ESP32 | WiFi | `24:0A:C4:EC:A7:64` | `10.34.84.37` (DHCP, not yet reserved) | Register MAC with IT for a stable reserved IP |
| Phones/Laptops | WiFi | personal | DHCP | Assigned by router; no registration needed |

### Ports in use

| Port | Protocol | Service | Direction |
|---|---|---|---|
| 3000 | TCP | React web app (ddl-ipad) | Browser → NUC |
| 80 | TCP | Socket.IO backend | Browser → NUC |
| 8000 | UDP | OSC → MadMapper | Backend → NUC (loopback) |
| 8001 | UDP | OSC → ESP32 motor | Backend → ESP32 |
| 6454 | UDP | Art-Net → PixLite | MadMapper → PixLite |

---

## 6. Software Stack

### 6.1 ddl-ipad — React Web App (Frontend)

| | |
|---|---|
| **Repo** | https://github.com/ideo/ddl-ipad |
| **Tech** | React 16, Socket.IO client, Framer Motion, Material UI |
| **Runs on** | Intel NUC, served at `http://<NUC-IP>:3000` |
| **Access** | Any browser on the local WiFi |

**Key file:** `src/Components/Controller.js` — the Socket.IO connection uses `window.location.hostname` (dynamic), so it automatically connects back to whichever machine served the page. No IP editing needed.

**UI sections:**
- **Blumen Lumen tab**: Controls the flower
  - Default / Custom mode toggle
  - Behavior presets: Circular, Stripes, Rotation, Sweep
  - Open/Close slider (0–100%)
  - Color palette selector (4 palettes)
- **Room Light tab**: Ambient room lighting presets (not active at Stanford)

**To start:**
```bash
cd ddl-ipad
npm install   # first time only
npm start     # serves on port 3000
```

---

### 6.2 ddl-ipad-backend — Node.js Server (Backend)

| | |
|---|---|
| **Repo** | https://github.com/ideo/ddl-ipad-backend (also in `blumen-lumen-ideo/iPad/ddl-ipad-backend/`) |
| **Tech** | Node.js, Socket.IO, node-osc |
| **Runs on** | Intel NUC, port 80 |

This server is the translator between the web UI and the physical hardware. It maintains the current state of the flower and emits OSC messages when state changes.

**Key file:** `app.js`
```
Line to update with new IP once IT provides it:
  const oscClientEngine = new Client('<ESP32-IP>', 8001); // Arduino motor

Already correct — no IP editing needed:
  const oscClient = new Client('127.0.0.1', 8000);     // MadMapper (same machine)
```

**Socket.IO events it handles:**

| Event | Payload | Action |
|---|---|---|
| `blumenMode` | `{blumenMode: 'custom'\|'default'}` | Switches between autonomous/manual |
| `blumenBehavior` | `{blumenBehavior: 'circular'\|'stripes'\|'rotation'\|'sweep'}` | Sets LED pattern |
| `blumenOpenLevel` | `{blumenOpenLevel: 0.0–1.0}` | Moves flower to position |
| `blumenColorPalette` | `{blumenColorPalette: 0–3}` | Changes color palette |

**To start:**
```bash
cd blumen-lumen-ideo/iPad/ddl-ipad-backend
npm install   # first time only
npm start     # node app.js, listens on port 80
```

---

### 6.3 MadMapper (LED Lighting Engine)

| | |
|---|---|
| **Version** | Licensed on Intel NUC |
| **Role** | Generates Art-Net pixel data, sends to Advatek PixLite |
| **Active program** | `blumen-lumen-ideo/MadMapper/Blumen Programs/yc-dreamlab-blumen.mad` |
| **OSC input port** | 8000 |
| **Art-Net output** | UDP to Advatek PixLite IP, port 6454 |
| **Docs** | https://madmapper.com/documentation |

MadMapper has saved programs for the flower (`js-`, `pk-`, `yc-dreamlab-blumen.mad`). Each contains the LED mapping and the visual presets. The backend triggers these presets via OSC messages.

**OSC messages MadMapper listens for** (on port 8000):

| OSC Address | Value | Meaning |
|---|---|---|
| `/2/default` | `1` | Activate autonomous default mode |
| `/2/circular_p0` | `1` | Circular pattern, palette 0 |
| `/2/circular_p1` | `1` | Circular pattern, palette 1 |
| `/2/stripes_p0` | `1` | Stripes pattern, palette 0 |
| `/2/rotation_p2` | `1` | Rotation pattern, palette 2 |
| … | … | Pattern: `{behavior}_p{palette}` |

---

### 6.4 Arduino Sketch (Motor Control Firmware)

| | |
|---|---|
| **File** | `blumen-lumen-ideo/Arduino/blumen-motor/blumen-motor.ino` |
| **Board** | ESP32 Dev Module |
| **Libraries** | WiFi, WiFiUdp, OSCMessage (CNMAT), ESP32_AnalogWrite |
| **IDE** | Arduino IDE 2.x |

**Values to update for a new location** (at the top of `blumen-motor.ino`):
```cpp
const char SSID[] = "Stanford";       // WiFi network name (open, MAC-registered)
const unsigned long FULL_PERIOD = 70500; // ms for actuator full travel — recalibrate on-site
```
The ESP32 uses DHCP (no static IP in sketch). WiFi is an open network — no password needed once the MAC is registered with Stanford IT.

---

### 6.4.1 Boot Behavior

On every power-on or reset, the ESP32:
1. Connects to Stanford WiFi (prints IP and MAC to Serial)
2. Syncs time via NTP from `pool.ntp.org` (up to 10 retries; timezone PST/PDT)
3. **Retracts to fully closed** — runs the motor for a full `FULL_PERIOD` regardless of current position, then sets `prevState = 0.0`

Step 3 is intentional: it guarantees the ESP32's internal position tracking is accurate on startup. The flower always starts closed.

> **What this means in practice:** Every time the NUC reboots or the ESP32 is reset, the flower will close. It will then re-open when the schedule fires or when a user manually opens it via the web app.

---

### 6.4.2 Ambient / Autonomous Behavior

When no one is sending manual OSC commands, the ESP32 follows a daily schedule to open and close the flower on its own. This runs entirely on the ESP32 — no NUC or network needed once the sketch is flashed.

**Daily schedule (PST/PDT):**

| Time | Position | Description |
|------|----------|-------------|
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

The flower gradually opens from 8:45–9:59am as the d.school fills up, holds fully open through the afternoon, then gradually closes from 4:15–5:05pm.

**How it works:**
- The ESP32 checks the current time on every `loop()` iteration
- When `hour:minute` matches a schedule entry and the flower isn't already at that position, it moves
- If the motor is already moving (e.g. from a manual command), the schedule step is skipped until the next loop
- Schedule requires NTP sync — if NTP failed on boot, the flower won't follow the schedule (Serial Monitor will show a warning)

**To change the schedule**, edit the `SCHEDULE` array in `blumen-motor.ino`:
```cpp
const ScheduleEntry SCHEDULE[] = {
  {8,  45, 0.00},   // { hour (24h), minute, position (0.0–1.0) }
  {9,   0, 0.25},
  // ... add or remove entries freely
};
```

**Manual control vs. schedule:**
Manual OSC commands (from the web app) override the schedule immediately. The schedule will still fire at the next scheduled time — so if a student manually closes the flower at 10am, it will stay closed until 4pm when the schedule fires again at 0.99.

---

## 7. OSC API Reference

OSC (Open Sound Control) is the message protocol used between all components. Any device on the network can send OSC packets to control the flower directly.

### Motor control (→ ESP32 at `<ESP32-IP>:8001`)

| Address | Type | Range | Description |
|---|---|---|---|
| `/1/fader1` | float | 0.0 – 1.0 | Set flower open position. 0.0 = fully closed, 1.0 = fully open. Movement is timed, not instant. |

Example (using Python):
```python
from pythonosc.udp_client import SimpleUDPClient
client = SimpleUDPClient("<ESP32-IP>", 8001)
client.send_message("/1/fader1", 0.5)  # open to 50%
```

### Lighting control (→ MadMapper on NUC at `<NUC-IP>:8000`)

| Address | Type | Value | Description |
|---|---|---|---|
| `/2/default` | int | 1 | Return to autonomous default pattern |
| `/2/{behavior}_p{palette}` | int | 1 | Activate named preset |

Available behaviors: `circular`, `stripes`, `rotation`, `sweep`
Available palettes: `0`, `1`, `2`, `3`

Example:
```python
client = SimpleUDPClient("<NUC-IP>", 8000)
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
- [ ] Dedicated WiFi router is powered on and broadcasting
- [ ] Intel NUC is on and connected to router via WiFi
- [ ] Advatek PixLite 16 is powered and connected to NUC via Ethernet
- [ ] ESP32 is powered via USB
- [ ] Both power supplies (12V, 5V) are switched on
- [ ] Linear actuator wiring is connected to Cytron motor driver

**Startup sequence:**

1. **Run `blumen-startup.bat`** — double-click it on the NUC Desktop (or in `blumen-lumen-ideo/Startup/`). This opens two windows:
   - **"Blumen Backend"** — Node.js server on port 80
   - **"Blumen Frontend"** — React dev server on port 3000

   > If either window shows a red error and exits, read the error message before closing it. The most common cause is port 80 requiring Administrator — right-click the `.bat` and choose **Run as administrator**.

2. **MadMapper** should open automatically (it is configured as a Windows startup item). If it didn't launch, open it manually and load `yc-dreamlab-blumen.mad` from `blumen-lumen-ideo/MadMapper/Blumen Programs/`.

3. **On your phone or laptop:** Connect to the Stanford WiFi, open a browser to `http://<NUC-IP>:3000`

4. **Verify:** Toggle to Custom mode, drag the open slider — the flower should move. Try changing a behavior preset — LEDs should change.

> **Note on the flower's startup state:** When the ESP32 powers on or resets, it **retracts to fully closed** as a calibration step (takes ~70 seconds). The web app slider will start at 0% to match. This is intentional — see [Section 6.4.1](#641-boot-behavior).

**To start manually** (if the `.bat` isn't available or needs debugging):
```
cd blumen-lumen-ideo\iPad\ddl-ipad-backend
npm start

cd blumen-lumen-ideo\iPad\ddl-ipad
npm start
```

---

## 9. How to Hack & Extend

### Entry points

| What you want to do | Where to start |
|---|---|
| Change LED color palette | `ddl-ipad/src/Controllers/States.js` — edit `colorPaletteArray` |
| Add a new behavior preset button | `ddl-ipad/src/Components/BlumenLumenContent.js` — add a `<Button>` and update backend logic |
| Change the daily schedule | `blumen-motor.ino` — edit the `SCHEDULE[]` array near the top of the file |
| Adjust full-open travel time | `blumen-motor.ino` — change `FULL_PERIOD` (currently 70500ms) |
| Send OSC from a custom script | See [OSC API](#7-osc-api-reference) — any language with an OSC library works |
| Add a physical sensor | Wire to an unused ESP32 GPIO, read in `loop()`, send OSC or respond directly |
| Add a new MadMapper preset | Open MadMapper, create a new cue, assign it an OSC address like `/2/yourname_p0` |
| Build a different UI | Anything that speaks Socket.IO to the backend on port 80, or OSC directly |

### Adding a physical sensor (example: proximity sensor)

The ESP32 has many unused GPIO pins available on the breadboard. To add, say, an HC-SR04 ultrasonic sensor:

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

1. Add a Socket.IO event emission in `ddl-ipad/src/Components/Controller.js`
2. Add a handler in `ddl-ipad-backend/app.js` for that event
3. In the handler, send the appropriate OSC message to MadMapper or the ESP32

### Talking to the flower from Python

```python
# Install: pip install python-osc
from pythonosc.udp_client import SimpleUDPClient

motor = SimpleUDPClient("<ESP32-IP>", 8001)
lights = SimpleUDPClient("<NUC-IP>", 8000)

# Open the flower 75%
motor.send_message("/1/fader1", 0.75)

# Set circular pattern with palette 3
lights.send_message("/2/circular_p3", 1)
```

### Ideas for student projects
- **Sensor-reactive**: Open the flower when someone approaches (ultrasonic sensor)
- **Sound-reactive**: Change colors based on ambient sound level (microphone on ESP32)
- **Scheduled generative art**: New color palettes generated daily by an algorithm
- **Multi-user web app**: Let multiple phones vote on what the flower does
- **Data visualization**: Map real-world data (weather, stock price, tweet volume) to flower position and color
- **Computer vision**: Use a camera feed and ML to detect crowd size and react
- **Voice control**: Add a voice interface that sends OSC commands

---

## 10. Troubleshooting

### Flower doesn't move when I drag the slider

1. Check that the backend server is running (NUC terminal should show OSC log messages)
2. Check the ESP32 is connected to WiFi — its Serial Monitor (Arduino IDE) will show connection status
3. Verify the ESP32 IP in `app.js` matches the actual assigned IP
4. Make sure you're in **Custom mode** in the web app (default mode ignores slider input)
5. Check the Cytron motor driver — green PWM LED should blink when a command is received

### LEDs don't respond

1. Check MadMapper is open and the correct `.mad` file is loaded
2. Verify MadMapper's OSC input is configured to port 8000
3. Check the Advatek PixLite 16 is powered (status LEDs should be on)
4. Verify the Ethernet cable between NUC and PixLite is connected
5. Open the PixLite web config (`http://<PixLite-IP>`) to confirm it's receiving Art-Net

### Web app can't connect (spinning / no response)

1. Confirm your phone/laptop is on the correct WiFi network (not eduroam/Stanford Visitor)
2. Confirm both `npm start` servers are running on the NUC
3. Check that the IP in `Controller.js` matches the NUC's current IP
4. Try accessing `http://<NUC-IP>:80` directly to test the backend

### ESP32 won't connect to WiFi

1. Confirm the SSID and password in the sketch match the router exactly (case-sensitive)
2. Make sure the router is on 2.4GHz — ESP32 does not support 5GHz WiFi
3. Open Serial Monitor at 115200 baud to see connection debug output
4. Re-flash the sketch after updating credentials

### Flower moves but doesn't reach correct position

The motion is open-loop (timed). If the actuator was manually moved or hit a limit, the ESP32's internal position tracking (`prevState`) can drift from reality. To reset:
1. Send OSC `/1/fader1` with value `0.0` and let it run until fully retracted
2. Then send `1.0` to go to fully extended — this re-calibrates the timing baseline

---

## Repositories

| Repo | Contents |
|---|---|
| https://github.com/FoldHaus/blumen-lumen-ideo | Arduino sketch, MadMapper files, backend server, IP config, startup scripts |
| https://github.com/ideo/ddl-ipad | React frontend web app |

---

---

### Credits

| Role | Credit |
|---|---|
| Original sculpture design & fabrication | [FoldHaus Collective](https://www.foldhaus.com/blumen-lumen) |
| Electronics, WiFi integration & software | IDEO (Palo Alto, CA) |
| Donation to Stanford d.school | Yicheng (YC) Sun, Stanford lecturer, 2026 |
| Original supporters | Black Rock Arts Foundation, Kickstarter backers |

*Documentation written June 2026. Sculpture originally built by FoldHaus Collective, premiered Burning Man 2014. Displayed at IDEO Palo Alto for ~10 years before donation to Stanford Design School.*
