@echo off
setlocal EnableDelayedExpansion
title KIOSCO MONALISA V2 - SERVIDOR
cd /d "%~dp0"

:loop
cls
color 07

echo.
echo.
REM Banner en Magenta (Estilo Next.js)
powershell -Command "Write-Host '   __  __  ___  _   _    _    _     ___ ____    _    ' -ForegroundColor Magenta"
powershell -Command "Write-Host '  |  \/  |/ _ \| \ | |  / \  | |   |_ _/ ___|  / \   ' -ForegroundColor Magenta"
powershell -Command "Write-Host '  | |\/| | | | |  \| | / _ \ | |    | |\___ \ / _ \  ' -ForegroundColor Magenta"
powershell -Command "Write-Host '  | |  | | |_| | |\  |/ ___ \| |___ | | ___) / ___ \ ' -ForegroundColor Magenta"
powershell -Command "Write-Host '  |_|  |_|\___/|_| \_/_/   \_\_____|___|____/_/   \_\' -ForegroundColor Magenta"
echo.
echo.

set "SERVER_IP="
REM 1. Intento primario con PowerShell (IPv4, ignorando loopback/virtuales)
for /f "delims=" %%a in ('powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress"') do set "SERVER_IP=%%a"

REM 2. Fallback con ipconfig si PowerShell fallo
if not defined SERVER_IP (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do set "SERVER_IP=%%a"
)

REM 3. Limpieza de espacios
if defined SERVER_IP set "SERVER_IP=%SERVER_IP: =%"

REM 4. Fallback final a localhost
if not defined SERVER_IP set "SERVER_IP=localhost"

REM Exportar variable para Next.js
set SERVER_IP=%SERVER_IP%

REM Estilo limpio similar a Next.js CLI
powershell -Command "Write-Host '   MONALISA KIOSCO V2.0' -ForegroundColor White"
echo.
powershell -Command "Write-Host '   - Hora:      %TIME%' -ForegroundColor Gray"
powershell -Command "Write-Host '   - Local:     http://localhost:3000' -ForegroundColor White"
powershell -Command "Write-Host '   - Network:   http://%SERVER_IP%:3000' -ForegroundColor White"
echo.
echo.
powershell -Command "Write-Host '   Esperando aplicacion...' -ForegroundColor DarkGray"
echo.

REM Iniciar Next.js en modo produccion
call npm start

REM Manejo de caídas inesperadas
color 0C
echo.
echo  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo   ALERTA: El servidor se ha detenido inesperadamente.
echo   Reiniciando automaticamente en 5 segundos...
echo  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
timeout /t 5 >nul
goto loop
