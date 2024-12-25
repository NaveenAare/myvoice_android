import React, { useState, useEffect } from 'react';
import { IonButton } from '@ionic/react';
import './AudioList.css';

const PopularAudiosSection: React.FC = () => {
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [characters, setCharacters] = useState<any[]>([]);  // No need for manual parameters

    // Fetch characters data from the API
    useEffect(() => {
        fetch('/get/all/audios')  // Your provided API URL
            .then(response => response.json())
            .then(data => setCharacters(data.data))  // Directly set the data
            .catch(error => console.error('Error fetching characters:', error));
    }, []);

    const handlePlayPause = async (character: any, audio: HTMLAudioElement, playButton: HTMLButtonElement) => {
        const loadingSpinner = document.createElement('div');
        loadingSpinner.classList.add('loading-spinner');
        loadingSpinner.style.display = 'none'; // Initially hidden
        playButton.appendChild(loadingSpinner);

        // If there's already audio playing, pause and reset it
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setIsPlaying(false);
        }

        // Toggle between play and pause
        if (isPlaying && currentAudio === audio) {
            audio.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>'; // Reset to Play
            setIsPlaying(false);
        } else {
            loadingSpinner.style.display = 'inline-block';  // Show loading spinner
            try {
                await audio.play();
                setCurrentAudio(audio);
                setIsPlaying(true);
                playButton.innerHTML = '<i class="fas fa-pause"></i>'; // Change to Pause
                loadingSpinner.style.display = 'none'; // Hide loading spinner
            } catch (error) {
                console.error('Error playing audio:', error);
                loadingSpinner.style.display = 'none';
            }
        }
    };

    return (
        <div className="special-section">
            <div className="card-list">
                {characters.map((character, index) => {
                    const audio = new Audio(character.voice_url);
                    return (
                        <div key={index} className="special-card">
                            <img src="shrimmer.png" alt={`Character ${index + 1}`} />
                            <div className="special-card-content">
                                <h3 className="shimmer-title">{character.name}</h3>
                                <p>{character.description}</p>
                            </div>
                            <div className="play-pause-button-container">
                                <IonButton
                                    onClick={(e) => {
                                        e.stopPropagation();  // Prevent card click event
                                        handlePlayPause(character, audio, e.currentTarget as unknown as HTMLButtonElement);
                                    }}
                                >
                                    <i className="fas fa-play"></i> {/* Default play icon */}
                                </IonButton>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PopularAudiosSection;
