@echo off
setlocal
title Dev Hub
cd /d "%~dp0"

rem A double-click skips the terminal profile that sets up fnm, which would leave the older
rem system Node on PATH. Use fnm's default Node when it's installed.
if not defined FNM_DIR set "FNM_DIR=%APPDATA%\fnm"
if exist "%FNM_DIR%\aliases\default\node.exe" set "PATH=%FNM_DIR%\aliases\default;%PATH%"

node -e "process.exit(Number(process.versions.node.split('.')[0]) < 22 ? 1 : 0)"
if errorlevel 1 (
  echo The launcher needs Node 22 or newer. Install it, or set it as fnm's default.
  pause
  exit /b 1
)

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
