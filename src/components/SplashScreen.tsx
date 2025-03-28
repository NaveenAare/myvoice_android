import React, { useEffect, useRef } from 'react';
import { useIonRouter, IonPage, IonContent } from '@ionic/react';
import './SplashScreen.css'; // Ensure you have styles defined here

const SPLASH_DURATION = 1000; // Duration for the splash screen

const SplashScreen: React.FC = () => {
    const router = useIonRouter();
    const hasNavigated = useRef(false);

    useEffect(() => {
        if (hasNavigated.current) return;

        const timer = setTimeout(() => {
            if (!hasNavigated.current) {
                hasNavigated.current = true;
                router.push('/home', 'forward', 'push');
            }
        }, SPLASH_DURATION);

        return () => {
            clearTimeout(timer);
            hasNavigated.current = true;
        };
    }, [router]);

    return (
        <IonPage className="splash-screen-page">
            <IonContent className="ion-no-padding splash-content">
                <div className="splash-screen">
                    <img src="/assets/logo.png" alt="Splash" className="splash-image" /> {/* Replace with your image path */}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default SplashScreen; 