@echo off
title A320 MaintSys — Starting...
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║       A320 MaintSys — Dev Server          ║
echo  ║   Virtual Maintenance Platform            ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Install dependencies if needed
if not exist node_modules (
    echo [1/3] Installing dependencies...
    call npm install
) else (
    echo [1/3] Dependencies OK
)

:: Start dev server + tunnel
echo [2/3] Starting dev server on http://localhost:5173
echo [3/3] Starting tunnel for public URL...
echo.

call npx concurrently "npm run dev" "npx localtunnel --port 5173 --print-requests" "powershell -ExecutionPolicy Bypass -File scripts\git_auto_push.ps1"
