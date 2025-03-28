import React, { useEffect } from 'react';
import { IonButton, IonImg, useIonRouter } from '@ionic/react';
import './TopBanner.css';
import {useState } from 'react'; // Added useState


const CardComponent: React.FC = () => {
    const router = useIonRouter();
    const [images, setImages] = useState<string[]>([]); // State to hold image URLs
        const [loading, setLoading] = useState(true);


    const texts: string[] = [
        "AI-powered character creation 🤖",
        "Create and customize characters 😍",
        "Bring characters to life with AI 👻",
        "Voice cloning at its finest 🗣"
    ];
    
    let currentIndex: number = 0;

    let imagedomain = "https://speakingcharacter.ai"

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch('https://speakingcharacter.ai/static/config.json');
                const data = await response.json();
                const newImages = [
                    data.top_banner_image_center,
                    data.top_banner_image_left_1,
                    data.top_banner_image_left_2,
                    data.top_banner_image_rigtht_1,
                    data.top_banner_image_rigtht_2
                ].map(image => `${imagedomain}${image}`);

                setImages(newImages);
            } catch (error) {
                const newImages2 = [
                    '/assets/shrimmer.png',
                    "/assets/shrimmer.png",
                    "/assets/shrimmer.png",
                    "/assets/shrimmer.png",
                    "/assets/shrimmer.png"
                ].map(image => `${image}`);

                setImages(newImages2);
                console.error("Error fetching images:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    useEffect(() => {
        // Get the rotating text container
        const rotatingTextContainer = document.getElementById('rotating-text-container');

        if (rotatingTextContainer) {
            rotatingTextContainer.style.zIndex = '10';

            // Function to handle the text change with fade-down effect
            function updateText(): void {
                if (rotatingTextContainer) {
                rotatingTextContainer.classList.add('fade-out'); // Start fading out

                // Wait for the fade-out animation to finish before changing the text
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % texts.length; // Get the next text
                    rotatingTextContainer.textContent = texts[currentIndex]; // Update the text

                    rotatingTextContainer.classList.remove('fade-out'); // Remove fade-out class
                    rotatingTextContainer.classList.add('fade-in'); // Start fading in

                    // After fading in, remove the fade-in class to reset
                    setTimeout(() => {
                        rotatingTextContainer.classList.remove('fade-in');
                    }, 500); // Adjust this timing based on the duration of the fade-in effect
                }, 500);
             } // Adjust this timing based on the duration of the fade-out effect
            }

            // Set an interval to update the text every few seconds
            const intervalId = setInterval(updateText, 3000); // Adjust timing for display

            // Cleanup interval on unmount
            return () => clearInterval(intervalId);
        } else {
            console.error("Element with ID 'rotating-text-container' not found.");
        }
    }, []); // Runs only once after the component is mounted

    const goToCreateCharc = () => {
        router.push('/insert-character');
    };

    const goToCreateGroup = () => {
        //router.push('/create-group');
        router.push('/subscription', 'none')
    };

    return (
        <div className="top-banner-container">
            <div id="rotating-text-container" style={{ zIndex: 30, color: '#4A4A4A', fontFamily: 'Gill Sans, sans-serif' }}>
                <p id="rotating-text">Welcome to speaking Character.Ai</p>
            </div>
            <div className="image-carousel">
                {images.length > 0 ? images.map((src, index) => (
                    <IonImg key={index} className="carousel-image" src={src} alt={`Image ${index + 1}`} style={{ zIndex: 30 }} />
                )) : (
                    <p>Loading images...</p> // Placeholder while loading
                )}
            </div>
            <IonButton expand="full" onClick={goToCreateCharc} className="btn">
                <span className="btn-icon-wrapper">
                    <span className="btn-icon-line btn-icon-line1"></span>
                    <span className="btn-icon-line btn-icon-line2"></span>
                    <span className="btn-icon-line btn-icon-line3"></span>
                </span>
                Create new character
            </IonButton>

            <IonButton expand="full" onClick={goToCreateGroup} className="btn">
            <img src = "/assets/group_png.png" alt="Bot Avatar" className="message-avatar-top" />

                Create new Group
            </IonButton>
            
        </div>
    );
};

export default CardComponent;



