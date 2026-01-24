@echo off
:: Aseguramos que el script se ejecute en la carpeta donde esta guardado
cd /d "%~dp0"
setlocal enabledelayedexpansion
title Kiosco Monalisa V2 - Servidor Auto-Recuperable

:: Variables de configuración
set PORT=3000
set WAIT_TIME=5

:start
cls
echo ==========================================================
echo    KIOSCO MONALISA V2 - SERVIDOR DE AUTO-RECUPERACION
echo ==========================================================
echo Directorio: %CD%
echo Hora: %TIME%
echo.

:: 0. Verificación de Entorno
echo [INFO] Verificando comandos...
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] No se encontro 'npm'. Verifica que Node.js este instalado.
    echo Intentando buscar en rutas comunes...
    if exist "C:\Program Files\nodejs\npm.cmd" set PATH=%PATH%;C:\Program Files\nodejs\
)

:: 1. Verificación de Integridad
if not exist "package.json" (
    echo [ERROR] No se encontro package.json en este directorio.
    echo Asegurate de ejecutar este archivo desde la raiz del proyecto.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [INFO] Instalando dependencias necesarias...
    call npm install --omit=dev
)

if not exist ".next\" (
    echo [INFO] Preparando archivos de produccion...
    call npm run build
)

:: 2. Limpieza del Puerto
echo [INFO] Limpiando puerto %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT%') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: 3. Detección de IP
echo [INFO] Detectando direccion IP de la red...
set "SERVER_IP=localhost"
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "TMP_IP=%%i"
    set "SERVER_IP=!TMP_IP: =!"
    goto :found_ip
)

:found_ip
echo.
echo [CONFIG] Servidor accesible en:
echo [LOCAL] http://localhost:%PORT%
echo [RED]   http://%SERVER_IP%:%PORT%
echo.

:: 4. Inicio del Proceso
echo [OK] Iniciando Next.js...
echo.
call npm run start

echo.
echo ==========================================================
echo [ALERTA] El servidor se detuvo.
echo Reiniciando en %WAIT_TIME% segundos... (Presiona Ctrl+C para cancelar)
echo ==========================================================
timeout /t %WAIT_TIME%
goto start
