import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

const Chats: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <div className="chats-container">
          <h1>Chats Page</h1>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Chats; 