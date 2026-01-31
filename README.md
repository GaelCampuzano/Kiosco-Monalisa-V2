# Kiosco Monalisa v2

Sistema de gestión de propinas digital para Sunset Monalisa. Aplicación web de alto rendimiento diseñada para facilitar la selección de propinas por parte de los clientes y optimizar la administración interna.

## 🎯 Características Principales

- **Interfaz de Usuario Premium**: Diseño elegante y moderno utilizando **shadcn/ui** y **Tailwind CSS 4**.
- **Optimización de Recursos**: Uso de imágenes en formato **WebP** y carga diferida para un rendimiento superior.
- **Sistema de Propinas Intuitivo**: Selección rápida de porcentajes con feedback visual, animaciones (**Framer Motion**) y efectos de celebración (**Canvas Confetti**).
- **Panel de Administración Refinado**:
  - **Dashboard**: Métricas en tiempo real y visualización de datos.
  - **Gestión de Propinas**: Historial detallado con filtros avanzados y búsqueda inteligente.
  - **Gestión de Meseros**: Control total sobre el personal activo y bajas.
  - **Configuración Dinámica**: Ajuste en tiempo real de los porcentajes de propina sugeridos.
- **Rastreo de Tickets**: Interfaz pública para consulta rápida de estado.
- **Automatización en Windows**: Scripts dedicados para arranque persistente y actualizaciones automáticas.
- **Documentación Interna**: Código fuente documentado íntegramente en español para facilitar el mantenimiento.
- **Base de Datos**: MySQL robusto con soporte para conexiones seguras (SSL).

## 🛠️ Tecnologías

- **Core**: Next.js 15.1 (App Router), React 19
- **Estilos**: Tailwind CSS 4, shadcn/ui
- **Animaciones**: Framer Motion, Canvas Confetti
- **Base de Datos**: MySQL (driver `mysql2`)
- **Iconos**: Lucide React
- **Notificaciones**: Sonner
- **Testing**: Vitest, React Testing Library
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

- **Node.js**: v18.0 o superior.
- **MySQL**: Servidor activo (Local o Cloud).
- **Sistema Operativo**: Optimizado para Windows (vía scripts .bat) pero compatible con Linux/macOS.

## 🚀 Instalación y Configuración

1. **Clonar y Acceder**:

   ```bash
   git clone https://github.com/GaelCampuzano/Kiosco-Monalisa-V2.git
   cd Kiosco-Monalisa-V2
   ```

2. **Variables de Entorno**:
   Crea un archivo `.env` en la raíz con:

   ```env
   MYSQL_HOST="tu_host"
   MYSQL_USER="tu_usuario"
   MYSQL_PASSWORD="tu_password"
   MYSQL_DATABASE="kiosco_monalisa"
   MYSQL_PORT="3306"
   MYSQL_SSL="false" # Cambiar a true si usas Azure/AWS
   ADMIN_USER="admin"
   ADMIN_PASSWORD="tu_contraseña"
   ```

3. **Inicialización**:
   ```bash
   npm install
   npm run db:setup
   ```

## ⚙️ Operación y Mantenimiento (Windows)

Para facilitar la operación en el servidor local de Sunset Monalisa, se han incluido scripts de automatización:

- **`start-server.bat`**:
  - Limpia procesos previos en el puerto 3000.
  - Detecta automáticamente la IP de la red local.
  - Inicia el servidor con auto-recuperación (si el proceso falla, se reinicia solo).
- **`update-server.bat`**:
  - Realiza un `git pull` (si está configurado), actualiza dependencias y re-construye el proyecto para aplicar cambios de forma segura.

## 📁 Estructura del Proyecto

```
Kiosco-Monalisa-V2/
├── app/
│   ├── actions/          # Lógica de servidor (Server Actions)
│   ├── admin/            # Panel administrativo
│   ├── components/       # Componentes de UI y Background optimizado
│   └── login/            # Sistema de acceso
├── hooks/                # Hooks personalizados (Admin y Datos)
├── lib/                  # Configuración de DB y utilidades core
├── public/               # Assets optimizados (bkg.webp, etc.)
├── scripts/              # Herramientas de mantenimiento de DB
└── __tests__/            # Suite de pruebas unitarias
```

## 🧪 Verificación

```bash
# Ejecutar tests
npm test

# Formatear código (Prettier)
npm run format
```

## 📄 Licencia

Este proyecto es propiedad exclusiva de Sunset Monalisa.
