// gaelcampuzano/kiosco-monalisa-v2/Kiosco-Monalisa-V2-fb21c9b3474eb42df592d7d6737038bd55dab866/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// [NUEVO] Importar getAuth
import { getAuth } from "firebase/auth"; //

const firebaseConfig = {
  // Asegúrate de que todas estas variables (NEXT_PUBLIC_...) estén configuradas 
  // en tu archivo .env.local o en las variables de entorno de Vercel.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase solo si no existe una instancia previa (Singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp(); //

// Inicializar Firestore (Base de datos)
const db = getFirestore(app); //

// [NUEVO] Inicializar Auth
const auth = getAuth(app);

// [MODIFICADO] Exportar db y auth
export { db, auth };