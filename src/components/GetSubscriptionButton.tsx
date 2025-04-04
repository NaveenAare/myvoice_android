import React, { useEffect, useState } from 'react';
import { IonButton, IonImg, useIonRouter } from '@ionic/react';
import './GetSubscriptionButton.css';
import SubscriptionModal from '../components/newSub'

const GetSubscriptionButton: React.FC = () => {
    const router = useIonRouter();
    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null); // Initialize as null for loading state

    const authTokens = localStorage.getItem("authToken");

    const user_sub_status = localStorage.getItem("user_sub_status");
    const user_sub_exp_date = localStorage.getItem("user_sub_exp_date");
    const [showModal, setShowModal] = useState(false);

    const handlePlanSelection = (plan: 'monthly' | 'yearly') => {
          console.log('Selected plan:', plan);
          // Add your payment processing logic here
          setShowModal(false);
        };
    

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                /*const response = await fetch('https://speakingcharacter.ai/is/user/subscribed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        authToken: authTokens || ''
                    }),
                });

                const data = await response.json();
                console.log("API Response:", data);*/ // Log the response for debugging

                if(user_sub_exp_date && user_sub_status){

                    if (user_sub_status?.toLowerCase() === 'true' && user_sub_exp_date) {
                        const expirationDate = new Date(user_sub_exp_date);
                        const currentDate = new Date();
                
                        if (expirationDate > currentDate) {
                            setIsSubscribed(false); // Exit early if already subscribed
                        }else{
                            setIsSubscribed(false);
                        }
                    }else{
                        setIsSubscribed(false);
                    }

                } else{
                    const response = await fetch('https://speakingcharacter.ai/is/user/subscribed', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            authToken: authTokens || ''
                        }),
                    });
    
                    const data = await response.json();
                    console.log("API Response:", data);
                    if (data.is_subscribed) {
                        setIsSubscribed(true); // User is subscribed
                    } else {
                        setIsSubscribed(false); // User is not subscribed
                    }
                }

                
                
            } catch (error) {
                console.error('Error fetching subscription status:', error);
                setIsSubscribed(false); // Handle error case
            }
        };

        checkSubscription();
    }, [authTokens]); // Add authTokens as a dependency

    // Hide the button while loading or if the user is subscribed
    if (isSubscribed === null) {
        return null; // Hide the button while loading
    }

    // Only render the button if the user is not subscribed
    if (isSubscribed) {
        return null; // Hide the button if subscribed
    }

    const goToCreateGroup = () => {
        setShowModal(true); // Navigate to the subscription page
    };

    return (
        <div className="button-container">
            <button className="subscribe-button" onClick={goToCreateGroup}>
                <img src="assets/6941697.png" width={10} height={10} alt="Crown Icon" />
                More Voices, More Fun!
            </button>
            <SubscriptionModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelectPlan={handlePlanSelection}
        />
        </div>
    );
};

export default GetSubscriptionButton; 