import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

const Profile: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <div className="profile-container">
          <h1>Profile Page</h1>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile; 