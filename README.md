# Kiosco Monalisa v2

Sistema de gestión de propinas digital para Sunset Monalisa. Aplicación web moderna diseñada para facilitar la selección de propinas por parte de los clientes y la gestión administrativa de las mismas.

## 🎯 Características Principales

- **Interfaz de Usuario Premium**: Diseño elegante y moderno utilizando **shadcn/ui** y **Tailwind CSS 4**.
- **Sistema de Propinas Intuitivo**: Selección rápida de porcentajes con feedback visual y animaciones (**Framer Motion**, **Canvas Confetti**).
- **Modo Oscuro**: Soporte nativo para temas claro y oscuro.
- **Panel de Administración Completo**:
  - **Dashboard**: Métricas clave y gráficos de rendimiento.
  - **Gestión de Propinas**: Tabla detallada con filtros por fecha, mesero y búsqueda.
  - **Gestión de Meseros**: Alta, baja y administración de personal de servicio.
  - **Configuración**: Ajuste dinámico de porcentajes de propina permitidos.
  - **Exportación**: Descarga de reportes en formato CSV.
- **Rastreo de Tickets**: Página pública para que los clientes consulten el estado de su ticket.
- **PWA Ready**: Aplicación instalable con soporte offline básico (`next-pwa`).
- **Internacionalización**: Soporte bilingüe (Español/Inglés).
- **Base de Datos**: MySQL (compatible con proveedores como PlanetScale, AWS RDS, Azure o local).
- **Seguridad**: Autenticación básica para administración y rutas protegidas.

## 🛠️ Tecnologías

- **Core**: Next.js 16 (App Router), React 19
- **Estilos**: Tailwind CSS 4, shadcn/ui
- **Animaciones**: Framer Motion, Canvas Confetti
- **Base de Datos**: MySQL (driver `mysql2`)
- **Iconos**: Lucide React
- **Notificaciones**: Sonner
- **Testing**: Vitest, React Testing Library
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

- Node.js 18+
- Servidor MySQL (Local o en la nube como Neon/PlanetScale/AWS)

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/GaelCampuzano/Kiosco-Monalisa-V2.git
   cd kiosco-monalisa-v2
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**:
   Crea un archivo `.env` o `.env.local` en la raíz del proyecto y añade las siguientes variables:

   ```env
   # Configuración de Base de Datos MySQL
   MYSQL_HOST="localhost"
   MYSQL_USER="root"
   MYSQL_PASSWORD="tu_password"
   MYSQL_DATABASE="kiosco_monalisa"
   MYSQL_PORT="3306"
   # Poner en "true" si la DB requiere SSL (ej. Azure/AWS)
   MYSQL_SSL="false"

   # Credenciales de Administrador
   ADMIN_USER="admin"
   ADMIN_PASSWORD="tu_contraseña_segura"
   ```

4. **Inicializar la Base de Datos**:
   Ejecuta el script de configuración para crear las tablas necesarias (`tips`, `waiters`, `app_settings`):

   ```bash
   npm run db:setup
   ```

5. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🧪 Pruebas

El proyecto utiliza **Vitest** para las pruebas unitarias y de integración.

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm test -- --watch
```

## 📁 Estructura del Proyecto

```
kiosco-monalisa-v2/
├── app/
│   ├── actions/          # Server Actions (lógica de servidor y DB)
│   ├── admin/            # Panel de administración (Dashboard, Propinas, Meseros, Config)
│   ├── components/       # Componentes de UI compartidos
│   ├── login/            # Página de inicio de sesión
│   ├── tickets/          # Página pública de rastreo de tickets
│   └── layout.tsx        # Layout raíz
├── hooks/                # Custom React Hooks (useAdminData, etc.)
├── lib/                  # Utilidades y configuración (db.ts, utils.ts)
├── public/               # Archivos estáticos
├── scripts/              # Scripts de utilidad (db-setup.ts)
├── types/                # Definiciones de tipos TypeScript
└── __tests__/            # Pruebas manuales/unitarias
```

## 🚀 Despliegue

La aplicación está optimizada para desplegarse en **Vercel** o cualquier hosting compatible con Next.js.

1. **Variables de Entorno**: Asegurate de configurar todas las variables `MYSQL_*` y `ADMIN_*` en tu plataforma de hosting.
2. **Base de Datos**: Verifica que tu base de datos permita conexiones externas desde la IP de tu hosting.
3. **Build**: El comando de build estándar es `npm run build`.

## 📄 Licencia

Este proyecto es de uso exclusivo para Sunset Monalisa.
