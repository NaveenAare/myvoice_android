// LoginPage.tsx
import { IonContent, IonPage, IonButton, IonIcon, IonSpinner, useIonRouter, IonModal } from '@ionic/react';
import { logoGoogle, logoApple } from 'ionicons/icons';

import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';
import './LoginPage.css';


import { CapacitorConfig } from '@capacitor/cli';
import React from 'react';
import { signInWithPopup } from "firebase/auth";

import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signInWithRedirect } from 'firebase/auth';

import { Browser } from '@capacitor/browser';




const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
      const router = useIonRouter();




    
      const signInWithGoogle2 = async () => {
        try {
          // Sign in using Capacitor Firebase Plugin
          const result = await FirebaseAuthentication.signInWithGoogle();
          
          if (result.credential?.idToken) {
            // Convert Capacitor response to Firebase Credential
            const credential = GoogleAuthProvider.credential(result.credential.idToken);
            const user = await signInWithCredential(auth, credential);
            console.log('Google Sign-In Success:', user);
            router.push("/home")
            return user;
          }
        } catch (error) {
          console.error('Error during Google Sign-In:', error);
        }
      };


 
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Sign-In Timeout!")), 10000) // 10s timeout
    );
    
    const signInWithGoogle23 = async () => {
      try {
        if (Capacitor.getPlatform() === 'ios') {
          try {
            console.log("🔹 Starting Google Sign-In...");
            const result = await Promise.race([FirebaseAuthentication.signInWithGoogle(), timeout]);
            console.log("✅ Google Sign-In Success:", result);
        } catch (error) {
            console.error("❌ Google Sign-In Failed:", error);
            alert("Google Sign-In Error: " + JSON.stringify(error, null, 2));
        }
        } else {
          // Web/Android Flow
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        }
      } catch (error) {
        console.error('Google Sign-In Error:', error);
        throw error;
      }
    };

    
    
    
    async function signInWithGoogleclaude() {
      try {
        // This will use the native sign-in flow on iOS
        const result = await FirebaseAuthentication.signInWithGoogle();
        
        // You can then use the credentials with Firebase if needed
        console.log('User signed in:', result);
        return result;
      } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    }

    const signIn = async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error("Error during sign-in:", error);
      }
    };

    const handleSignIn = async () => {
      try {
        const user = await signInWithGoogleclaude();
        console.log('Sign in successful:', user);
      } catch (error) {
        console.error('Sign in failed:', error);
      }
    };

      const signInWithGoogle = async () => {
        try {
          console.log("Google Sign-In Started");
      
          // Check if FirebaseAuthentication plugin is available
          if (Capacitor.getPlatform() === "ios") {
            if (!FirebaseAuthentication) {
              console.error("❌ FirebaseAuthentication plugin is missing! Run `npx cap sync ios`.");
              return;
            }
      
            console.log("Inside iOS logic...");
      
            const result = await FirebaseAuthentication.signInWithGoogle();
            console.log("Google Sign-In Result:", result);
      
            if (result.credential?.idToken) {
              const credential = GoogleAuthProvider.credential(
                result.credential.idToken,
                result.credential.accessToken
              );
              const user = await signInWithCredential(auth, credential);
              console.log("iOS Google Sign-In Success:", user);
              router.push("/home")
              return user;
            }
          } else {
            // Web/Android Flow
            const provider = new GoogleAuthProvider();
            await signInWithRedirect(auth, provider);
            router.push("/home")
          }
        } catch (error) {
          console.error("Google Sign-In Error:", error);
        }
      };
      
      

  const config: CapacitorConfig = {
    appId: "com.ain-hub.speakingcharacter",
    appName: "Speaking Character",
    webDir: "build",
    plugins: {
      GoogleAuth: {
        scopes: ["profile", "email"],
        serverClientId: "722483342463-8p84ja4pbeh2i2r0cbqqdp0q6bqd6uo2.apps.googleusercontent.com",
        forceCodeForRefreshToken: true,
      },
    },
  };





  

  







  

  // Apple Sign-In (iOS only)
  const appleLogin = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      setLoading('apple');
    //  const result = await FirebaseAuthentication.signInWithApple({
     //   skipNativeAuth: false,
   //     scopes: ['name', 'email']
    //  });
   //   console.log('Apple auth success:', result);
    } catch (error) {
      console.error('Apple auth error:', error);
    } finally {
      setLoading(null);
    }
  };


  const signI = async () => {
    try {
      console.log("Google Sign-In Started");
  
      if (Capacitor.getPlatform() === "ios") {
        const result = await FirebaseAuthentication.signInWithGoogle();
        console.log("Google Sign-In Result:", result);
  
        if (result.credential?.idToken) {
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          const user = await signInWithCredential(auth, credential);
          console.log("iOS Google Sign-In Success:", user);
          router.push("/home");
          return user;
        }
      } else {
        // Web/Android Flow
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
        router.push("/home");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };




  return (
    <IonPage>
      <IonContent fullscreen className="login-content"  forceOverscroll={false} scrollY={false}>
        <div className="auth-container">
          <div className="header-section">
            <h1 className="welcome-text">Step into conversations that sound real🚀🎙️</h1>
          </div>

<div className="graphic-section">
  <div className="animated-blob"></div>
  <div className="chat-bubbles">
    {/* Bubble 1 with message icon */}
    <div className="bubble bubble-1">
    <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/ed873758-8ed7-4583-9936-68ee0f1ebd62.jpeg?alt=media&token=234f01c3-8499-40dc-9043-d9517ec20f5f" 
        alt="Chat"
        className="bubble-image"
      />
    </div>
    
    {/* Bubble 2 with person icon */}
    <div className="bubble bubble-2">
    <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/15ff6547-b433-4778-9bd2-c090647f9538.jpeg?alt=media&token=01eb9bbc-7cce-4337-83ac-6350253320b9" 
        alt="Chat"
        className="bubble-image"
      />
    </div>
    
    {/* Bubble 3 with text */}
    <div className="bubble bubble-3">
    <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/b1e60f08-53bc-4b8c-a2b5-74d7681120bd.jpeg?alt=media&token=af953da5-ab0f-445d-b042-8761c5bbe760" 
        alt="Chat"
        className="bubble-image"
      />
    </div>
    
    {/* Bubble 4 with heart icon */}
    <div className="bubble bubble-4">
    <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/275f8540-22e7-4e90-b3b8-5b0ea873309b.jpeg?alt=media&token=534a2a25-d30f-4cb6-8d64-2492835e5695" 
        alt="Chat"
        className="bubble-image"
      />
    </div>
    
    {/* Bubble 5 with image */}
    <div className="bubble bubble-5">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/5c8d30f5-b561-46bb-9247-95cd48b3f29c.jpeg?alt=media&token=27edf9e7-b88a-4f94-b88d-6b34eb002089" 
        alt="Chat"
        className="bubble-image"
      />
    </div>

    <div className="bubble bubble-6">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/8ab9d4fd-c2d0-47d7-9ce4-24867f044d76.jpeg?alt=media&token=b2c36b01-0a27-4e12-9ff9-ca04e3096df7" 
        alt="Chat"
        className="bubble-image"
      />
    </div>

    <div className="bubble bubble-7">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/39830faa-7041-4044-99b6-7f9a1e795240.jpeg?alt=media&token=e8d960a0-2300-495f-9aa7-288db0671aea" 
        alt="Chat"
        className="bubble-image"
      />
    </div>

    <div className="bubble bubble-8">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/35a74013-c6bd-4b74-a29b-7c3de880a8cb.jpeg?alt=media&token=ab5d4955-7065-4716-b849-3ab9be1cb2e7" 
        alt="Chat"
        className="bubble-image"
      />
    </div>

    <div className="bubble bubble-9">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/3bea4bd7-1a8c-449f-83e9-40250bd437af.jpeg?alt=media&token=197902f3-9f0b-415f-8a9b-9bf8c1dc651c" 
        alt="Chat"
        className="bubble-image"
      />
    </div>

    <div className="bubble bubble-10">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/0f4c9607-577e-4cc9-9823-cf0266ad2c19.jpeg?alt=media&token=06928697-fd05-40d3-8ed5-1293481da1fc" 
        alt="Chat"
        className="bubble-image"
      />
    </div>

    <div className="bubble bubble-11">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/7176e94b-9769-4bd8-bebd-8b46459c6ce3.jpeg?alt=media&token=bce0c0db-5751-47ac-9adb-fd60ee3b868c" 
        alt="Chat"
        className="bubble-image"
      />
    </div>


    <div className="bubble bubble-12">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/videos-downloader-13024.appspot.com/o/55205a60-979a-4054-b29d-6928537417b0.jpeg?alt=media&token=4f71975e-f35b-4504-b971-bf904d35d8bd" 
        alt="Chat"
        className="bubble-image"
      />
    </div>


  </div>
</div>

          <div className="auth-buttons">
            { (
              <IonButton 
                expand="block" 
                className="apple-btn"
                onClick={appleLogin}
                disabled={!!loading}
              >
                {loading === 'apple' ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon icon={logoApple} slot="start" />
                    Continue with Apple
                  </>
                )}
              </IonButton>
            )}

            <IonButton 
              expand="block" 
              className="google-btn"
              onClick={signI}
              disabled={!!loading}
            >
              {loading === 'google' ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon icon={logoGoogle} slot="start" />
                  Continue with Google
                </>
              )}
            </IonButton>

            
          </div>
          
        </div>


      </IonContent>
    </IonPage>
  );
};

export default LoginPage;