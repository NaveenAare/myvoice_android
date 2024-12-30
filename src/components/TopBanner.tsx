import React, { useEffect } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import './TopBanner.css';

const CardComponent: React.FC = () => {

    const texts: string[] = [
        "AI-powered character creation 🤖",
        "Create and customize characters 😍",
        "Bring characters to life with AI 👻",
        "Voice cloning at its finest 🗣"
    ];
    
    let currentIndex: number = 0;
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
    console.log('Navigating to Create Character');
    // Replace with Ionic navigation logic
  };

  return (
        <div className="top-banner-container">
            <div id="rotating-text-container" style={{ zIndex: 30, color: '#4A4A4A', fontFamily: 'fantasy' }}>
                <p id="rotating-text">Welcome to speaking Character.Ai</p>
            </div>
            <div className="image-carousel">
                <IonImg class="carousel-image" src="https://media.gettyimages.com/id/1455253758/photo/mumbai-india-rashmika-mandanna-attends-the-trailer-launch-of-netflix-film-mission-majnu-on.jpg?s=612x612&w=0&k=20&c=tOzrO-7x3aIkxxPZcy_8Ldh3xoy5Ur0IyHsihxCPeNk=" alt="Image 1" style={{ zIndex: 30 }}/>
                <IonImg class="carousel-image" src="https://media.gettyimages.com/id/1455253758/photo/mumbai-india-rashmika-mandanna-attends-the-trailer-launch-of-netflix-film-mission-majnu-on.jpg?s=612x612&w=0&k=20&c=tOzrO-7x3aIkxxPZcy_8Ldh3xoy5Ur0IyHsihxCPeNk=" alt="Image 2" />
                <IonImg class="carousel-image" src="https://media.gettyimages.com/id/1455253758/photo/mumbai-india-rashmika-mandanna-attends-the-trailer-launch-of-netflix-film-mission-majnu-on.jpg?s=612x612&w=0&k=20&c=tOzrO-7x3aIkxxPZcy_8Ldh3xoy5Ur0IyHsihxCPeNk=" alt="Image 3" />
                <IonImg class="carousel-image" src="https://media.gettyimages.com/id/1455253758/photo/mumbai-india-rashmika-mandanna-attends-the-trailer-launch-of-netflix-film-mission-majnu-on.jpg?s=612x612&w=0&k=20&c=tOzrO-7x3aIkxxPZcy_8Ldh3xoy5Ur0IyHsihxCPeNk=" alt="Image 4" />
                <IonImg class="carousel-image" src="https://media.gettyimages.com/id/1455253758/photo/mumbai-india-rashmika-mandanna-attends-the-trailer-launch-of-netflix-film-mission-majnu-on.jpg?s=612x612&w=0&k=20&c=tOzrO-7x3aIkxxPZcy_8Ldh3xoy5Ur0IyHsihxCPeNk=" alt="Image 5" />
            </div>
            <IonButton expand="full" onClick={goToCreateCharc} className="btn">
                <span className="btn-icon-wrapper">
                    <span className="btn-icon-line btn-icon-line1"></span>
                    <span className="btn-icon-line btn-icon-line2"></span>
                    <span className="btn-icon-line btn-icon-line3"></span>
                </span>
                Create new character
            </IonButton>
        </div>
    );
};

export default CardComponent;



