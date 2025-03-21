import React, { useEffect, useRef } from 'react';
import { useIonRouter, IonPage, IonContent } from '@ionic/react';
import './SplashScreen.css'; // Create a CSS file for styling

const SPLASH_DURATION = 3000; // You can also consider importing this from a config file

const SplashScreen2: React.FC = () => {
    const router = useIonRouter();
    const hasNavigated = useRef(false);

    useEffect(() => {
        if (hasNavigated.current) return;

        const timer = setTimeout(() => {
            if (!hasNavigated.current) {
                hasNavigated.current = true;
                router.push('/home', 'forward', 'push');
            }
        }, SPLASH_DURATION); // Use the constant here

        return () => {
            clearTimeout(timer);
            hasNavigated.current = true;
        };
    }, [router]);

    return (
        <IonPage className="splash-screen-page">
            <IonContent className="ion-no-padding">
                <div className="splash-screen">
                    <img src="/assets/logo.png" alt="Splash" /> {/* Replace with your image path */}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default SplashScreen2; 