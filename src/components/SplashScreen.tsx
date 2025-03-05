import React, { useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import './SplashScreen.css'; // Create a CSS file for styling

const SplashScreen2: React.FC = () => {
    const router = useIonRouter();

    

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(`/home`, 'back', 'push');
        }, 3000);

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [router]);

    return (
        <div className="splash-screen">
            <img src="/assets/logo.png" alt="Splash" /> {/* Replace with your image path */}
        </div>
    );
};

export default SplashScreen2; 