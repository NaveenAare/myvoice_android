import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.speakcharai.app',
  appName: 'speak-char-ai',
  webDir: 'www',
  
    "plugins": {
      "SplashScreen": {
        "launchShowDuration": 3000,
        "launchAutoHide": true,
        "launchFadeOutDuration": 3000,
        "backgroundColor": "#ffffffff",
        "androidSplashResourceName": "splash",
        "androidScaleType": "CENTER_CROP",
        "showSpinner": true,
        "androidSpinnerStyle": "large",
        "iosSpinnerStyle": "small",
        "spinnerColor": "#999999",
        "splashFullScreen": true,
        "splashImmersive": true,
        "layoutName": "launch_screen",
        "useDialog": true
      },
  },
};

export default config;
