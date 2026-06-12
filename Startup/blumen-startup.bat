@ECHO OFF

:: Blumen Lumen startup script — runs on Intel NUC at boot
:: Starts the Node.js backend and React frontend servers.
:: After this runs, manually open MadMapper with yc-dreamlab-blumen.mad
::
:: If servers need to run from a different folder, update the two CD paths below.
:: Full system docs: https://github.com/yichengsun/blumen-lumen

TITLE Blumen Startup
ECHO Starting Blumen services...

:: Prevent React from auto-opening a browser tab on the NUC
SET BROWSER=none

ECHO Starting backend server (1/2)...
CD C:\Users\Dream Lab\Documents\GitHub\ddl-ipad-backend
START "Blumen Backend" cmd /k "npm start"

:: Small delay so the backend is listening before the frontend connects
TIMEOUT /T 3 /NOBREAK >nul

ECHO Starting frontend server (2/2)...
CD C:\Users\Dream Lab\Documents\GitHub\ddl-ipad
START "Blumen Frontend" cmd /k "npm start"

ECHO.
ECHO Done. Two windows should be open:
ECHO   "Blumen Backend"  — Node.js server on port 80
ECHO   "Blumen Frontend" — React dev server
ECHO.
ECHO MadMapper should launch automatically via Windows startup items.
ECHO If it did not open, launch it manually and load yc-dreamlab-blumen.mad
