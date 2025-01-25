import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import CharacterChatPage from './pages/CharacterChatPage';

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
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import TalkingPage from './pages/TalkingPage';
import { useEffect } from 'react';

// Initialize Ionic
setupIonicReact();

const App: React.FC = () => {
  // Place the useEffect hook inside the functional component
  useEffect(() => {
    // Force light mode by removing dark mode class
    document.body.classList.remove('dark');
    document.body.classList.add('light'); // Ensure light mode is added

    // Handle system theme changes
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', (e) => {
      document.body.classList.remove('dark'); // Force light mode even if the system changes
      document.body.classList.add('light');
    });

    // Cleanup the listener to avoid memory leaks
    return () => prefersDark.removeEventListener('change', () => {});
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/character-chat/:id" component={CharacterChatPage} />
          <Route path="/talking/:id" component={TalkingPage} />
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
