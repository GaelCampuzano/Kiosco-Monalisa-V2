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
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Iconos**: Lucide React
- **Efectos**: Canvas Confetti
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Cuenta de Firebase con proyecto configurado

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
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

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
│   └── firebase.ts      # Configuración de Firebase
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
5. Los datos se guardan automáticamente en Firebase

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
- Autenticación mediante Firebase Auth
- Protección de rutas administrativas
- Validación de datos en cliente y servidor

## 🎨 Personalización

Los colores y estilos están definidos en `app/globals.css` usando variables de Tailwind personalizadas:
- `monalisa-navy`: Color principal oscuro
- `monalisa-gold`: Color dorado de acento
- `monalisa-bronze`: Color bronce
- `monalisa-silver`: Color plateado para texto

## 📝 Notas

- El proyecto está optimizado para uso en tablets tipo kiosco
- La interfaz está diseñada para ser intuitiva y rápida
- Los datos se almacenan en Firebase Firestore
- El sistema soporta múltiples idiomas (ES/EN)

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno de Sunset Monalisa.
