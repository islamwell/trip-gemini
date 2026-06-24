import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, ConfirmationResult } from 'firebase/auth';
import { onAuthStateChanged, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPhoneNumber } from 'firebase/auth';
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
  signInWithIdentifierAndPasscode: (identifier: string, passcode: string) => Promise<void>;
  sendPhoneSms: (phone: string, appVerifier: any) => Promise<ConfirmationResult>;
  confirmPhoneSms: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOnboardingStatus: (signed: boolean, langSet: boolean) => void;
  updateParticipantProfile: (data: any) => Promise<void>;
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
          const isAdminEmail = firebaseUser.email?.toLowerCase() === 'admin@nrq.no';
          // Fetch Role and Onboarding Status
          const docRef = doc(db, 'participants', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const resolvedRole = isAdminEmail ? 'admin' : (data.role as 'participant' | 'admin');
            setRole(resolvedRole);
            
            if (isAdminEmail) {
              setLanguageSet(true);
              setHasSignedRules(true);
              // Force role: 'admin' in database if it's different
              if (data.role !== 'admin' || !data.languageSet || !data.hasSignedRules) {
                await setDoc(docRef, { role: 'admin', languageSet: true, hasSignedRules: true }, { merge: true });
              }
            } else {
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
            }
          } else {
            // Auto-create participant profile
            const resolvedRole = isAdminEmail ? 'admin' : 'participant';
            await setDoc(docRef, {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || (isAdminEmail ? 'Admin' : 'Participant'),
              role: resolvedRole,
              language: 'en',
              languageSet: isAdminEmail, // Admin doesn't need to pick language
              hasSignedRules: isAdminEmail, // Admin doesn't need to sign rules
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setRole(resolvedRole);
            setLanguageSet(isAdminEmail);
            setHasSignedRules(isAdminEmail);
          }

        } catch (error) {
          console.error("Error fetching user data:", error);
          setRole(firebaseUser.email?.toLowerCase() === 'admin@nrq.no' ? 'admin' : 'participant');
          setHasSignedRules(firebaseUser.email?.toLowerCase() === 'admin@nrq.no');
          setLanguageSet(firebaseUser.email?.toLowerCase() === 'admin@nrq.no');
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
    const isMinAdmin = email.toLowerCase() === 'admin@nrq.no';
    if (isMinAdmin && password !== 'readquran114' && password !== 'radquran114') {
      throw new Error("Incorrect admin password.");
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

  const signInWithIdentifierAndPasscode = async (identifier: string, passcode: string) => {
    // Determine if it's an email or a phone number
    const isEmail = identifier.includes('@');
    const synthesizedEmail = isEmail ? identifier.toLowerCase() : `${identifier.replace(/[^0-9+]/g, '')}@trip-oslo.web.app`;
    
    // Pad passcode to meet Firebase's 6 char minimum
    const paddedPassword = passcode ? `${passcode}-triposlo` : 'nopasscode-triposlo';

    await signInWithPassword(synthesizedEmail, paddedPassword);
  };

  const sendPhoneSms = async (phone: string, appVerifier: any) => {
    // Format phone to international if missing + (Assuming Norway +47 as default if not specified)
    let formattedPhone = phone.startsWith('+') ? phone : `+47${phone.replace(/^0+/, '')}`;
    return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
  };

  const confirmPhoneSms = async (confirmationResult: ConfirmationResult, code: string) => {
    await confirmationResult.confirm(code);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateOnboardingStatus = (signed: boolean, langSet: boolean) => {
    if (signed) setHasSignedRules(true);
    if (langSet) setLanguageSet(true);
  };

  const updateParticipantProfile = async (data: any) => {
    if (!user) return;
    await setDoc(doc(db, 'participants', user.uid), data, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, role, hasSignedRules, languageSet, 
      sendMagicLink, completeSignIn, signInWithPassword, 
      signInWithIdentifierAndPasscode, sendPhoneSms, confirmPhoneSms,
      logout, updateOnboardingStatus, updateParticipantProfile 
    }}>
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
