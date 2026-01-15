# Guía de Despliegue en Producción (Windows)

Esta guía detalla cómo preparar y ejecutar la aplicación **Kiosco Monalisa V2** en un entorno de producción utilizando Windows, asegurando que se reinicie automáticamente si el servidor se apaga.

## 1. Prerrequisitos

- **Node.js**: Asegúrate de tener Node.js instalado (v18 o superior).
- **Base de Datos**: MySQL debe estar corriendo.
- **Git**: Para descargar actualizaciones.

## 2. Construcción (Build)

Antes de ejecutar en producción, debemos compilar la aplicación para asegurar el máximo rendimiento.

```powershell
# En la carpeta del proyecto
npm run build
```

> **Nota**: Debes ejecutar esto cada vez que hagas cambios en el código.

## 3. Instalación de PM2

[PM2](https://pm2.keymetrics.io/) es un gestor de procesos que mantendrá tu aplicación viva 24/7.

```powershell
# Instalar PM2 globalmente
npm install -g pm2
```

## 4. Ejecutar la Aplicación con PM2

Para máxima estabilidad en Windows, hemos creado un archivo de configuración `ecosystem.config.js` que maneja los detalles técnicos.

```powershell
# Iniciar la app usando la configuración guardada
pm2 start ecosystem.config.js
```

### Comandos útiles de PM2:

- **Guardar cambios**: `pm2 save` (Esencial después de cualquier cambio de configuración)
- **Ver estado**: `pm2 status`
- **Ver logs**: `pm2 logs kiosco-monalisa`
- **Reiniciar**: `pm2 restart kiosco-monalisa`
- **Detener**: `pm2 stop kiosco-monalisa`
- **Eliminar**: `pm2 delete kiosco-monalisa`

## 5. Configurar Inicio Automático en Windows

Para que la aplicación se inicie sola cuando se reinicia la computadora o el servidor, necesitamos instalar un complemento para servicios de Windows.

### Opción A: Usando `pm2-startup` (Recomendado)

1.  **Instalar el paquete de soporte para Windows:**

    ```powershell
    npm install -g pm2-windows-startup
    ```

2.  **Instalar el script de inicio:**

    ```powershell
    pm2-startup install
    ```

3.  **Guardar la lista de procesos actuales:**
    Asegúrate de que tu app ya esté corriendo (Paso 4) y luego ejecuta:
    ```powershell
    pm2 save
    ```

¡Listo! Ahora, si reinicias Windows, PM2 arrancará automáticamente y levantará el Kiosco Monalisa en segundo plano.

## 6. Actualizar la Aplicación

Cuando haya cambios en el código (git pull), el proceso es:

1.  Descargar cambios: `git pull`
2.  Instalar dependencias nuevas (si hay): `npm install`
3.  Reconstruir: `npm run build`
4.  Reiniciar proceso: `pm2 restart kiosco-monalisa`

## 7. Solución de Problemas

**Si PM2 no inicia al reiniciar:**

- Verifica que el usuario de Windows tenga contraseña (a veces el auto-login sin contraseña da problemas con servicios).
- Intenta ejecutar PowerShell como Administrador al instalar `pm2-startup`.

**Si la app falla:**

- Revisa los logs: `pm2 logs kiosco-monalisa`
