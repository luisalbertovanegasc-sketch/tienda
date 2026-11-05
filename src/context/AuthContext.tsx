import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider, signInWithPopup, signOut } from '../lib/firebase.ts';
import { syncUserWithDb } from '../services/api.ts';
import { AppUser } from '../types.ts';

interface AuthContextType {
  firebaseUser: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setAdminOverride: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminOverride, setAdminOverrideState] = useState<boolean>(() => {
    return localStorage.getItem('fenix_admin_override') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const synced = await syncUserWithDb({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
          });
          setAppUser(synced);
        } catch (err) {
          console.error('Error syncing user with database:', err);
          setAppUser({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            role: 'admin', // default to admin for store owner convenience
          });
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      // Fallback for sandboxed iframes where popup may be blocked
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
        alert('La ventana emergente de inicio de sesión fue bloqueada. Puedes usar el modo de acceso directo de administrador.');
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setAppUser(null);
    setAdminOverrideState(false);
    localStorage.removeItem('fenix_admin_override');
  };

  const setAdminOverride = (enabled: boolean) => {
    setAdminOverrideState(enabled);
    localStorage.setItem('fenix_admin_override', enabled ? 'true' : 'false');
  };

  const isAdmin = adminOverride || appUser?.role === 'admin' || !firebaseUser; // Store owner can manage anytime

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        isAdmin,
        loading,
        loginWithGoogle,
        logout,
        setAdminOverride,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
