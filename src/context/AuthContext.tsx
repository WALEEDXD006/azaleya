import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Profile } from '@/lib/types';

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (fbUser: FirebaseUser): Promise<User> => {
    try {
      const ref = doc(db, 'profiles', fbUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        return {
          id: fbUser.uid,
          email: fbUser.email || '',
          full_name: data.full_name || null,
          phone: data.phone || null,
          role: data.role || 'customer',
          created_at: data.created_at || new Date().toISOString(),
        };
      } else {
        // Create default profile if missing
        const isAdmin = fbUser.email === import.meta.env.VITE_ADMIN_EMAIL;
        const newProfile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          full_name: fbUser.displayName || null,
          phone: null,
          role: isAdmin ? 'admin' : 'customer',
          created_at: new Date().toISOString(),
        };
        await setDoc(ref, newProfile);
        return newProfile as User;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return {
        id: fbUser.uid,
        email: fbUser.email || '',
        full_name: fbUser.displayName || null,
        phone: null,
        role: 'customer',
        created_at: new Date().toISOString(),
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const u = await fetchProfile(fbUser);
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err: any) {
      console.error('Firebase signin error:', err);
      let msg = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      return { error: msg };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const isAdmin = email === import.meta.env.VITE_ADMIN_EMAIL;
      const profileData = {
        id: cred.user.uid,
        email: cred.user.email,
        full_name: fullName,
        phone: null,
        role: isAdmin ? 'admin' : 'customer',
        created_at: new Date().toISOString(),
      };
      await setDoc(doc(db, 'profiles', cred.user.uid), profileData);
      setUser(profileData as User);
      return { error: null };
    } catch (err: any) {
      console.error('Firebase signup error:', err);
      let msg = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      return { error: msg };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const u = await fetchProfile(auth.currentUser);
      setUser(u);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile: user, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
