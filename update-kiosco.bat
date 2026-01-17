@echo off
TITLE Actualizando Kiosco Monalisa V2
echo ==========================================
echo Actualizando el proyecto desde Git...
echo ==========================================
cd /d "%~dp0"

echo [1/3] Bajando ultimos cambios...
git pull

echo [2/3] Instalando dependencias...
call npm install

echo [3/3] Construyendo la aplicacion...
call npm run build

echo ==========================================
echo Actualizacion completada!
echo ==========================================
pause
