import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  quickAdminLogin: () => Promise<void>;
  quickStudentLogin: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BOOTSTRAP_ADMIN_EMAIL = 'deepka2772@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize Firestore User Document
  const syncUserProfile = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const isBootstrappedAdmin = (user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase());

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // Verify admin document or email check
        let role: UserRole = data.role || 'student';
        if (isBootstrappedAdmin) {
          role = 'admin';
        } else {
          const adminRef = doc(db, 'admins', user.uid);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            role = 'admin';
          }
        }

        const profile: UserProfile = {
          ...data,
          role,
          name: data.name || user.displayName || 'Aspire Student',
          email: user.email || data.email,
          photoURL: user.photoURL || data.photoURL || '',
          updatedAt: new Date().toISOString(),
        };

        // If bootstrapped admin and role wasn't updated, update in db
        if (isBootstrappedAdmin && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin', updatedAt: new Date().toISOString() });
          // also ensure admin document exists
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            uid: user.uid,
            addedAt: new Date().toISOString(),
          }, { merge: true });
        }

        setUserProfile(profile);
        setIsAdmin(role === 'admin');
      } else {
        // Create initial profile: newly registered user is student, unless bootstrapped admin
        const initialRole: UserRole = isBootstrappedAdmin ? 'admin' : 'student';
        const newProfile: UserProfile = {
          userId: user.uid,
          name: user.displayName || 'Aspire Student',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: initialRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, newProfile);
        if (isBootstrappedAdmin) {
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            uid: user.uid,
            addedAt: new Date().toISOString(),
          }, { merge: true });
        }

        setUserProfile(newProfile);
        setIsAdmin(initialRole === 'admin');
      }
    } catch (err) {
      console.error('Failed to sync user profile:', err);
      // Fallback local representation
      const isBootstrappedAdmin = (user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase());
      setUserProfile({
        userId: user.uid,
        name: user.displayName || 'Aspire Student',
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: isBootstrappedAdmin ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
      });
      setIsAdmin(isBootstrappedAdmin);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      // If user does not exist yet and it's the bootstrap admin, automatically create account
      if (
        (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') &&
        cleanEmail.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()
      ) {
        try {
          const newRes = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          if (newRes.user) {
            await syncUserProfile(newRes.user);
            return;
          }
        } catch (regErr) {
          throw err;
        }
      }
      throw err;
    }
  };

  const quickAdminLogin = async () => {
    const adminEmail = BOOTSTRAP_ADMIN_EMAIL;
    const adminPass = 'Admin@123456';
    try {
      const result = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        const newRes = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
        if (newRes.user) {
          await syncUserProfile(newRes.user);
        }
      } else {
        throw err;
      }
    }
  };

  const quickStudentLogin = async () => {
    const studentEmail = 'student.demo@aspireacademy.in';
    const studentPass = 'Student@123456';
    try {
      const result = await signInWithEmailAndPassword(auth, studentEmail, studentPass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        const newRes = await createUserWithEmailAndPassword(auth, studentEmail, studentPass);
        if (newRes.user) {
          await syncUserProfile(newRes.user);
        }
      } else {
        throw err;
      }
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (result.user) {
      const user = result.user;
      const isBootstrappedAdmin = (email.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase());
      const role: UserRole = isBootstrappedAdmin ? 'admin' : 'student';

      const initialProfile: UserProfile = {
        userId: user.uid,
        name: name.trim(),
        email: email.trim(),
        photoURL: '',
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), initialProfile);
      if (isBootstrappedAdmin) {
        await setDoc(doc(db, 'admins', user.uid), {
          email: user.email,
          uid: user.uid,
          addedAt: new Date().toISOString(),
        });
      }

      setUserProfile(initialProfile);
      setIsAdmin(role === 'admin');
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await syncUserProfile(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        quickAdminLogin,
        quickStudentLogin,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
