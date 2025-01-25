import React from 'react';
import { IonModal, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem } from '@ionic/react';
import './CategoryPopup.css'; // Add your custom styles here

const CategoryPopup: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (category: string) => void }> = ({ isOpen, onClose, onSelect }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Select Category</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem button onClick={() => { onSelect('Category 1'); onClose(); }}>
            Category 1
          </IonItem>
          <IonItem button onClick={() => { onSelect('Category 2'); onClose(); }}>
            Category 2
          </IonItem>
        </IonList>
        <IonButton expand="full" onClick={onClose}>Close</IonButton>
      </IonContent>
    </IonModal>
  );
};

export default CategoryPopup;