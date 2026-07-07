import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Recargar el usuario para obtener el estado más reciente de emailVerified
        await currentUser.reload();
        const updatedUser = auth.currentUser;
        setUser(updatedUser);
        // Verificar explícitamente el estado de emailVerified
        setIsEmailVerified(updatedUser?.emailVerified || false);
      } else {
        setUser(null);
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Recargar el usuario después del login para obtener el estado actualizado de emailVerified
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setIsEmailVerified(auth.currentUser.emailVerified || false);
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Recargar el usuario después del login para obtener el estado actualizado de emailVerified
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setIsEmailVerified(auth.currentUser.emailVerified || false);
      }
    } catch (error) {
      console.error('Error al iniciar sesión con email:', error);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);
    } catch (error) {
      console.error('Error al registrarse:', error);
      throw error;
    }
  };

  const resendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
    } catch (error) {
      console.error('Error al reenviar correo:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isEmailVerified,
      loginWithGoogle, 
      loginWithEmail,
      registerWithEmail,
      resendVerification,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };