import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

// ...

export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // For Android: Disable overlay and set background color
      if (this.platform.is('android')) {
        // Disable status bar overlay (critical for Android)
        StatusBar.setOverlaysWebView({ overlay: false });
        // Set background color (use 8-digit hex with alpha channel)
        StatusBar.setBackgroundColor({ color: '#FFFFFFFF' }); // Alpha FF = opaque
      }

      // For iOS: Set style to light (dark text/icons)
      if (this.platform.is('ios')) {
        StatusBar.setStyle({ style: Style.Light });
      }
    });
  }
}