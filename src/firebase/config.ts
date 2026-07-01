import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

/**
 * Configuración de Firebase desde variables de entorno.
 *
 * Las claves DEBEN estar prefijadas con VITE_ para ser expuestas al cliente.
 * Si falta alguna variable, la app falla temprano con un mensaje claro
 * en lugar de romperse silenciosamente en runtime.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validación: si falta alguna clave, fallar temprano con mensaje accionable.
const missingKeys = (Object.keys(firebaseConfig) as Array<keyof typeof firebaseConfig>)
  .filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  const msg =
    `[Firebase] Faltan variables de entorno: ${missingKeys.join(', ')}.\n` +
    `Copiá .env.example a .env.local y completá los valores desde Firebase Console.`;
  // En producción, mejor loggear que romper el render completo.
  console.error(msg);
  // En dev, lanzamos para que el desarrollador lo arregle antes de pushear.
  if (import.meta.env.DEV) {
    throw new Error(msg);
  }
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
