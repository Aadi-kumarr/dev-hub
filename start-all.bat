@echo off
setlocal
title Dev Hub
cd /d "%~dp0"

if not exist "node_modules\" (
  echo Installing the launcher's packages for the first time...
  call npm install
  if errorlevel 1 (
    echo npm install failed. See the messages above.
    pause
    exit /b 1
  )
)

rem Checked here as well as in prestart, so the error stays on screen after a double-click.
node scripts\check-mongo.mjs
if errorlevel 1 (
  pause
  exit /b 1
)

rem Reading from nul stops Windows asking "Terminate batch job (Y/N)?" after Ctrl+C.
call npm start <nul
