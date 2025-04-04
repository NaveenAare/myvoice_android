// SubscriptionModal.tsx
import React from 'react';
import { IonModal, IonButton, IonGrid, IonRow, IonCol, IonIcon, IonText } from '@ionic/react';
import { heartOutline, ribbonOutline, closeOutline } from 'ionicons/icons';
import './newSub.css';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'monthly' | 'yearly') => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  return (
    <IonModal 
      isOpen={isOpen} 
      className="memory-modal"
      swipeToClose={true}
      onDidDismiss={onClose}
      breakpoints={[0, 0.9]}
      initialBreakpoint={0.9}
    >
      <div className="modal-content">
        <IonButton fill="clear" className="close-button" onClick={onClose}>
          <IonIcon icon={closeOutline} />
        </IonButton>

        <div className="header-section">
          <IonText className="title">Keep Memories Alive</IonText>
          <IonText className="security-note">Reconnect with loved ones—past or present—for just $5.9. Because some conversations deserve a second chance. ❤️✨</IonText>
        </div>

        <IonGrid className="plan-grid">
          <IonRow className="custom-row">
            <IonCol className="custom-col">
              <div className="plan-card monthly" onClick={() => onSelectPlan('monthly')}>
                <div className="plan-badge">
                  <IonIcon icon={ribbonOutline} className="ribbon-icon" />
                  <span>Flexible</span>
                </div>
                <div className="price-container">
                  <span className="strike-price">$10.00</span>
                  <span className="original-price">$5.90</span>
                </div>
                <IonText className="plan-duration">per month</IonText>
                <ul className="plan-features">
                  <li>Unlimited conversations</li>
                  <li>Unlimited Characters Creation</li>
                  <li>Unlimited Group Creation</li>
                  <li>Unlimited Image Responses</li>
                  <li>Unlimited TTS Downloads</li>
                </ul>
                <button className="select-button" onClick={() => onSelectPlan('monthly')}>
                  Select Monthly Plan
                </button>
              </div>
            </IonCol>
          </IonRow>

          <IonText className="security-note">
          <IonIcon icon="shield-checkmark" /> Your memories are securely stored
        </IonText>

        <div className="footer-links">
          <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
          <span> | </span>
          <a href="/terms-and-conditions" className="footer-link">Terms and Conditions</a>
          <span> | </span>
          <a href="/terms-and-conditions" className="footer-link">Contact-us</a>
        </div>

        </IonGrid>

       
      </div>
    </IonModal>
  );
};

export default SubscriptionModal;