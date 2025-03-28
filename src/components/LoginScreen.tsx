// LoginPage.tsx
import { IonContent, IonPage, IonButton, IonIcon, IonSpinner, useIonRouter, IonModal, IonToast } from '@ionic/react';
import { logoGoogle, logoApple } from 'ionicons/icons';

import { Capacitor } from '@capacitor/core';
import { useState, useEffect, useRef } from 'react';
import './LoginPage.css';


import { CapacitorConfig } from '@capacitor/cli';
import React from 'react';
import { signInWithPopup } from "firebase/auth";

import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signInWithRedirect } from 'firebase/auth';


import {  getRedirectResult } from "firebase/auth";

import { useAuth } from '../context/AuthContext';

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { SignInWithApple } from '@capacitor-community/apple-sign-in';

import { OAuthProvider, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Add Firestore

import { SplashScreen } from '@capacitor/splash-screen'; // Import SplashScreen directly

const LoginPage: React.FC = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const router = useIonRouter();

  const { user, signInWithGoogle } = useAuth();
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const user = await GoogleAuth.signIn();
      console.log('Google user:', user);
      
      await sendGoogleDataToApi(user);
      
    } catch (error) {
      console.error('Error signing in:', error);
      showToastMessage('Error signing in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const sendGoogleDataToApi = async (user: any) => {
    setApiLoading(true);
    const { name, email, imageUrl } = user;

    const response = await fetch('https://speakingcharacter.ai/ios/googleSignin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        name: name,
        email: email,
        profile_pic: imageUrl,
      }).toString(),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      console.log('Token stored:', data.token);
      
      // Show the default splash screen
      SplashScreen.show(); // Show the default splash screen

      SplashScreen.hide(); // Hide the splash screen
      router.push('/home'); // Navigate to the home page
    
      
    } else {
      console.error('API error:', response.statusText);
      showToastMessage('Error sending Google data. Please try again.');
    }
    setApiLoading(false);
  };

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Sign-In Timeout!")), 10000) // 10s timeout
  );
  

  
  
  const appleSignIn = async () => {
    try {
      // ✅ Use the correct method name: authorize()
      const result = await SignInWithApple.authorize();
  
      // Create Firebase credential
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: result.response.identityToken // From Apple response
      });
  
      // Sign in to Firebase
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
    }
  };

  const sendAppleDataToApi = async (userData: { name: string; email: string; imageUrl: string; token: string }) => {
    setApiLoading(true);
    try {
      console.log("Inside the Api hitting");
      const { name, email, imageUrl, token } = userData;

      const response = await fetch('https://speakingcharacter.ai/ios/appleSignin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: name,
          email: email,
          profile_pic: imageUrl,
          token: token, // Include the token if needed
        }).toString(),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        console.log('Token stored:', data.token);
        
        // Show the default splash screen
        SplashScreen.show(); // Show the default splash screen
        SplashScreen.hide(); // Hide the splash screen
        router.push('/home'); // Navigate to the home page
      } else {
        console.error('API error:', response.statusText);
        showToastMessage('Error sending Apple data. Please try again.');
      }
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      showToastMessage('Error sending Apple data. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  const sendAppleNullDataToApi = async (userData: {token: string }) => {
    try{
      console.log("Inside the Api hitting")
    setApiLoading(true);
    const {token } = userData;

    const response = await fetch('https://speakingcharacter.ai/ios/appleSignin/with/null/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: token
      }).toString(),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      console.log('Token stored:', data.token);
      
      // Show the default splash screen
      SplashScreen.show(); // Show the default splash screen
      SplashScreen.hide(); // Hide the splash screen
      router.push('/home'); // Navigate to the home page
    } else {
      console.error('API error:', response.statusText);
    }
    setApiLoading(false);
  } catch (error) {
    console.error('Apple Sign-In Error:', error);
  }
  };

  const appleSignIn2 = async () => {
    console.log("Inside the Apple Log In");
    try {
      setAppleLoading(true);
      const result = await SignInWithApple.authorize({
        scopes: 'email name',
        clientId: 'com.ain-hub.speakingcharacter',
        redirectURI: 'https://videos-downloader-13024.firebaseapp.com/__/auth/handler'
      });

      console.log("Response from apple login :::: ", result.response);

      const { identityToken, email, givenName, familyName, user } = result.response;

      const displayName = `${givenName} ${familyName}`.trim();


      // Check if email is not null and send data to API
      if (email && user) {
        console.log("EMail ::::::::::", email)
        const profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(givenName)}&background=random`;

        // Call the sendAppleDataToApi function
        await sendAppleDataToApi({
          name: displayName,
          email: email || '',
          imageUrl: profilePicUrl,
          token: user // Pass the token if needed
        });

        // Show the default splash screen
        SplashScreen.show(); // Show the default splash screen
        SplashScreen.hide(); // Hide the splash screen
        router.push('/home'); // Navigate to the home page
      }
      else{
        if(user)
          {sendAppleNullDataToApi({token: user})}
        else{
          showToastMessage('Error signing in with Apple. Please try again.');
        }
      }

      console.log("familyName::::::", familyName);
      console.log("email::::::", email);
      console.log("givenName::::::", givenName);

    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      showToastMessage('Error signing in with Apple. Please try again.');
    } finally {
      setAppleLoading(false);
    }
  };







  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
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

useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        const user = result.user;
        console.log("User signed in:", user);
      }
    })
    .catch((error) => {
      console.error("Error handling redirect result:", error);
    });
}, []);
  
  

// Apple Sign-In (iOS only)
const appleLogin = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    setAppleLoading(true);
  //  const result = await FirebaseAuthentication.signInWithApple({
   //   skipNativeAuth: false,
 //     scopes: ['name', 'email']
  //  });
 //   console.log('Apple auth success:', result);
  } catch (error) {
    console.error('Apple auth error:', error);
  } finally {
    setAppleLoading(false);
  }
};







return (
  <IonPage>
    <IonContent fullscreen className="login-content"  forceOverscroll={false} scrollY={false}>
      <div className="auth-container">
        <div className="header-section">
          <h1 className="welcome-text">Step into conversations that sound real🎙️</h1>
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

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />

        <div className="auth-buttons">
          <IonButton 
            expand="block" 
            className="apple-btn"
            onClick={appleSignIn2}
            disabled={appleLoading || apiLoading}
          >
            {appleLoading ? (
              <IonSpinner name="crescent" />
            ) : (
              <>
                <IonIcon icon={logoApple} slot="start" />
                Continue with Apple
              </>
            )}
          </IonButton>

          <IonButton 
            expand="block" 
            className="google-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || apiLoading}
          >
            {googleLoading ? (
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