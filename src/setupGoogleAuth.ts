import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { isPlatform } from '@ionic/react';

export const initializeGoogleAuth = () => {
  // Initialize Google Auth for web
  if (!isPlatform('capacitor')) {
   GoogleAuth.initialize({
      clientId: '1062145262228-oretu54sc6igv9flm26ni0mgq8vjipil.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }
};