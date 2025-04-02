import React from 'react';
import { IonModal, IonButton, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';

interface TourModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose }) => {
    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Welcome to Our App!</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div style={{ padding: '20px' }}>
                    <h2>App Tour</h2>
                    <p>Here are some features of our application:</p>
                    <ul>
                        <li>Feature 1: Description of feature 1.</li>
                        <li>Feature 2: Description of feature 2.</li>
                        <li>Feature 3: Description of feature 3.</li>
                    </ul>
                    <IonButton expand="full" onClick={onClose}>Got it!</IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default TourModal; 