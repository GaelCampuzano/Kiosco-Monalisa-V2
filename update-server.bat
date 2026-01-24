@echo off
:: Asegurar directorio correcto
cd /d "%~dp0"
title Actualizador Kiosco Monalisa V2

echo [1/4] Cerrando servidor actual...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/4] Actualizando dependencias...
call npm install --omit=dev

echo [3/4] Re-construyendo proyecto (Optimizado)...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo [ERROR] La construccion fallo.
    pause
    exit /b 1
)

echo [4/4] Todo listo. Detectando IP...
set "SERVER_IP=localhost"
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "TMP_IP=%%i"
    set "SERVER_IP=!TMP_IP: =!"
    goto :found_ip
)
:found_ip
echo.
echo ==========================================================
echo [DIRECCION RED] http://%SERVER_IP%:3000
echo ==========================================================
echo.
call npm run start
pause
