import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
};

type AuthContextValue = {
  user: User | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
};

// ─── Admin Seed ──────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'officialazaleya@gmail.com';
const ADMIN_PASSWORD = 'Azaleya@12345';

/**
 * On app boot: check the `roles` collection for an existing admin entry.
 * If none exists, create the Firebase Auth account and seed both
 * the `profiles` and `roles` documents.
 */
async function seedAdminIfNeeded() {
  try {
    // Check if admin role entry already exists
    const rolesSnap = await getDocs(
      query(collection(db, 'roles'), where('role', '==', 'admin'))
    );
    if (!rolesSnap.empty) return; // Admin already exists — nothing to do

    // Create the Firebase Auth account
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = cred.user.uid;
    const now = new Date().toISOString();

    // Create profile document
    await setDoc(doc(db, 'profiles', uid), {
      id: uid,
      email: ADMIN_EMAIL,
      full_name: 'Azaleya Admin',
      phone: null,
      role: 'admin',
      created_at: now,
    });

    // Create roles document
    await setDoc(doc(db, 'roles', uid), {
      user_id: uid,
      email: ADMIN_EMAIL,
      role: 'admin',
      created_at: now,
    });

    // Sign back out so the app starts in a logged-out state
    await firebaseSignOut(auth);
    console.log('✅ Admin account seeded successfully');
  } catch (err: any) {
    // auth/email-already-in-use means admin auth exists but roles doc was missing — patch it
    if (err.code === 'auth/email-already-in-use') {
      console.log('Admin auth account already exists.');
    } else {
      console.error('Admin seed error:', err);
    }
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Seed admin on first load
  useEffect(() => {
    seedAdminIfNeeded();
  }, []);

  /**
   * Fetch user profile from `profiles` collection.
   * Role is always read from the `roles` collection (source of truth).
   */
  const fetchProfile = async (fbUser: FirebaseUser): Promise<User> => {
    try {
      const profileRef = doc(db, 'profiles', fbUser.uid);
      const profileSnap = await getDoc(profileRef);

      // Determine role from `roles` collection
      const roleRef = doc(db, 'roles', fbUser.uid);
      const roleSnap = await getDoc(roleRef);
      const role: UserRole = roleSnap.exists() ? (roleSnap.data().role as UserRole) : 'user';

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        // Keep profile role in sync with roles collection
        if (data.role !== role) {
          await setDoc(profileRef, { ...data, role }, { merge: true });
        }
        return {
          id: fbUser.uid,
          email: fbUser.email || '',
          full_name: data.full_name || null,
          phone: data.phone || null,
          role,
          created_at: data.created_at || new Date().toISOString(),
        };
      } else {
        // New user — create profile with role from roles collection (or default 'user')
        const newProfile: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          full_name: fbUser.displayName || null,
          phone: null,
          role,
          created_at: new Date().toISOString(),
        };
        await setDoc(profileRef, newProfile);
        return newProfile;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return {
        id: fbUser.uid,
        email: fbUser.email || '',
        full_name: null,
        phone: null,
        role: 'user',
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
      let msg = 'Failed to sign in. Please check your credentials.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
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
      const uid = cred.user.uid;
      const now = new Date().toISOString();

      // All new sign-ups are 'user' role
      const profileData: User = {
        id: uid,
        email: cred.user.email || email,
        full_name: fullName,
        phone: null,
        role: 'user',
        created_at: now,
      };

      await setDoc(doc(db, 'profiles', uid), profileData);

      // Create role entry in `roles` collection
      await setDoc(doc(db, 'roles', uid), {
        user_id: uid,
        email: cred.user.email || email,
        role: 'user',
        created_at: now,
      });

      // Send welcome / verification email via Firebase
      try {
        await sendEmailVerification(cred.user);
      } catch (_) {
        // Non-fatal — account is still created
      }

      setUser(profileData);
      return { error: null };
    } catch (err: any) {
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

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        return { error: 'No account found with this email address.' };
      } else if (err.code === 'auth/invalid-email') {
        return { error: 'Please enter a valid email address.' };
      }
      return { error: 'Failed to send reset email. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, signIn, signUp, signOut, refreshProfile, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
