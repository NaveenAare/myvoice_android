import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';

@NgModule({
  imports: [
    IonicModule.forRoot({
      mode: 'ios', // Optional: Force iOS style
      darkMode: 'class' // Disable automatic dark mode
    }),
    // ...
  ],
})
export class AppModule {
  constructor() {
    // Show the splash screen
    SplashScreen.show({
      showDuration: 3000, // Duration in milliseconds
      autoHide: true, // Automatically hide after duration
    });
  }
}