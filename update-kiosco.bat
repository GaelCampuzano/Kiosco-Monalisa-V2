@echo off
setlocal EnableDelayedExpansion
title KIOSCO MONALISA V2 - ACTUALIZADOR
cd /d "%~dp0"
cls
color 0A

echo.
echo  ================================================================
echo.
echo    __  __  ___  _   _    _    _     ___ ____    _    
echo   ^|  \/  ^|/ _ \^| \ ^| ^|  / \  ^| ^|   ^|_ _/ ___^|  / \   
echo   ^| ^|\/^| ^| ^| ^| ^|  \^| ^| / _ \ ^| ^|    ^| ^|\___ \ / _ \  
echo   ^| ^|  ^| ^| ^|_^| ^| ^|\  ^|/ ___ \^| ^|___ ^| ^| ___) / ___ \ 
echo   ^|_^|  ^|_^|\___/^|_^| \_/_/   \_\_____^|___^|____/_/   \_\
echo.
echo                                         SISTEMA DE ACTUALIZACION
echo  ================================================================
echo.

echo  [PASO 1/3] Sincronizando con la nube (Git Pull)...
echo  ----------------------------------------------------------------
git pull
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] No se pudo descargar la actualizacion.
    echo  Verifique su conexion a internet e intente de nuevo.
    pause
    exit /b
)
echo.

echo  [PASO 2/3] Optimizando dependencias (NPM Install)...
echo  ----------------------------------------------------------------
call npm install
echo.

echo  [PASO 3/3] Construyendo nueva version (Build)...
echo  ----------------------------------------------------------------
echo  Esto puede tomar unos momentos...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] La construccion fallo.
    pause
    exit /b
)
echo.

cls
echo.
echo  ================================================================
echo   ACTUALIZACION COMPLETADA CON EXITO
echo  ================================================================
echo.
echo  El sistema esta listo para usar.
echo.
echo  Presione cualquier tecla para cerrar...
pause >nul