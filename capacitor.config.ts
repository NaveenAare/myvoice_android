import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from "@capacitor/keyboard"; // Import the enum


const config: CapacitorConfig = {
  appId: 'com.ain-hub.speakingcharacter',
  appName: 'SpeakCharAI',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  cordovaLinkerFlags: ["-ObjC"],
  googleAuth: {
    iosClientId: "1062145262228-oretu54sc6igv9flm26ni0mgq8vjipil.apps.googleusercontent.com"
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None, // Prevents layout resizing
      resizeOnFullScreen: true, // Avoids auto-scrolling issues
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
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
          clientId: '1062145262228-oretu54sc6igv9flm26ni0mgq8vjipil.apps.googleusercontent.com',
          serverClientId: '722483342463-8p84ja4pbeh2i2r0cbqqdp0q6bqd6uo2.apps.googleusercontent.com'
        }
      }
    },

  },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'always'
  }
  
};

export default config;
