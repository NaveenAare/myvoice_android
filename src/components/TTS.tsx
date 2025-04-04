import React, { useState, useEffect } from "react";
import { IonButton, IonIcon, IonTextarea, IonHeader, IonToolbar, IonTitle, IonPage, IonToast } from "@ionic/react";
import { play, download, sync, time, arrowForward, globe } from "ionicons/icons";
import './TTS.css'; // Create a CSS file for styling
import {IonCard, IonCardContent } from "@ionic/react";
import AudioPlayerCard from './AudioPlayerCard';
import SubscriptionModal from '../components/newSub'


const MAX_AUDIOS_GENERATED = 5; // Set the maximum number of audios allowed
const AUDIO_COUNT_KEY = 'audioGenerationCount'; // Key for local storage

let audioCtx: AudioContext | null = null; // Initialize audio context
let currentSource: AudioBufferSourceNode | null = null; // Variable to hold the current audio source
let audioPlaying: HTMLAudioElement | null = null; // Variable to hold the currently playing audio
let currentButton: HTMLElement | null = null; // Variable to hold the current button

const TTSComponent: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); // State for loading audio
  const [isAudioPopupActive, setIsAudioPopupActive] = useState(false); // State for audio popup
  const [activeTab, setActiveTab] = useState('category1'); // State for active tab

  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null); 
  const [audioGenerationCount, setAudioGenerationCount] = useState(0); // Add state for audio generation count

  // Toast state
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<string>(''); // 'success' or 'error'

  const user_sub_status = localStorage.getItem("user_sub_status");
  const user_sub_exp_date = localStorage.getItem("user_sub_exp_date");
  const authTokens = localStorage.getItem("authToken");
  const [showModal, setShowModal] = useState(false);

  const [inputText, setInputText] = useState<string>(''); // State to hold input text

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

const handlePlanSelection = (plan: 'monthly' | 'yearly') => {
  console.log('Selected plan:', plan);
  // Add your payment processing logic here
  setShowModal(false);
};

  // Function to get the current audio generation count from local storage
  const getAudioGenerationCount = () => {
    const count = localStorage.getItem(AUDIO_COUNT_KEY);
    return count ? parseInt(count) : 0;
  };

  // Function to increment the audio generation count
  const incrementAudioGenerationCount = () => {
    const currentCount = getAudioGenerationCount();
    if (currentCount < MAX_AUDIOS_GENERATED) {
      localStorage.setItem(AUDIO_COUNT_KEY, (currentCount + 1).toString());
      return true; // Allow audio generation
    }
    return false; // Limit reached
  };

  // Function to check audio generation count
  const checkAudioGenerationCount = () => {
    const count = getAudioGenerationCount(); // Use existing function to get count
    setAudioGenerationCount(count);
  };

  useEffect(() => {
    checkAudioGenerationCount(); // Check audio generation count on component mount
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const localname = localStorage.getItem(`TTS_audio_name`) || 'Default';
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(localname);
      }
    };

    loadVoices();
  }, []);

  const speakText = async (text: string) => {
    // Check if the user can generate audio
    if (incrementAudioGenerationCount() || isSubscribed) {
        const endpoint = 'https://api.speakingcharacter.ai/getAudio/sample/ios';

        const TTSAudioCodeName = localStorage.getItem(`TTS_audio_code`) || '';
        const TTSAudioTrans = localStorage.getItem(`TTS_audio_trans`) || '';
        const TTSAudioUrl = localStorage.getItem(`TTS_audio_url`) || '';

        // Create the request body as a JSON object
        const body = JSON.stringify({
            text: text,
            TTSAudioCodeName: TTSAudioCodeName,
            TTSAudioTrans: TTSAudioTrans,
            TTSAudioUrl: TTSAudioUrl
        });

        // Send message to the server
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set content type to JSON
                },
                body: body, // Send the JSON body
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const responseData = await response.json(); // Parse the JSON response
            const audioFileUrl = responseData.link; // Assuming the response contains the audio URL

            setAudioURL("https://api.speakingcharacter.ai/play/" + audioFileUrl); // Set the audio URL from the response

            // Show success toast
            setToastMessage("Audio generated successfully!");
            setToastType("success");
            setIsToastVisible(true);
        } catch (error) {
            console.error('Error sending message:', error);
            // Show error toast
            setToastMessage("Error generating audio.");
            setToastType("error");
            setIsToastVisible(true);
        }
    } else {
        // Show error toast instead of alert
        setToastMessage("Free limit reached. Please subscribe to generate more audios.");
        setToastType("error");
        setIsToastVisible(true);
        setShowModal(true);
    }
  };

  const handleDownload = async () => {
    if (!text.trim()) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    setAudioURL(url);
  };

  const toggleAudio = (audioUrl: string, button: HTMLElement) => {
    // If an audio is already playing, pause it and reset its button
    if (audioPlaying) {
        audioPlaying.pause();
        audioPlaying.currentTime = 0; // Reset the audio to the start
        if (currentButton) {
            currentButton.innerHTML = `<i class="fas fa-play"></i>`; // Reset play icon for the previous button
        }
    }

    // If the same audio is clicked again, stop and reset
    if (audioPlaying && audioPlaying.src === audioUrl) {
        audioPlaying = null;
        currentButton = null;
    } else {
        // Show loading spinner
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

        // Create a new audio element
        audioPlaying = new Audio(audioUrl);

        // Play the audio
        audioPlaying.play().then(() => {
            currentButton = button; // Set the current button to the one clicked
            button.innerHTML = `<i class="fas fa-pause"></i>`; // Set pause icon
        }).catch(error => {
            console.error("Error playing audio:", error);
            button.innerHTML = `<i class="fas fa-play"></i>`; // Reset play icon if there's an error
        });

        // Handle when the audio ends: reset the button state
        audioPlaying.onended = () => {
            button.innerHTML = `<i class="fas fa-play"></i>`; // Reset play icon after audio ends
            audioPlaying = null;
            currentButton = null;
        };
    }
  };

  function updateVoiceList(categoryId: string, voices: any[]) {
    const voiceContainer = document.getElementById(categoryId);
    voiceContainer.innerHTML = ''; // Clear previous content

    voices.forEach((voice) => {
      const voiceItem = document.createElement('div');
      voiceItem.className = 'name-item';

      // Card click event
      voiceItem.onclick = () => selectName(voice.name, voice.voice_url, voice.code, voice.transcribe_text);

      // Create play button
      const playButton = document.createElement('button');
      playButton.className = 'play-btn';
      playButton.innerHTML = `<i class="fas fa-play"></i>`;
      playButton.onclick = (event) => {
        event.stopPropagation(); // Prevent click event from bubbling up to the card
        toggleAudio(voice.voice_url, playButton);
      };

      voiceItem.innerHTML = `<span>${voice.name}</span>`;
      voiceItem.appendChild(playButton); // Append play button to the voice item

      voiceContainer.appendChild(voiceItem);
    });
  }

  async function fetchVoiceData() {
    setIsLoadingAudio(true); // Set loading state to true
    const loadingSpinner = document.getElementById('loadingSpinner-for-audio');
    //loadingSpinner.style.display = 'block'; // Show spinner
  
    try {
      const authTokenn = localStorage.getItem("authToken") || "";
      const formData = new FormData();
      formData.append('authToken', authTokenn);
  
      const response = await fetch('https://speakingcharacter.ai/get/all/audios2', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      const publicVoices = data.data;
      const userVoices = data.data2;
  
      updateVoiceList('category1', publicVoices);
      updateVoiceList('category2', userVoices);
  
    } catch (error) {
      console.error('Error fetching voice data:', error);
    } finally {
      setIsLoadingAudio(false); // Set loading state to false
      //loadingSpinner.style.display = 'none'; // Hide spinner after loading
    }
  }

  const toggleAudioPopup = () => {
    setIsAudioPopupActive(prev => !prev);
    fetchVoiceData(); // Fetch voice data when opening the popup

    if (audioPlaying) {
        audioPlaying.pause();
        audioPlaying.currentTime = 0; // Reset the audio to the start
        if (currentButton) {
            currentButton.innerHTML = `<i class="fas fa-play"></i>`; // Reset play icon for the previous button
        }
    }
  };

  const switchTab = (category: string) => {
    setActiveTab(category); // Set the active tab state
    const tabs = document.querySelectorAll('.tab');
    const lists = document.querySelectorAll('.name-list');

    tabs.forEach(tab => tab.classList.remove('active'));
    lists.forEach(list => list.classList.remove('active'));

    document.getElementById(category)?.classList.add('active');
    document.querySelector(`[onclick="switchTab('${category}')"]`)?.classList.add('active');
};

const selectName = (name: string, url: string, code: string, trans: string) => {
  const selectedItemText = document.getElementById('toggleAudioName');
  if (selectedItemText) {
      selectedItemText.textContent = 'Audio: ' + `${name} 🎵`; // Update the displayed audio name
  }
  updateCharacterVoice(name, url, code, trans); // Update the character's voice
  toggleAudioPopup(); // Close the audio selection popup
};

async function updateCharacterVoice(audio: string, voice_url: string, voice_code: string, trans: string) {
  setSelectedVoice(audio);

  localStorage.setItem(`TTS_audio`, audio);
  localStorage.setItem(`TTS_audio_name`, audio);
  localStorage.setItem(`TTS_audio_url`, voice_url);
  localStorage.setItem(`TTS_audio_code`, voice_code);
  localStorage.setItem(`TTS_audio_trans`, trans);
}

const handleGenerateSpeech = () => {
  console.log("Current text:", text); // Debugging line to check the current text value
  if (text.trim()) { // Check if input is not empty
    console.log("Generating speech for:", text); // Debugging line
    speakText(text); // Call speakText with the input text
  } else {
    setToastMessage("Please enter some text to generate speech.");
    setToastType("error");
    setIsToastVisible(true);
  }
};

  return (
    <IonPage className="home-container-tts">
      {/* Display subscription message if not subscribed */}
      {!isSubscribed && (
        <div className="subscription-message">
          Free limit: {audioGenerationCount} / {MAX_AUDIOS_GENERATED}
        </div>
      )}

      <h3 className="tts-h3" id="tts-container-selected-audio">Selected Audio: {selectedVoice || "Default"}</h3>

      <div className="form-group-2">
        <IonTextarea 
          id="description" 
          name="description" 
          placeholder="Enter the text to convert to speech.." 
          required
          disabled={false}
          value={text}
          onIonChange={(e) => {
            const newValue = e.detail.value!;
            console.log("Text updated:", newValue); // Debugging line to check the updated value
            setText(newValue); // Update state on input change
          }}
        ></IonTextarea>
      </div>

      <div className="tts-buttons">
        <IonButton className="tts-play-button" onClick={handleGenerateSpeech}>
          <IonIcon style={{ marginTop: "5px" }} icon={globe} />
          <div style={{ width: "5px" }}></div>
          Generate Speech
        </IonButton>

        <IonButton className="tts-change-audio-button" onClick={toggleAudioPopup}>
          <IonIcon className='icccon' icon={sync} style={{ marginTop: "5px" }} /> 
          <div style={{ width: "5px" }}></div>
          Change Voice   
        </IonButton>
      </div>

      <div>
        <h1 className="tts-h3">Last Generated Audio</h1>
        <AudioPlayerCard audioUrl={audioURL} />
      </div>

      <div style={{ height: "100px" }}></div>

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
      <SubscriptionModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelectPlan={handlePlanSelection}
        />

      {/* Audio Selection Popup */}
      {isAudioPopupActive && (
        <div className="popup-modal active" id="popupModal">
          <div className="popup-header">
            Select Audio for Character
            <div className="loading-spinner-for-audio" id="loadingSpinner-for-audio" style={{ display: isLoadingAudio ? 'block' : 'none' }}>
                <div className="loading-dots-audio">
                    <span></span><span></span><span></span>
                </div>
            </div>
          </div>
          <div className="popup-content">
            <div className="tabs">
              <div className={`tab ${activeTab === 'category1' ? 'active' : ''}`} onClick={() => switchTab('category1')}>Public Voices</div>
              <div className={`tab ${activeTab === 'category2' ? 'active' : ''}`} onClick={() => switchTab('category2')}>Your Voices</div>
            </div>
            <div className={`name-list ${activeTab === 'category1' ? 'active' : ''}`} id="category1">
              {/* Dynamic Content from API goes here */}
            </div>
            <div className={`name-list ${activeTab === 'category2' ? 'active' : ''}`} id="category2">
              {/* Dynamic Content from API goes here */}
            </div>
            <button className="close-btn" onClick={toggleAudioPopup}>Close</button>
          </div>

          

        </div>

        
      )}
    </IonPage>
  );
};

export default TTSComponent;
