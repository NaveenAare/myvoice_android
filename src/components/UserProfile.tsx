import React, { useState, useEffect, useRef } from 'react';
import './UserProfile.css'; // Ensure CSS styles are imported
import { IonButton, IonIcon, IonToast } from '@ionic/react';
import { chatbubbleOutline,searchOutline, closeCircleOutline, logOutOutline, play, pause } from 'ionicons/icons';

// ... existing code ...

<button className="action-button" onClick={() => window.location.href = `/chatbox/chat/${character.code}`}>
    <IonIcon icon={chatbubbleOutline} /> {/* Change to chat icon */}
</button>

// ... existing code ...
const ShimmerCard: React.FC = () => (
    <div className="shimmer-card">
        <div className="shimmer-image shimmer"></div>
        <div className="shimmer-content">
            <div className="shimmer-title shimmer"></div>
            <div className="shimmer-text shimmer"></div>
        </div>
    </div>
);

const UserProfile: React.FC = () => {
    // State variables
    const [profilePic, setProfilePic] = useState<string>('https://via.placeholder.com/120');
    const [userName, setUserName] = useState<string>('John Doe');
    const [characters, setCharacters] = useState<any[]>([]);
    const [audios, setAudios] = useState<any[]>([]);
    const [loadingCharacters, setLoadingCharacters] = useState<boolean>(true);
    const [loadingAudios, setLoadingAudios] = useState<boolean>(true);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [toastType, setToastType] = useState<string>(''); // 'success' or 'error'
    const [isToastVisible, setIsToastVisible] = useState<boolean>(false); // State to control toast visibility
    const [activeTab, setActiveTab] = useState<string>('characters'); // New state for active tab
    const [playingAudio, setPlayingAudio] = useState<string | null>(null); // State to track currently playing audio
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({}); // Ref to store audio elements
    const [noCharactersFound, setNoCharactersFound] = useState<boolean>(false); // State for no characters message
    const [noAudiosFound, setNoAudiosFound] = useState<boolean>(false); // State for no audios message

    const overlayRef = useRef<HTMLDivElement | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const loadingSpinnerRef = useRef<HTMLDivElement | null>(null);
    const newOverlayRef = useRef<HTMLDivElement | null>(null); // New overlay reference

    // Fetch API Details
    const fetchApiDetails = async () => {
        try {
            localStorage.setItem(`authToken`, "eyJ1c2VySWQiOiAxLCAibWFpbCI6ICJhYXJlbmF2ZWVudmFybWFAZ21haWwuY29tIiwgIm5hbWUiOiAiTmF2ZWVuIHZhcm1hIEFhcmUiLCAicHJvZmlsZV9waWMiOiAiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSTZQa3BFSGJkdGZoQTFETFp5OHVCcnZrejRIaDhTVjhMQmtzajRYRjdTVlB2OEllRDU9czk2LWMifTAxODYzNTczMDA3ODJiMmRjOTFjZWNlZDBiZGM0OWNiMWNjZDZmODIzZDM2ZTcyMzY0N2EwZjIwZjVkZTgyOTc=");
            const token = localStorage.getItem("authToken"); // Use token from local storage
            if (!token) throw new Error("No auth token found");

            const apiUrl = `https://speakingcharacter.ai/get/details/${token}`;
            const response = await fetch(apiUrl, { method: 'GET' });

            if (!response.ok) {
                window.location.href = '/';
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setProfilePic(data.profile_pic || 'https://via.placeholder.com/120');
            setUserName(data.name);
        } catch (error) {
            console.error('API Fetch error:', error);
            displayToast('Error fetching user details.', 'error');
        }
    };

    // Fetch and update characters
    const fetchAndUpdateCharacters = async () => {
        setLoadingCharacters(true); // Start loading
        setNoCharactersFound(false); // Reset no characters found state
        try {
            const token = localStorage.getItem("authToken"); // Use token from local storage
            if (!token) throw new Error("No auth token found");

            const formData = new FormData();
            formData.append('authToken', token);

            const response = await fetch('https://speakingcharacter.ai/get/firstSection', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const dataFull = await response.json();
            const data = dataFull.data;

            if (Array.isArray(data) && data.length === 0) {
                // Handle no characters found
                setNoCharactersFound(true); // Set state to show no characters message
            } else {
                setCharacters(data); // Update characters state
            }
        } catch (error) {
            console.error('Error fetching character data:', error);
            setNoCharactersFound(true); // Set state to show no characters message on error
        } finally {
            setLoadingCharacters(false); // Stop loading
        }
    };

    // Fetch and update audio cards
    const updateAudioCards = async () => {
        setLoadingAudios(true); // Start loading
        setNoAudiosFound(false); // Reset no audios found state
        try {
            const token = localStorage.getItem("authToken"); // Use token from local storage
            if (!token) throw new Error("No auth token found");

            const formData = new FormData();
            formData.append('authToken', token);

            const response = await fetch('https://speakingcharacter.ai/get/all/audios2', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (Array.isArray(data.data2) && data.data2.length === 0) {
                // Handle no audio found
                setNoAudiosFound(true); // Set state to show no audios message
            } else {
                setAudios(data.data2); // Update audios state
            }
        } catch (error) {
            console.error('Error fetching and updating audio cards:', error);
            setNoAudiosFound(true); // Set state to show no audios message on error
        } finally {
            setLoadingAudios(false); // Stop loading
        }
    };

    const deleteCharacter = async (character: any) => {
        const authToken = localStorage.getItem("authToken");
        const characterId = character.code; // Assuming character object has an id property
        const isPrivate = character.is_private; // Assuming character object has an is_private property

        const confirmDeleteButton = document.getElementById('confirm-delete')!;
        const loadingSpinner = loadingSpinnerRef.current!;

        // Show loading spinner and disable button
        confirmDeleteButton.disabled = true; // Disable the delete button
        loadingSpinner.style.display = 'block'; // Show loading spinner

        try {
            const formData = new FormData();
            formData.append('authToken', authToken);
            formData.append('characterId', characterId);
            formData.append('isPrivate', isPrivate);

            const response = await fetch('https://speakingcharacter.ai/delete/user/character', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                displayToast('Character deleted successfully!', 'success');
                fetchAndUpdateCharacters();
            } else {
                throw new Error("Failed to delete character.");
            }
        } catch (error) {
            console.error(error);
            displayToast('Something went wrong, please try again later!', 'error');
        } finally {
            // Reset button state and hide spinner
            confirmDeleteButton.disabled = false; // Enable the delete button
            loadingSpinner.style.display = 'none'; // Hide loading spinner
        }
    };

    const deleteAudio = async (audio: any) => {
        const authToken = localStorage.getItem("authToken");
        const audioCode = audio.code;

        const confirmDeleteButton = document.getElementById('confirm-delete')!;
        const loadingSpinner = loadingSpinnerRef.current!;

        // Show loading spinner and disable button
        confirmDeleteButton.disabled = true;
        loadingSpinner.style.display = 'block';

        try {
            const formData = new FormData();
            formData.append('authToken', authToken);
            formData.append('audioCode', audioCode);

            const response = await fetch('https://speakingcharacter.ai/delete/user/audio', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                displayToast('Audio deleted successfully!', 'success');
                updateAudioCards();
            } else {
                throw new Error("Failed to delete Audio.");
            }
        } catch (error) {
            console.error(error);
            displayToast('Something went wrong please try again later!', 'error');
        } finally {
            confirmDeleteButton.disabled = false;
            loadingSpinner.style.display = 'none';
        }
    };

    // Update the showDeletePopup function to handle both characters and audios
    const showDeletePopup = (item: any, isAudio: boolean = false) => {
        console.log("Showing delete popup"); // Debug log
        showNewOverlay();
        if (overlayRef.current && popupRef.current && loadingSpinnerRef.current) {
            overlayRef.current.style.display = 'block'; // Show overlay
            console.log("Overlay displayed"); // Debug log
            popupRef.current.style.display = 'flex'; // Show popup

            document.getElementById('cancel-delete')!.onclick = hideDeletePopup;
            document.getElementById('confirm-delete')!.onclick = async () => {
                if (isAudio) {
                    await deleteAudio(item);
                } else {
                    await deleteCharacter(item);
                }
                hideDeletePopup();
            };
            document.getElementById('close-popup')!.onclick = hideDeletePopup;
        }
    };

    const hideDeletePopup = () => {
        hideNewOverlay();
        if (overlayRef.current && popupRef.current) {
            overlayRef.current.style.display = 'none';
            popupRef.current.style.display = 'none';
        }
    };

    const displayToast = (message: string, type: string) => {
        setToastMessage(message);
        setToastType(type);
        setIsToastVisible(true);
        setTimeout(() => {
            setIsToastVisible(false);
        }, 4000);
    };

    // Function to handle play/pause
    const handlePlayPause = (audio: any) => {
        const audioId = audio.code; // Assuming audio object has a unique code
        const audioElement = audioRefs.current[audioId];

        if (playingAudio === audioId) {
            // If the audio is already playing, pause it
            audioElement?.pause();
            setPlayingAudio(null);
        } else {
            // If another audio is playing, pause it
            if (playingAudio) {
                const currentAudioElement = audioRefs.current[playingAudio];
                currentAudioElement?.pause();
            }
            // Play the selected audio
            audioElement?.play();
            setPlayingAudio(audioId);
        }
    };

    // Function to show the new overlay
    const showNewOverlay = () => {
        if (newOverlayRef.current) {
            newOverlayRef.current.style.display = 'block'; // Show new overlay
        }
    };

    // Function to hide the new overlay
    const hideNewOverlay = () => {
        if (newOverlayRef.current) {
            newOverlayRef.current.style.display = 'none'; // Hide new overlay
        }
    };

    useEffect(() => {
        fetchApiDetails(); // Fetch user details
        fetchAndUpdateCharacters(); // Fetch characters
        updateAudioCards(); // Fetch audio cards
    }, []);

    return (
        <div className="dashboard">
            {/* Header Section */}
            <header className="header">
                <img src={profilePic} alt="User Image" className="user-image" />
                <h1 className="user-name">{userName}</h1>
            </header>

            {/* Tabs Section */}
            <div className="tabs">
                <button onClick={() => setActiveTab('characters')} className={activeTab === 'characters' ? 'active' : ''}>Characters</button>
                <button onClick={() => setActiveTab('audios')} className={activeTab === 'audios' ? 'active' : ''}>Audios</button>
                <button onClick={() => setActiveTab('groups')} className={activeTab === 'groups' ? 'active' : ''}>Groups</button>
            </div>

            {/* Content Section */}
            <div className="tab-content">
                {activeTab === 'characters' && (
                    <div className="character-card-container">
                        {loadingCharacters ? (
                            Array.from({ length: 3 }).map((_, index) => <ShimmerCard key={index} />)
                        ) : noCharactersFound ? (
                            <div className="centered-message">
                                <p>No characters found.</p>
                            </div>
                        ) : (
                            characters.map(character => (
                                <div className="character-card" key={character.id} style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={character.image_url || 'default-image.png'} alt={character.name} />
                                    <div style={{ flex: 1, marginLeft: '10px' }}>
                                        <p className="card-title">{character.name}</p>
                                        <p className="card-description">{character.summary2}</p>
                                    </div>
                                    <div className="button-container">
                                        <button className="action-button" onClick={() => window.location.href = `/chatbox/chat/${character.code}`}>
                                            <IonIcon icon={chatbubbleOutline} />
                                        </button>
                                        <button className="action-button-2" onClick={() => showDeletePopup(character)}>
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'audios' && (
                    <div className="card-container">
                        {loadingAudios ? (
                            Array.from({ length: 3 }).map((_, index) => <ShimmerCard key={index} />)
                        ) : noAudiosFound ? (
                            <div className="centered-message">
                                <p>No audios found.</p>
                            </div>
                        ) : (
                            audios.map(audio => (
                                <div className="audio-card" key={audio.id}>
                                    <audio ref={el => (audioRefs.current[audio.code] = el)} src={audio.voice_url} />
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <button className="play-pause-button" onClick={() => handlePlayPause(audio)}>
                                            <IonIcon icon={playingAudio === audio.code ? pause : play} />
                                        </button>
                                        <p className="card-title" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                                            {audio.name || 'No Description'}
                                        </p>
                                        <button className="delete-button" onClick={() => showDeletePopup(audio, true)}>
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div className="groups-content">
                        {/* Placeholder for Groups content */}
                        <p>No groups available.</p>
                    </div>
                )}
            </div>

            {/* Delete Popup */}
            <div className="overlay" id="overlay" ref={overlayRef} style={{ display: 'none' }}></div>
            <div className="pop" id="delete-popup" ref={popupRef} style={{ display: 'none' }}>
                <div className="pop-content">
                    <p className="pop-heading">Delete Character / Audio?</p>
                    <p className="pop-description">Are you sure you want to delete this character / Audio?</p>
                </div>
                <div className="pop-button-wrapper">
                    <button className="pop-button secondary" id="cancel-delete">Cancel</button>
                    <button className="pop-button primary" id="confirm-delete">Delete</button>
                    <div id="loadingSpinner-2" ref={loadingSpinnerRef} style={{ display: 'none' }} className="spinner"></div>
                </div>
                <button className="exit-button" id="close-popup">
                    <svg height="20px" viewBox="0 0 384 512">
                        <path
                            d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                        ></path>
                    </svg>
                </button>
            </div>

            {/* New Overlay JSX */}
            <div className="new-overlay" id="new-overlay" ref={newOverlayRef} style={{ display: 'none' }}></div>

            {/* Toast Notification */}
            <IonToast
                isOpen={isToastVisible}
                onDidDismiss={() => setIsToastVisible(false)}
                message={toastMessage}
                duration={4000}
                color={toastType === 'success' ? 'success' : 'danger'}
                position="top"
                cssClass="custom-toast"
            />
        </div>
    );
};

export default UserProfile;
