import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import CharacterChatPage from './pages/CharacterChatPage';
import InsertCharacterPage from './pages/InsertCharacterPage';
import GroupCharacterPage from './pages/GroupChattingPage';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark mode palettes (if needed in the future) */
// import '@ionic/react/css/palettes/dark.always.css';
// import '@ionic/react/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';

import TalkingPage from './pages/TalkingPage';
import { useEffect } from 'react';



import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";


// Use Ionic's animation configuration
import { createAnimation } from '@ionic/react';

import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

import SplashScreen2 from "./components/SplashScreen";
import LoginScreen from './components/LoginScreen'; // Import the login screen
import CharacterChatPage2 from './pages/CharacterChatPage2';

import CharacterChatPage3 from './pages/Characterchat3';
import CharacterInfoModal from './components/CharacterInfoModal';
import { onAuthStateChanged } from 'firebase/auth';
import CreateGroupPage from './pages/CreateGroupPage';


StatusBar.setBackgroundColor({ color: '#ffffff' }); // White background
StatusBar.setStyle({ style: Style.Light}); // Dark text/icons (for iOS)





// Add this to your page components
export const pageTransition = (baseEl: HTMLElement) => {
    const enteringAnimation = createAnimation()
        .addElement(baseEl)
        .duration(250)
        .easing('cubic-bezier(0.36,0.66,0.04,1)')
        .fromTo('opacity', 0, 1)
        .fromTo('transform', 'translateY(24px)', 'translateY(0)');

    const leavingAnimation = createAnimation()
        .addElement(baseEl)
        .duration(200)
        .easing('ease-out')
        .fromTo('opacity', 1, 0)
        .fromTo('transform', 'translateY(0)', 'translateY(24px)');

    return { entering: enteringAnimation, leaving: leavingAnimation };
};

PushNotifications.addListener("pushNotificationReceived", async (notification) => {
  console.log("📩 Notification received:", notification);

  const title = notification.data?.title || "New Notification";
  const body = notification.data?.body || "You have a new message!";
  const imageUrl = notification.data?.imageUrl || "default_icon";

  // Manually show local notification
  await LocalNotifications.schedule({
    notifications: [
      {
        id: new Date().getTime(),
        title,
        body,
        attachments: imageUrl !== "default_icon" ? [{ id: "profile_pic", url: imageUrl }] : [],
        largeIcon: imageUrl !== "default_icon" ? imageUrl : "ic_launcher",
        smallIcon: "ic_launcher",
        actionTypeId: "OPEN_CHAT"
      }
    ]
  });
});



// Configure Ionic with direction-aware animations
setupIonicReact({
  navAnimation: (navEl: HTMLElement, opts: any) => {
    // Define animations for different directions
    const isForward = opts.direction === 'forward';
    const enteringEl = opts.enteringEl;
    const leavingEl = opts.leavingEl;

    // Common animation settings
    const duration = 300;
    const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

    // Forward animation (new page enters from right)
    if (isForward) {
      return createAnimation()
        .addElement(enteringEl)
        .duration(duration)
        .easing(easing)
        .fromTo('transform', 'translateX(100%)', 'translateX(0)')
        .fromTo('opacity', 0.5, 1)
        .addAnimation(
          createAnimation()
            .addElement(leavingEl)
            .duration(duration)
            .easing(easing)
            .fromTo('transform', 'translateX(0)', 'translateX(-20%)')
            .fromTo('opacity', 1, 0.4)
        );
    }

    // Backward animation (previous page returns from left)
    return createAnimation()
      .addElement(enteringEl)
      .duration(duration)
      .easing(easing)
      .fromTo('transform', 'translateX(-20%)', 'translateX(0)')
      .fromTo('opacity', 0.4, 1)
      .addAnimation(
        createAnimation()
          .addElement(leavingEl)
          .duration(duration)
          .easing(easing)
          .fromTo('transform', 'translateX(0)', 'translateX(100%)')
          .fromTo('opacity', 1, 0.5)
      );
  }
});



const App: React.FC = () => {
  // Place the useEffect hook inside the functional component

  useEffect(() => {
    // Set status bar properties
    StatusBar.setBackgroundColor({ color: '#ffffff' }); // White background
    StatusBar.setStyle({ style: Style.Dark }); // Dark icons (time, battery)
    StatusBar.setOverlaysWebView({ overlay: false }); // Ensure status bar doesn't overlay content
  }, []);

  useEffect(() => {
    // Status bar configuration
    const configureStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        // For Android
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setBackgroundColor({ color: '#FFFFFFFF' }); // White with full opacity
        }
        // For iOS
        await StatusBar.setStyle({ style: Style.Light });
      }
    };

    configureStatusBar();
  }, []);





  return (
    <IonApp className="force-light-theme">
      <IonReactRouter>
        <IonRouterOutlet animated={true}>
          <Route exact path="/splash" component={SplashScreen2} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/login" component={LoginScreen} />
          <Route exact path="/character-chat/:id" component={CharacterChatPage} />
          <Route exact path="/character-chat-2/:id" component={CharacterChatPage2} />
          <Route exact path="/character-chat-3/:id" component={CharacterChatPage3} />
          <Route exact path="/group-chat/:id" component={GroupCharacterPage} />
          <Route exact path="/create-group" component={CreateGroupPage} />

          
          <Route path="/talking/:id" component={TalkingPage} />
          <Route exact path="/insert-character" component={InsertCharacterPage} />

          <Route exact path="/" component={SplashScreen2}>
          </Route>
          <Route path="/character-info" component={CharacterInfoModal}/>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
