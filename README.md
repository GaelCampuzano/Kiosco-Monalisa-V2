# Kiosco Monalisa v2

Sistema de gestión de propinas digital para Sunset Monalisa. Aplicación web tipo kiosco que permite a los meseros configurar mesas y a los clientes seleccionar propinas de manera intuitiva y moderna.

## 🎯 Características

- **Interfaz de Kiosco**: Diseño elegante y moderno con animaciones fluidas
- **Sistema de Propinas**: Selección de propinas (20%, 23%, 25%) con efectos visuales
- **Panel de Administración**: Dashboard completo con estadísticas y exportación de datos
- **Modo Offline**: Funcionalidad completa sin conexión con sincronización automática
- **Bilingüe**: Soporte para español e inglés
- **PWA Ready**: Optimizado para instalación como aplicación web
- **Wake Lock**: Mantiene la pantalla activa durante el uso
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Animaciones**: Framer Motion
- **Base de Datos**: MySQL (compatible con bases de datos en la nube)
- **Autenticación**: Cookie-based authentication
- **Iconos**: Lucide React
- **Efectos**: Canvas Confetti
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Base de datos MySQL (local para desarrollo o en la nube para producción)

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd kiosco-monalisa-v2
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. Configura las variables de entorno. Crea un archivo `.env.local` en la raíz del proyecto:
```env
# Configuración de Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos
DB_SSL=false

# Configuración de Autenticación Admin
ADMIN_USER=admin
ADMIN_PASSWORD=tu_contraseña_admin_segura
```

**⚠️ IMPORTANTE para Vercel:**
- NO uses `localhost` o `127.0.0.1` en producción
- Necesitas una base de datos MySQL en la nube (PlanetScale, Railway, AWS RDS, Google Cloud SQL, etc.)
- Configura todas estas variables en **Vercel Environment Variables**:
  1. Ve a tu proyecto en Vercel
  2. Settings → Environment Variables
  3. Agrega cada variable para los entornos Production, Preview y Development
  4. Para bases de datos en la nube, generalmente necesitas:
     - `DB_SSL=true` (habilitado)
     - `DB_HOST` = el host proporcionado por tu proveedor (ej: `xxx.mysql.database.azure.com`)
     - `DB_PORT` = el puerto (generalmente 3306, pero verifica con tu proveedor)

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
kiosco-monalisa-v2/
├── app/
│   ├── actions/          # Server actions (autenticación)
│   ├── admin/            # Panel de administración
│   ├── components/       # Componentes reutilizables
│   ├── login/           # Página de login
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Página principal del kiosco
├── hooks/
│   └── useTips.ts       # Hook para gestión de propinas
├── lib/
│   └── db.ts            # Configuración de MySQL
├── types/
│   └── index.ts         # Definiciones de tipos TypeScript
└── public/              # Archivos estáticos
```

## 🎮 Uso

### Kiosco Principal (`/`)
1. El mesero ingresa el número de mesa y su nombre
2. Se presenta la interfaz al cliente
3. El cliente selecciona el porcentaje de propina deseado
4. Se muestra una pantalla de agradecimiento con efectos visuales
5. Los datos se guardan automáticamente en MySQL

### Panel de Administración (`/admin`)
- Requiere autenticación
- Visualiza todas las propinas registradas
- Estadísticas en tiempo real:
  - Total de registros
  - Promedio de propinas
  - Mesero más activo
- Exportación de datos a CSV
- Búsqueda y filtrado por mesero

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 🌐 Características Técnicas

### Modo Offline
- Los datos se guardan localmente cuando no hay conexión
- Sincronización automática al recuperar la conexión
- Indicador visual del estado de conexión

### PWA (Progressive Web App)
- Manifest configurado para instalación
- Optimizado para uso en tablets y dispositivos móviles
- Wake Lock para mantener la pantalla activa

### Seguridad
- Autenticación mediante cookies seguras
- Protección de rutas administrativas
- Validación de datos en cliente y servidor
- Conexiones SSL para bases de datos en la nube

## 🎨 Personalización

Los colores y estilos están definidos en `app/globals.css` usando variables de Tailwind personalizadas:
- `monalisa-navy`: Color principal oscuro
- `monalisa-gold`: Color dorado de acento
- `monalisa-bronze`: Color bronce
- `monalisa-silver`: Color plateado para texto

## 📝 Notas

- El proyecto está optimizado para uso en tablets tipo kiosco
- La interfaz está diseñada para ser intuitiva y rápida
- Los datos se almacenan en MySQL
- El sistema soporta múltiples idiomas (ES/EN)

## 🚀 Despliegue en Vercel

### Pasos para desplegar:

1. **Prepara tu base de datos MySQL en la nube:**
   - Opciones recomendadas: [PlanetScale](https://planetscale.com), [Railway](https://railway.app), [AWS RDS](https://aws.amazon.com/rds), [Google Cloud SQL](https://cloud.google.com/sql)
   - Crea una base de datos y obtén las credenciales de conexión

2. **Configura las variables de entorno en Vercel:**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega las siguientes variables para **todos los entornos** (Production, Preview, Development):
     ```
     DB_HOST=tu-host-mysql.ejemplo.com
     DB_PORT=3306
     DB_USER=tu_usuario
     DB_PASSWORD=tu_contraseña_segura
     DB_NAME=nombre_base_datos
     DB_SSL=true
     ADMIN_USER=admin
     ADMIN_PASSWORD=tu_contraseña_admin_segura
     ```

3. **Despliega:**
   - Conecta tu repositorio a Vercel
   - Vercel detectará automáticamente Next.js y desplegará
   - La aplicación creará automáticamente la tabla `tips` en la primera conexión

### ⚠️ Solución de problemas comunes:

- **Error: `ECONNREFUSED 127.0.0.1:3306`**
  - Asegúrate de que `DB_HOST` NO sea `localhost` o `127.0.0.1`
  - Usa el host proporcionado por tu proveedor de base de datos en la nube

- **Error: `SSL connection required`**
  - Configura `DB_SSL=true` en las variables de entorno

- **Error: `Access denied`**
  - Verifica que las credenciales (`DB_USER`, `DB_PASSWORD`) sean correctas
  - Asegúrate de que el usuario tenga permisos para crear tablas

- **La tabla no se crea automáticamente:**
  - Verifica los logs de Vercel para ver errores específicos
  - Asegúrate de que el usuario de la base de datos tenga permisos `CREATE TABLE`

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno de Sunset Monalisa.
