import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from "@capacitor/keyboard"; // Import the enum


const config: CapacitorConfig = {
  appId: 'com.ain-hub.speakingcharacter',
  appName: 'Ai Speaking Character',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },

  plugins: {
    Keyboard: {
      resize: KeyboardResize.None, // Prevents layout resizing
      resizeOnFullScreen: true, // Avoids auto-scrolling issues
    },
    SplashScreen: {
      launchShowDuration: 0, // Set to 0 to prevent automatic display
      launchAutoHide: false, // Prevent automatic hiding
      launchFadeOutDuration: 3000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false, // Disable spinner if using a custom splash
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    },
    PushNotifications: {
      presentationOptions: ['sound', 'alert'],
      importance: 'high'
    },


    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
      ios: {
        google: {
          // ✅ Use the iOS Client ID from your Firebase project (NOT Google Cloud Console)
          clientId: '1062145262228-oretu54sc6igv9flm26ni0mgq8vjipil.apps.googleusercontent.com',
          // ✅ Use the Firebase Web Client ID
          serverClientId: '722483342463-8p84ja4pbeh2i2r0cbqqdp0q6bqd6uo2.apps.googleusercontent.com'
        }
      }
    },
    AppleSignIn: {
      clientId: 'com.ain-hub.speakingcharacter', // Match your iOS bundle ID
      scopes: 'email name', // Requested permissions
      redirectURI: 'https://your-firebase-project.firebaseapp.com/__/auth/handler' // Firebase redirect
    }

  },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'always'
  }
  
};

export default config;
