# Kiosco Monalisa v2

Sistema de gestión de propinas digital para Sunset Monalisa. Aplicación web moderna diseñada para facilitar la selección de propinas por parte de los clientes y la gestión administrativa de las mismas.

## 🎯 Características Principales

- **Interfaz de Usuario Premium**: Diseño elegante y moderno utilizando **shadcn/ui** y **Tailwind CSS 4**.
- **Sistema de Propinas Intuitivo**: Selección rápida de porcentajes con feedback visual y animaciones (**Framer Motion**, **Canvas Confetti**).
- **Modo Oscuro**: Soporte nativo para temas claro y oscuro.
- **Panel de Administración Completo**:
  - Dashboard con métricas clave y gráficos.
  - Gestión de tickets con estado y detalles.
  - Tabla de propinas con filtros y búsqueda.
  - Exportación de datos.
- **Rastreo de Tickets**: Página pública para que los clientes consulten el estado de su ticket.
- **Internacionalización**: Soporte bilingüe (Español/Inglés).
- **Base de Datos Serverless**: Almacenamiento escalable y rápido con **Neon (PostgreSQL)**.
- **Testing**: Pruebas unitarias e integración con **Vitest**.

## 🛠️ Tecnologías

- **Core**: Next.js 16 (App Router), React 19
- **Estilos**: Tailwind CSS 4, shadcn/ui
- **Animaciones**: Framer Motion, Canvas Confetti
- **Base de Datos**: Neon (PostgreSQL) con driver Serverless
- **Iconos**: Lucide React
- **Notificaciones**: Sonner
- **Testing**: Vitest, React Testing Library
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta en [Neon](https://neon.tech) (para la base de datos)

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone <tu-repositorio>
   cd kiosco-monalisa-v2
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**:
   Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes variables:

   ```env
   # Configuración de Base de Datos (Neon)
   DATABASE_URL="postgres://usuario:password@endpoint.neon.tech/kiosco_monalisa?sslmode=require"

   # Credenciales de Administrador
   ADMIN_USER="admin"
   ADMIN_PASSWORD="tu_contraseña_segura"
   ```

4. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🧪 Pruebas

El proyecto utiliza **Vitest** para las pruebas.

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
│   ├── actions/          # Server Actions (lógica de servidor)
│   ├── admin/            # Rutas y componentes del panel de administración
│   ├── components/       # Componentes de UI compartidos (shadcn, etc.)
│   ├── login/            # Página de inicio de sesión
│   ├── tickets/          # Página pública de rastreo de tickets
│   └── layout.tsx        # Layout raíz
├── hooks/                # Custom React Hooks
├── lib/                  # Utilidades y configuración (db.ts, utils.ts)
├── public/               # Archivos estáticos
├── types/                # Definiciones de tipos TypeScript
└── __tests__/            # Pruebas unitarias y de integración
```

## 🚀 Despliegue

La aplicación está optimizada para desplegarse en **Vercel**.

1. Sube tu código a un repositorio de GitHub.
2. Importa el proyecto en Vercel.
3. Configura las variables de entorno (`DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`) en la configuración del proyecto en Vercel.
4. Despliega.

> **Nota**: Asegúrate de que tu base de datos Neon esté configurada correctamente para aceptar conexiones desde Vercel (generalmente abierto a todas las IPs o configurado con integración de Vercel).

## 📄 Licencia

Este proyecto es de uso exclusivo para Sunset Monalisa.
