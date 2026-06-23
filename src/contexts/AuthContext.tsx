import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: 'participant' | 'admin' | null;
  hasSignedRules: boolean;
  languageSet: boolean;
  sendMagicLink: (email: string) => Promise<void>;
  completeSignIn: (email: string, windowUrl: string) => Promise<void>;
  signInWithPassword: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOnboardingStatus: (signed: boolean, langSet: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'participant' | 'admin' | null>(null);
  const [hasSignedRules, setHasSignedRules] = useState(false);
  const [languageSet, setLanguageSet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Fetch Role and Onboarding Status
          const docRef = doc(db, 'participants', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role as 'participant' | 'admin');
            setLanguageSet(!!data.languageSet);
            
            if (data.hasSignedRules) {
              setHasSignedRules(true);
            } else {
              // Fallback for legacy signature validation
              const sigRef = collection(db, 'signatures');
              const q = query(sigRef, where('participantId', '==', firebaseUser.uid));
              const sigSnap = await getDocs(q);
              const signed = !sigSnap.empty;
              setHasSignedRules(signed);
              if (signed) {
                // Update profile as single source of truth
                await setDoc(docRef, { hasSignedRules: true }, { merge: true });
              }
            }
          } else {
            // Auto-create participant profile
            await setDoc(docRef, {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'Participant',
              role: 'participant',
              language: 'en',
              languageSet: false, // Force them to pick
              hasSignedRules: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setRole('participant');
            setLanguageSet(false);
            setHasSignedRules(false);
          }

        } catch (error) {
          console.error("Error fetching user data:", error);
          setRole('participant');
          setHasSignedRules(false);
          setLanguageSet(false);
        }
      } else {
        setRole(null);
        setHasSignedRules(false);
        setLanguageSet(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendMagicLink = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/login',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  };

  const completeSignIn = async (email: string, windowUrl: string) => {
    if (isSignInWithEmailLink(auth, windowUrl)) {
      await signInWithEmailLink(auth, email, windowUrl);
      window.localStorage.removeItem('emailForSignIn');
    }
  };

  const signInWithPassword = async (email: string, password?: string) => {
    if (!password) {
      throw new Error("Password is required to sign in.");
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (createError: any) {
          if (createError.code === 'auth/email-already-in-use') {
            throw new Error("This email is already registered. Try logging in with your password.");
          } else if (createError.code === 'auth/operation-not-allowed') {
            throw new Error("Email/Password sign-in is not enabled in Firebase Console. Please enable it in Authentication -> Sign-in method.");
          } else {
            throw createError;
          }
        }
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error("Email/Password sign-in is not enabled in Firebase Console. Please enable it in Authentication -> Sign-in method.");
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateOnboardingStatus = (signed: boolean, langSet: boolean) => {
    if (signed) setHasSignedRules(true);
    if (langSet) setLanguageSet(true);
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, hasSignedRules, languageSet, sendMagicLink, completeSignIn, signInWithPassword, logout, updateOnboardingStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
