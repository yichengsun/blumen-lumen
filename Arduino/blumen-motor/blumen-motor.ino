/*
 * blumen-motor.ino — Blumen Lumen Motor Controller
 * ─────────────────────────────────────────────────
 * Board   : ESP32-WROOM-32 DevKit v1
 * Wired to: Cytron MD30C R2 (motor driver) → linear actuator (opens/closes flower)
 *
 * What this does:
 *   Connects to Stanford WiFi, listens for OSC commands over UDP, and moves the
 *   flower to a target position. Also runs a daily open/close schedule autonomously.
 *
 * OSC API (listen on port 8001):
 *   Address : /1/fader1
 *   Value   : float  0.0 = fully closed  →  1.0 = fully open
 *   Sender  : Intel NUC running ddl-ipad-backend/app.js
 *
 * Serial commands (open Serial Monitor at 115200 baud):
 *   open        → move to 1.0 (fully open)
 *   close       → move to 0.0 (fully closed)
 *   0.0 – 1.0   → move to any position, e.g. "0.5"
 *   status      → print current position, WiFi info, and time
 *
 * Position model:
 *   prevState tracks the flower's position as a float 0.0–1.0.
 *   Move duration = FULL_PERIOD × |target − current|  (open-loop, timed control)
 *   There is no physical position sensor — if the actuator is moved manually,
 *   prevState will be wrong until the next full open or close calibration.
 *
 * Full system docs: https://github.com/yichengsun/blumen-lumen
 */

#include <WiFi.h>
#include <WiFiUdp.h>
#include <OSCMessage.h>
#include "MotorController.h"
#include "time.h"

// ── CONFIGURATION — edit these ──────────────────────────────────────────────

const char SSID[] = "Stanford";          // WiFi network (open, MAC-registered)

const unsigned long FULL_PERIOD = 70500; // ms for actuator to travel full range.
                                          // Increase if flower undershoots; decrease if it overshoots.

const int DIRECTION_PIN = 27;            // ESP32 GPIO → Cytron DIR pin
const int PWM_PIN       = 13;            // ESP32 GPIO → Cytron PWM pin

// Daily schedule (PST/PDT). Add, remove, or edit entries freely.
// { hour (24h), minute, position (0.0–1.0) }
struct ScheduleEntry { int hour; int min; float position; };
const ScheduleEntry SCHEDULE[] = {
  {8,  45, 0.00},  // 8:45am — closed
  {9,   0, 0.25},  // 9:00am — quarter open
  {9,  15, 0.50},  // 9:15am — half open
  {9,  30, 0.75},  // 9:30am — three-quarters open
  {9,  59, 0.99},  // 9:59am — fully open
  {16,  0, 0.99},  // 4:00pm — fully open (hold through evening)
  {16, 15, 0.75},  // 4:15pm — three-quarters
  {16, 30, 0.50},  // 4:30pm — half
  {16, 59, 0.25},  // 4:59pm — quarter
  {17,  5, 0.00},  // 5:05pm — closed
};
const int SCHEDULE_LENGTH = sizeof(SCHEDULE) / sizeof(SCHEDULE[0]);

// ── END CONFIGURATION ────────────────────────────────────────────────────────

WiFiUDP Udp;
const unsigned int OSC_PORT = 8001;

MotorController motorController(DIRECTION_PIN, PWM_PIN, /*debugMode=*/true);

float prevState = 0.0;  // current flower position (0.0 = closed, 1.0 = open)
bool isMoving   = false;

unsigned long previousMillis  = 0;
const unsigned long WIFI_CHECK_INTERVAL = 30000; // ms between WiFi reconnect attempts

// ── LOGGING ──────────────────────────────────────────────────────────────────

// Prefix every log line with a millisecond timestamp for easier timing debug.
void logf(const char* format, ...) {
  Serial.printf("[%8lums] ", millis());
  char buf[128];
  va_list args;
  va_start(args, format);
  vsnprintf(buf, sizeof(buf), format, args);
  va_end(args);
  Serial.println(buf);
}

// ── STATUS ───────────────────────────────────────────────────────────────────

void printStatus() {
  struct tm t;
  Serial.println("──── STATUS ─────────────────────────────────");
  Serial.printf("  Position : %.2f  (%s)\n", prevState, isMoving ? "MOVING" : "stopped");
  Serial.printf("  WiFi     : %s\n", WiFi.status() == WL_CONNECTED ? "connected" : "DISCONNECTED");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("  IP       : %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("  RSSI     : %d dBm\n", WiFi.RSSI());
  }
  if (getLocalTime(&t))
    Serial.printf("  Time     : %02d:%02d:%02d\n", t.tm_hour, t.tm_min, t.tm_sec);
  else
    Serial.println("  Time     : NTP not synced");
  Serial.println("─────────────────────────────────────────────");
}

// ── MOTOR ────────────────────────────────────────────────────────────────────

// TODO: Non-blocking motor movement
// Currently motorMover() uses delay() which freezes the entire loop for up to
// FULL_PERIOD ms (~70 seconds). During this time the ESP32 cannot receive new
// OSC commands, handle WiFi reconnects, or run the schedule.
//
// To fix: rewrite as a state machine using millis() —
//   On move start: record startTime, startPos, targetPos; set isMoving = true
//   In loop(): if (millis() - startTime >= duration) → freeze, isMoving = false
// This would also allow mid-move position updates (interrupt a move with a new target).
// Good student project for someone comfortable with C++ state machines.

void motorMover(float targetState) {
  isMoving = true;
  float delta        = targetState - prevState;
  unsigned long t    = (unsigned long)abs(FULL_PERIOD * delta);

  if (delta < 0) {
    motorController.retract();
    logf("Retracting for %lums  (%.2f → %.2f)", t, prevState, targetState);
    delay(t);
    motorController.freeze();
    logf("Retract done");
  } else {
    motorController.extend();
    logf("Extending for %lums  (%.2f → %.2f)", t, prevState, targetState);
    delay(t);
    motorController.freeze();
    logf("Extend done");
  }

  prevState = targetState;
  isMoving  = false;
  logf("Position now: %.2f", prevState);
}

// OSC callback — triggered by /1/fader1 message
void motor(OSCMessage &msg) {
  if (isMoving) {
    logf("OSC ignored — already moving");
    return;
  }
  float newState = msg.getFloat(0);
  logf("OSC /1/fader1  value=%.3f  prev=%.3f", newState, prevState);
  if (abs(newState - prevState) > 0.001)
    motorMover(newState);
}

// ── SCHEDULE ─────────────────────────────────────────────────────────────────

void runSchedule() {
  if (isMoving) return;
  struct tm t;
  if (!getLocalTime(&t)) return;

  for (int i = 0; i < SCHEDULE_LENGTH; i++) {
    if (t.tm_hour == SCHEDULE[i].hour && t.tm_min == SCHEDULE[i].min) {
      if (abs(SCHEDULE[i].position - prevState) > 0.001) {
        logf("Schedule [%02d:%02d] → %.2f", t.tm_hour, t.tm_min, SCHEDULE[i].position);
        motorMover(SCHEDULE[i].position);
      }
    }
  }
}

// ── SERIAL COMMANDS ──────────────────────────────────────────────────────────

bool isNumericString(String s) {
  if (s.length() == 0) return false;
  for (unsigned int i = 0; i < s.length(); i++) {
    if (!isDigit(s[i]) && s[i] != '.') return false;
  }
  return true;
}

void handleSerialCommand() {
  if (!Serial.available()) return;
  String cmd = Serial.readStringUntil('\n');
  cmd.trim();
  if (cmd.length() == 0) return;

  logf("Serial cmd: \"%s\"", cmd.c_str());

  if (isMoving) {
    Serial.println("  Motor is currently moving — command ignored");
    return;
  }

  if (cmd == "open") {
    motorMover(1.0);
  } else if (cmd == "close") {
    motorMover(0.0);
  } else if (cmd == "status") {
    printStatus();
  } else if (isNumericString(cmd)) {
    float val = cmd.toFloat();
    if (val >= 0.0 && val <= 1.0)
      motorMover(val);
    else
      Serial.println("  Value out of range — use 0.0 to 1.0");
  } else {
    Serial.println("  Unknown command. Options: open  close  0.0–1.0  status");
  }
}

// ── SETUP ────────────────────────────────────────────────────────────────────

void setTimezone(const char* tz) {
  setenv("TZ", tz, 1);
  tzset();
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("╔══════════════════════════════════════════╗");
  Serial.println("║   BLUMEN LUMEN — Motor Controller        ║");
  Serial.println("║   Stanford d.school                      ║");
  Serial.println("║   github.com/yichengsun/blumen-lumen     ║");
  Serial.println("╚══════════════════════════════════════════╝");

  // WiFi — 20-second timeout so serial commands work even without a network.
  // OSC won't function until WiFi connects, but motor and schedule still work.
  WiFi.mode(WIFI_STA);
  logf("MAC : %s", WiFi.macAddress().c_str());
  logf("Connecting to %s ...", SSID);
  WiFi.begin(SSID); // open network — no password
  {
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    Serial.println();
  }
  if (WiFi.status() == WL_CONNECTED) {
    logf("WiFi connected");
    logf("IP  : %s", WiFi.localIP().toString().c_str());
    logf("MAC : %s", WiFi.macAddress().c_str());
    logf("GW  : %s", WiFi.gatewayIP().toString().c_str());
    logf("RSSI: %d dBm", WiFi.RSSI());

    // UDP
    Udp.begin(OSC_PORT);
    logf("Listening for OSC on UDP port %d", OSC_PORT);
  } else {
    logf("WARNING: WiFi not connected — OSC disabled. Serial commands still work.");
    logf("MAC : %s", WiFi.macAddress().c_str());
    logf("Check that this MAC is registered with Stanford IT.");
  }

  // NTP
  logf("Syncing time via NTP...");
  configTime(0, 0, "pool.ntp.org");
  setTimezone("PST8PDT,M3.2.0/02:00:00,M11.1.0/02:00:00");
  struct tm timeinfo;
  int retries = 0;
  while (!getLocalTime(&timeinfo) && retries < 10) {
    delay(500);
    retries++;
    Serial.print(".");
  }
  Serial.println();
  if (retries < 10)
    logf("Time synced: %02d:%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
  else
    logf("NTP sync failed — scheduled moves will not work until time is available");

  // Calibrate to known-closed position.
  // Retracts fully regardless of current position so prevState=0.0 is accurate.
  logf("Calibrating — retracting to closed position...");
  motorController.retract();
  delay(FULL_PERIOD);
  motorController.freeze();
  prevState = 0.0;
  logf("Ready. Flower is closed (position 0.0)");
  logf("Serial commands available: open  close  0.0-1.0  status");
  Serial.println();
}

// ── LOOP ─────────────────────────────────────────────────────────────────────

void loop() {
  unsigned long now = millis();

  // WiFi watchdog — attempt reconnect periodically if connection is lost
  if (WiFi.status() != WL_CONNECTED && now - previousMillis >= WIFI_CHECK_INTERVAL) {
    previousMillis = now;
    logf("WiFi not connected — attempting reconnect to %s...", SSID);
    WiFi.disconnect();
    WiFi.begin(SSID);
  }

  handleSerialCommand();
  runSchedule();

  // OSC receive — only if WiFi is up
  if (WiFi.status() == WL_CONNECTED) {
    OSCMessage msg;
    int size = Udp.parsePacket();
    if (size > 0) {
      while (size--) msg.fill(Udp.read());
      if (!msg.hasError()) {
        msg.dispatch("/1/fader1", motor);
      } else {
        OSCErrorCode err = msg.getError();
        logf("OSC parse error: %d", err);
      }
    }
  }
}
