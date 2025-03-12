import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithCredential, 
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

interface AuthContextModel {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextModel>({} as AuthContextModel);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // This uses the Capacitor plugin to authenticate with Google
      const googleUser = await GoogleAuth.signIn();
      
      // Create a credential from the Google ID token
      const credential = GoogleAuthProvider.credential(
       googleUser.authentication.idToken
      );
      
      // Sign in to Firebase with the Google credential
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error("Error signing in with Google", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error name:", error.name);
      }
      console.error("Full error details:", JSON.stringify(error, null, 2));
    }
  };


  const signInWithApple = async () => {
    try {
      const appleUser = await AppleSignIn.signIn();
      console.log('Apple user:', appleUser);
  
      // Create a credential from the Apple ID token
      const credential = GoogleAuthProvider.credential(appleUser.identityToken);
      
      // Sign in to Firebase with the Apple credential
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error("Error signing in with Apple", error);
    }
  };

  const signOut = async () => {
    try {
      // Sign out from both Firebase and Google
      await firebaseSignOut(auth);
      //await GoogleAuth.signOut();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
