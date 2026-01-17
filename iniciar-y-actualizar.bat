@echo off
TITLE Kiosco - Iniciar y Actualizar
echo ==========================================
echo Iniciando Kiosco Monalisa V2 (Modo Auto)
echo ==========================================
cd /d "%~dp0"

:: 1. Intentar actualizar (silenciosamente o rápido)
echo Buscando actualizaciones...
git pull

:: 2. Iniciar el servidor
echo Iniciando servidor...
:: Usamos 'call' para que el script de inicio tome el control
call npm run start

echo ==========================================
echo El proceso ha terminado.
echo ==========================================
pause
