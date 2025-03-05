import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { homeOutline, chatbubblesOutline, personOutline, language, volumeHigh, text, logoSoundcloud, volumeHighSharp, fileTrayStackedOutline } from 'ionicons/icons';
import './BottomNavigation.css';

interface BottomNavigationProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onTabChange, activeTab }) => {
  return (
    <IonTabBar slot="bottom" className="bottom-nav">
  

  <IonTabButton
        tab="home"
        className={activeTab === 'home' ? 'active-tab' : ''}
        onClick={() => onTabChange('home')}
      >
        <IonIcon icon={homeOutline} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>


      <IonTabButton
        tab="chats"
        className={activeTab === 'chats' ? 'active-tab' : ''}
        onClick={() => onTabChange('chats')}
      >
        <IonIcon icon={chatbubblesOutline} />
        <IonLabel>Chats</IonLabel>
      </IonTabButton>




      <IonTabButton
        tab="TTS"
        className={activeTab === 'TTS' ? 'active-tab' : ''}
        onClick={() => onTabChange('TTS')}
      >
        <IonIcon icon={language} />
        <IonLabel>TTS</IonLabel>
      </IonTabButton>

      
      <IonTabButton
        tab="profile"
        className={activeTab === 'profile' ? 'active-tab' : ''}
        onClick={() => onTabChange('profile')}
      >
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>

      
    </IonTabBar>
  );
};

export default BottomNavigation;
