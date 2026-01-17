@echo off
TITLE Servidor Kiosco Monalisa V2
echo ==========================================
echo Iniciando el Servidor del Kiosco...
echo ==========================================
cd /d "%~dp0"

:: Intentar obtener la IP local para mostrarla
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4" ^| findstr "192."') do (
    set SERVER_IP=%%a
)
set SERVER_IP=%SERVER_IP: =%

echo Servidor corriendo en:
echo Local:   http://localhost:3000
if not "%SERVER_IP%"=="" (
    echo Red:     http://%SERVER_IP%:3000
)
echo ==========================================

call npm run start

echo ==========================================
echo El servidor se ha detenido.
echo ==========================================
pause
