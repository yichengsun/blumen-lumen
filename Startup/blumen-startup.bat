@ECHO OFF

:: Blumen Lumen startup script — runs on Intel NUC at boot
:: Starts the Node.js backend (port 80), which also serves the pre-built React app.
:: After this runs, manually open MadMapper with yc-dreamlab-blumen.mad
::
:: If the repo moves, update the CD path below.
:: Full system docs: https://github.com/yichengsun/blumen-lumen

TITLE Blumen Startup
ECHO Starting Blumen services...

:: The backend serves the pre-built React app on port 80.
:: Phones connect to http://<NUC-IP> — no port number needed.
::
:: If you update frontend code, rebuild before restarting:
::   cd C:\Users\Dream Lab\blumen-lumen\frontend
::   npm run build

ECHO Starting backend server...
CD "C:\Users\Dream Lab\blumen-lumen\backend"
START "Blumen Backend" cmd /k "npm start"

ECHO.
ECHO Done. Backend is starting in the "Blumen Backend" window (port 80).
ECHO   Web app: http://<NUC-WiFi-IP>  (no port number needed)
ECHO.
ECHO MadMapper should launch automatically via Windows startup items.
ECHO If it did not open, launch it manually and load:
ECHO   blumen-lumen\MadMapper\Blumen Programs\yc-dreamlab-blumen.mad
