import React, { useState } from 'react';
import { IonContent, IonIcon, IonLabel, IonTabBar, IonTabButton, IonBadge } from '@ionic/react';
import { homeOutline, chatbubbleEllipsesOutline, personOutline } from 'ionicons/icons';
import './BottomNavigation.css'; // Import custom styles for navigation bar

const BottomNav: React.FC = () => {
  const [messageCount, setMessageCount] = useState<number>(5); // Message count example

  const navigateTo = (path: string) => {
    console.log(`Navigating to ${path}`);
    // Replace this with Ionic navigation logic
  };

  return (
    <IonContent>
      <IonTabBar slot="bottom" className="bottom-nav">
        {/* Chat Icon with Badge */}
        <IonTabButton tab="chat" onClick={() => navigateTo('/chat')}>
          <IonIcon icon={chatbubbleEllipsesOutline} />
          <IonLabel>Chat</IonLabel>
          {messageCount > 0 && (
            <IonBadge color="danger" className="badge">
              {messageCount}
            </IonBadge>
          )}
        </IonTabButton>

        {/* Home Icon */}
        <IonTabButton tab="home" onClick={() => navigateTo('/home')} className="home-btn">
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>

        {/* Profile Icon */}
        <IonTabButton tab="profile" onClick={() => navigateTo('/profile')}>
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonContent>
  );
};

export default BottomNav;
