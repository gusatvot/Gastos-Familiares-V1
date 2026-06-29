import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Reemplazá estos valores con los que copiaste de Firebase Console
const firebaseConfig = {
 apiKey: "AIzaSyCt-DnGiZ2kMVDCDhkBkqRt7FuxCuOe4WI",
  authDomain: "gastos-familiares-v2.firebaseapp.com",
  projectId: "gastos-familiares-v2",
  storageBucket: "gastos-familiares-v2.firebasestorage.app",
  messagingSenderId: "1061896921257",
  appId: "1:1061896921257:web:27f6786c9b7b34a0e009b8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();