import React, { useState, useEffect } from "react";
import { IonButton, IonIcon, IonTextarea, IonHeader, IonToolbar, IonTitle, IonPage } from "@ionic/react";
import { play, download, sync, time, arrowForward, globe } from "ionicons/icons";
import './TTS.css'; // Create a CSS file for styling
import {IonCard, IonCardContent } from "@ionic/react";
import AudioPlayerCard from './AudioPlayerCard';




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

  const speakText = () => {
    setAudioURL("https://speakingcharacter.ai/static/1.mp3")
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


  return (
    <IonPage className="home-container-tts">


      <h3 className="tts-h3" id="tts-container-selected-audio">Selected Audio: {selectedVoice || "Default"}</h3>

      <div className="form-group-2">
                <textarea 
                  id="description" 
                  name="description" 
                  placeholder="Enter the text to convert to speech.." 
                  required
                ></textarea>
              </div>

        <div className="tts-buttons">
          <IonButton className="tts-play-button" onClick={speakText}>
            <IonIcon style={{ marginTop: "5px" }} icon={globe} />
            <div style={{ width: "5px" }}></div>

             Generate Speech
          </IonButton>

          <IonButton className="tts-change-audio-button" onClick={toggleAudioPopup}>
            <IonIcon className = 'icccon' icon={sync} style={{ marginTop: "5px" }}/> 
            <div style={{ width: "5px" }}></div>

            Change  Voice   
          </IonButton>
        </div>



        <div>
      <h1 className="tts-h3">Last Generated Audio</h1>
      <AudioPlayerCard audioUrl={audioURL} />
    </div>

 

    <div style={{ height: "100px" }}></div>

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
