# Guía de Despliegue en Producción (Windows)

Esta guía detalla cómo preparar y ejecutar la aplicación **Kiosco Monalisa V2** en un entorno de producción.

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

## 3. Ejecución y Automatización

Hemos creado dos archivos `.bat` en la carpeta del proyecto para facilitar todo:

### A. Para el uso diario (Inicio Automático)

Usa el archivo **`start-kiosco.bat`**.

**Para que inicie automáticamente con Windows:**

1.  Presiona `Windows + R` en tu teclado.
2.  Escribe `shell:startup` y presiona Enter. Se abrirá una carpeta.
3.  Crea un **Acceso Directo** del archivo `start-kiosco.bat` y pégalo dentro de esa carpeta de inicio.
    - _Nota:_ Esto iniciará la app automáticamente cada vez que inicies sesión en la PC.

### B. Para Actualizar (Despliegue)

Usa el archivo **`update-kiosco.bat`**.
Ejecuta este archivo manualmente cuando sepas que hay cambios en el código. Este script se encargará de:

1.  Descargar el código nuevo (`git pull`).
2.  Instalar librerías (`npm install`).
3.  Compilar la app (`npm run build`).

> **Importante**: No pongas `update-kiosco.bat` en el inicio automático, ya que haría el arranque de la PC muy lento innecesariamente. Solo úsalo cuando necesites actualizar.
