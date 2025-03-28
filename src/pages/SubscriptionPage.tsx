import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { close, helpCircle } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import './SubscriptionPage.css';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

const SubscriptionPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const API_KEY = "appl_EGBtxzIFRLvGAxBqBwcPorXQGCT"; // Replace with your key

  const plans = [
    {
      id: 'monthly',
      name: '1 MONTH',
      price: '₹699.00',
      perMonth: '₹699.0/month',
    },
    {
      id: 'yearly',
      name: '12 MONTHS',
      price: '₹2,899.00',
      perMonth: '₹241.58/month',
      savings: 'SAVE 65%',
    },
    {
      id: 'quarterly',
      name: '3 MONTHS',
      price: '₹1,299.00',
      perMonth: '₹433/month',
    },
  ];

  async function getProducts() {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages.length > 0) {
        console.log("Available Subscriptions:", offerings.current.availablePackages);
        return offerings.current.availablePackages;
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  const handleSubscribe = async () => {
    const products = await getProducts();
    console.log("Products:", products);
    // Add your subscription logic here
  };

  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG); // Use setLogLevel instead
        await Purchases.configure({ apiKey: API_KEY });
        console.log("RevenueCat Initialized");
      } catch (error) {
        console.error("RevenueCat Initialization Error:", error);
      }
    };

    initializeRevenueCat();
  }, []);

  return (
    <IonPage>
      <IonContent className="subscription-content" fullscreen>
        <div className="top-bar">
          <IonButton fill="clear" className="close-button">
            <IonIcon icon={close} />
          </IonButton>
          <div className="header-title">UNLOCK <span className="pro">PRO</span> FEATURES</div>
          <IonButton fill="clear" className="help-button">
            <IonIcon icon={helpCircle} />
          </IonButton>
        </div>

        <div className="image-container">
          <img src="assets/try2.jpeg" alt="Main" className="main-image" />
        </div>

        <div className="bottom-section">
          <p className="description">Create your own Characters</p>

          <div className="plans-container">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.savings && <div className="savings-badge">{plan.savings}</div>}
                <div className="plan-price">{plan.perMonth}</div>
                <h3>{plan.name}</h3>
                <div className="total-price">{plan.price}</div>
              </div>
            ))}
          </div>

          <IonButton 
            expand="block" 
            className="subscribe-button"
            onClick={handleSubscribe}
          >
            Continue
          </IonButton>

          <p className="renewal-text">
            Your subscription will renew unless you cancel it in Appstore account
          </p>

          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Restore purchases</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SubscriptionPage; 