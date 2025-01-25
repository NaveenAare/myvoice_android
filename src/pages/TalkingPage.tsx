import React, { useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonToast, IonIcon } from '@ionic/react';
import { io } from 'socket.io-client';
import './TalkingPage.css';
import { 
    IonContent, 
    IonRefresher, 
    IonRefresherContent 
  } from '@ionic/react';
  import { RefresherEventDetail } from '@ionic/core';
import { Plugins } from '@capacitor/core';
import { arrowBack, arrowForward } from 'ionicons/icons';

const { NativeAudio } = Plugins;

interface Message {
  content: string;
  role: 'user' | 'bot';
  time?: string;
  loading?: boolean; // Add loading state
}

import { Capacitor } from '@capacitor/core';


const TalkingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [feedbackText, setFeedbackText] = useState('Waiting for speech...');
  const [isAnimatingGlow, setIsAnimatingGlow] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isFullMicOn, setIsFullMicOn] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number>();
  const isRecordingRef = useRef(false);
  const vadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  let [isProcessing, setIsProcessing] = useState(false);
  let [messages, setMessages] = useState<Message[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null); // Reference for the image

    // Function to update the image
    const updateImage = (newImageSrc: string) => {
        if (imageRef.current) {
            imageRef.current.src = newImageSrc; // Update the image source directly
        }
    };

  const socketRef = useRef(io('https://api.speakingcharacter.ai', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 30000,
  }));

  const authToken = localStorage.getItem('authToken') || '';

  const setGlowEffectPosition = (top: string) => {
    const glowEffect = document.getElementById('glowEffect');
    if (glowEffect) {
      glowEffect.style.transition = 'top 0.3s ease'; // Add transition for smooth movement
      glowEffect.style.top = top; // Set the top position
    }
  };

  const setGlowEffectTOCenter = () => {
    const glowEffect = document.getElementById('glowEffect');
    if (glowEffect) {
      const windowHeight = window.innerHeight; // Get the height of the viewport
      const glowEffectHeight = glowEffect.offsetHeight; // Get the height of the glowEffect element
      const centerTop = (windowHeight - glowEffectHeight) / 2; // Calculate the top position for vertical centering
  
      glowEffect.style.transition = 'top 0.3s ease'; // Add transition for smooth movement
      glowEffect.style.top = `${centerTop}px`; // Set the top position
    }
  };



  const playSendMessageAudio = async () => {
    if (Capacitor.getPlatform() === 'ios') {
        try {
            // Preload the audio file (do this once, perhaps in useEffect)
            await NativeAudio.preload({
                assetId: 'sendMessage',
                assetPath: 'public/assets/new-message-31-183617.mp3',
                audioChannelNum: 1,
                isUrl: false
            });

            // Play the audio
            await NativeAudio.play({
                assetId: 'sendMessage'
            });
        } catch (error) {
            console.error('iOS audio error:', error);
        }
    } else {
        // Web fallback
        try {
            const audio = new Audio('assets/new-message-31-183617.mp3');
            await audio.play();
        } catch (error) {
            console.error('Web audio error:', error);
        }
    }
};



  // Function to map error codes to messages
  const getAudioErrorMessage = (code: number): string => {
    switch (code) {
        case 1:
            return "MEDIA_ERR_ABORTED: The fetching process for the media resource was aborted.";
        case 2:
            return "MEDIA_ERR_NETWORK: A network error caused the audio download to fail.";
        case 3:
            return "MEDIA_ERR_DECODE: The audio playback was aborted due to a corruption problem or unsupported format.";
        case 4:
            return "MEDIA_ERR_SRC_NOT_SUPPORTED: The audio resource could not be loaded, either because the server or network failed or because the format is not supported.";
        default:
            return "Unknown error.";
    }
  };

  const playAfterMessageAudio = () => {
    const audio = new Audio(`/assets/newwdownmessage.mp3`); // Ensure the file is in public/assets/audio
    
    audio.oncanplaythrough = () => {
      audio.play()
        .then(() => {
          console.log("Audio is playing");
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    };
  
    audio.onerror = () => {
      console.error(`Error loading audio file: /assets/audio/newwdownmessage.mp3`);
    };
  };
  

    
  



  // Initialize audio system


  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      // Reset the audio system
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      // Reset states
      setIsMicOn(true);
      setFeedbackText('Waiting for speech...');
      setIsAnimatingGlow(false);
      resetGlow();
      
      // Reinitialize audio
      await initializeAudio();
      
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      event.detail.complete();
    }
  };



  const startVoiceDetection = () => {
    if (!analyserRef.current || isProcessing) return;

  
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // More refined parameters
    const VOICE_THRESHOLD = 70;       // Higher threshold to reject background noise
    const MIN_SPEECH_DURATION = 500;  // Minimum 500ms of continuous speech
    const MAX_RECORDING_DURATION = 20000; // 20 seconds max recording
    const SILENCE_THRESHOLD = 30;     // Lower threshold for silence detection
    const SILENCE_DURATION = 1500;    // 1.5 seconds of silence to stop recording
  
    let speechStartTime = 0;
    let silenceStartTime = 0;
    let isRecording = false;
  
    const detectVoice = () => {
      if (!analyserRef.current || !isMicOn) return;
  
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Focus on speech frequencies (more precise frequency range)
      const voiceFrequencies = dataArray.slice(3, 20);
      const averageVolume = voiceFrequencies.reduce((a, b) => a + b) / voiceFrequencies.length;
      const currentTime = Date.now();
  
      if (averageVolume > VOICE_THRESHOLD) {
        // Voice detected
        if (!isRecording && !isProcessing) {
          speechStartTime = currentTime;
          isRecording = true;
          startRecording();
          console.log('Started recording - voice detected');
        }
        
        // Reset silence timer
        silenceStartTime = currentTime;
        
        // Animate glow based on volume
        if(!isProcessing) animateGlow(averageVolume);
      } else if (averageVolume < SILENCE_THRESHOLD && isRecording) {
        // Potential silence detected
        if (currentTime - silenceStartTime > SILENCE_DURATION) {
          // Ensure minimum speech duration before stopping
          if (currentTime - speechStartTime > MIN_SPEECH_DURATION) {
            stopRecording();
            isRecording = false;
            console.log('Stopped recording - silence detected');
          }
        }
      }
  
      // Stop recording if max duration reached
      if (isRecording && currentTime - speechStartTime > MAX_RECORDING_DURATION) {
        stopRecording();
        isRecording = false;
        console.log('Stopped recording - max duration reached');
      }
  
      animationFrameIdRef.current = requestAnimationFrame(detectVoice);
    };
  
    detectVoice();
  };

// Update initializeAudio for better voice detection
const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8; // Smooth out variations

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          audioChunksRef.current = [];
          await sendAudioToApi(audioBlob);
        }
      };

      startVoiceDetection();
      
    } catch (error) {
      console.error('Error initializing audio:', error);
      setFeedbackText('Microphone access needed');
      showToast('Please enable microphone access', 'error');
    }
};

const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      try {
        mediaRecorderRef.current.stop();
        isRecordingRef.current = false;
        setFeedbackText('Processing...');
        setIsAnimatingGlow(false);
        resetGlow();
        setIsMicOn(false); // Temporarily disable mic while processing
        console.log('Recording stopped');
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
};

  const startRecording = () => {
    setGlowEffectPosition('90%');
    if (mediaRecorderRef.current && !isRecordingRef.current) {
      try {
        audioChunksRef.current = [];  // Clear previous chunks
        mediaRecorderRef.current.start();
        isRecordingRef.current = true;
        setFeedbackText('Listening...');
        setIsAnimatingGlow(true);
        console.log('Recording started');
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };



  

  const animateGlow = (volume: number) => {
    const glowEffect = document.getElementById('glowEffect');
    if (!glowEffect) return;

    const minScale = 0.8;
    const maxScale = 2.5;
    const scale = minScale + (Math.min(volume, 100) / 100) * (maxScale - minScale);
    
    glowEffect.style.transform = `translate(-50%) scale(${scale})`;
    glowEffect.style.opacity = Math.min(0.8 + (volume / 100), 1).toString();
  };

  const resetGlow = () => {
    const glowEffect = document.getElementById('glowEffect');
    if (glowEffect) {
      glowEffect.style.transform = 'translate(-50%) scale(1)';
      glowEffect.style.opacity = '0.8';
    }
  };


  const loadMessages = async () => {

    try {
      const authToken = localStorage.getItem('authToken');
      const storedMessages = localStorage.getItem(id); // Check local storage for messages
      const storedCharData = localStorage.getItem(`${id}_char_data`); // Check local storage for character data
      const charImageUrl = localStorage.getItem(`${id}_char_image_url`) || '';
      if (storedMessages && storedCharData) {
          // If messages and character data are found in local storage, parse and set them
          const formattedMessages = JSON.parse(storedMessages);
          const characterData = JSON.parse(storedCharData);
          const parsedMessages: Message[] = JSON.parse(storedMessages);


          setMessages(formattedMessages);
          messages = formattedMessages;
          updateImage(charImageUrl);
          //setCharacterData(characterData); // Set character data from local storage
      } else {
          // If no messages or character data in local storage, fetch from API
          const response = await fetch(`https://speakingcharacter.ai/get_messages?authToken=${authToken}&charId=${id}`);
          
          if (!response.ok) {
              throw new Error('Failed to fetch messages');
          }

          const data = await response.json();
          
          // Update messages
          const formattedMessages = data.chats.map((msg: any) => ({
              content: msg.text,
              role: msg.is_user ? 'user' : 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formattedMessages);
          messages = formattedMessages

          // Store messages and character data in localStorage after fetching from API
          localStorage.setItem(id, JSON.stringify(formattedMessages));
          localStorage.setItem(`${id}_char_data`, JSON.stringify(data.char_data)); // Store character data
          localStorage.setItem(`${id}_char_name`, data.char_data.name);
          localStorage.setItem(`${id}_char_sub_name`, data.char_data.summary1);
          localStorage.setItem(`${id}_char_sub_name_2`, data.char_data.summary2);
          localStorage.setItem(`${id}_char_voice_name`, data.char_data.voice);
          localStorage.setItem(`${id}_char_image_url`, data.char_data.image_url);
          localStorage.setItem(`${id}_char_audio_name`, data.char_data.char_voice_name);
          localStorage.setItem(`${id}_char_audio_url`, data.char_data.char_voice_url);
          localStorage.setItem(`${id}_char_audio_code`, data.char_data.char_voice_code);
          localStorage.setItem(`${id}_char_voice_trans`, data.char_data.char_voice_trans);

          // Set character data in state
          //setCharacterData(data.char_data);

          updateImage(data.char_data.image_url);
      }
    } catch (error) {
        console.error('Error loading messages:', error);
        // You might want to add error handling UI here
    }

  }

  const sendAudioToApi = async (audioBlob: Blob) => {


    
    playSendMessageAudio();
    console.error(' Is Processing ........:::: ', isProcessing);

    if (isProcessing) return;
    
    if (audioBlob.size === 0) {
        console.warn('No audio data to send to API');
        return; // Exit if there's no audio data
    }

    setIsMicOn(false);
    setGlowEffectTOCenter();
    showDotContainer();
    stopRecording();
    isProcessing  = true;
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (isRecordingRef.current) {
        stopRecording();
    }
    const authToken = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    const userId = "1"; // Assuming userId is stored in localStorage
    if (!userId) throw new Error('userId is not defined in localStorage');

    const storedMessages = localStorage.getItem(id); // Check local storage for messages
    const storedCharData = localStorage.getItem(`${id}_char_data`);


    try {
        //changeFeedbackText("Processing...");
        stopRecording;
        setIsMicOn(false);


        const userConversationHistoryJson = JSON.stringify([
          ...messages.map(msg => ({ role: msg.role, content: msg.content }))// Existing messages
      ]);



        let _char_summary = localStorage.getItem(`${id}_char_sub_name_2`);
        let _char_audio_status = localStorage.getItem(`${id}_char_voice_status`);
        let _char_audio_name = localStorage.getItem(`${id}_char_audio_name`);
        let _char_audio_url = localStorage.getItem(`${id}_char_audio_url`);
        let _char_audio_code = localStorage.getItem(`${id}_char_audio_code`);
        let _char_audio_trans = localStorage.getItem(`${id}_char_voice_trans`) || '';

        formData.append('authToken', authToken || '');
        formData.append('summary1', encodeURIComponent(_char_summary || ''));
        formData.append('conversation_history', userConversationHistoryJson || '[]');
        formData.append('summary2', encodeURIComponent(_char_summary || ''));
        formData.append('charId', encodeURIComponent(id || ''));
        formData.append('audio_status', encodeURIComponent(_char_audio_status || ''));
        formData.append('audio_codes', encodeURIComponent(_char_audio_code || ''));
        formData.append('audio_url', _char_audio_url || '');
        formData.append('audio_name', _char_audio_name || '');
        formData.append('transcibe_text', _char_audio_trans);

        fetch('https://api.speakingcharacter.ai/new_talking_optimized', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                
                //playMessageCompleteAudio();
               // hideLoader2();
               // recordingActive = false;
            }
            return response.text();
        })
        .then(responseText => {
            const parts = responseText.split('@#@#@#@#@#');
            const desiredText = parts[1] ? parts[1].trim() : '';
            const botText = parts[0] ? parts[0].trim() : '';
            console.error('desiredText', desiredText);
            const userMessage = {
              role: 'user', // Store role first
              content: desiredText, // Then content
          };

          setMessages((messages) => {
            const updatedMessages = [...messages, userMessage];
    
            // Add a temporary bot message with loading state at the end
            const tempBotMessage = {
                role: 'bot', // Store role first
                content: botText, // Empty content for loading state
            };
            updatedMessages.push(tempBotMessage); // Add the temporary bot message
  
            localStorage.setItem(id, JSON.stringify(updatedMessages)); // Store only essential data
            return updatedMessages;
        });
        })
        .catch(error => {
            console.error('Error sending message:', error);
            hideDotContainer();
            hideDotContainer();

           // playMessageCompleteAudio();
           // hideLoader2();
            //recordingActive = false;
        });

    } catch (error) {
        console.error('API error:', error);
        isProcessing  = false;
        hideDotContainer();

       // displayToast(`Error loading messages Error: ${error}`, 'error');
        
    }

    // Move glow effect to center with animation
};




  // Handle socket audio responses
  useEffect(() => {
    hideDotContainer();
    loadMessages();
    const socket = socketRef.current;
    
    socket.on(`${authToken}${id}new_message_audio_chat`, async (data) => {
      if (data.audio) {
        try {
          hideDotContainer();
          await playAudioResponse(data.audio);
        } catch (error) {
          console.error('Error handling audio response:', error);
        } finally {
          hideDotContainer();

          // Reset all states and re-enable mic detection
          
        }
      }
    });

}, [authToken, id]);

const playAudioResponse = async (base64Audio: string): Promise<void> => {
  try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 48000,
          latencyHint: 'interactive'
      });

      // Create analyser for glow animation
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Decode the audio data
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
      }

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1.5;
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      // Modified connection to include analyser
      source.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(compressor);
      compressor.connect(audioContext.destination);
      
      try {
          if (audioContext.setSinkId && typeof audioContext.setSinkId === 'function') {
              await audioContext.setSinkId('speaker');
          }
      } catch (error) {
          console.warn('Could not set audio output device:', error);
      }

      // Glow animation function
      const animateSocketGlow = () => {
          analyser.getByteFrequencyData(dataArray);
          const averageVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          const glowEffect = document.getElementById('glowEffect');
          if (glowEffect) {
              const minScale = 0.8;
              const maxScale = 2.5;
              const scale = minScale + (Math.min(averageVolume, 100) / 100) * (maxScale - minScale);
              
              glowEffect.style.transform = `translate(-50%) scale(${scale})`;
              glowEffect.style.opacity = Math.min(0.3 + (averageVolume / 100), 1).toString();
          }

          if (source.playbackState === source.PLAYING_STATE) {
              requestAnimationFrame(animateSocketGlow);
          }
      };

      return new Promise((resolve) => {
          source.onended = () => {
              setFeedbackText('Waiting for speech...');
              isProcessing  = false;
              setIsMicOn(true);
              setFeedbackText('Waiting for speech...');
              setGlowEffectPosition('90%');
              startVoiceDetection();
              audioContext.close();
              resetGlow();
              resolve();
              playAfterMessageAudio();
          };

          setFeedbackText('Playing response...');
          source.start(0);
          animateSocketGlow();

          document.addEventListener('touchstart', function enableAudio() {
              audioContext.resume();
              document.removeEventListener('touchstart', enableAudio);
          });
      });
  } catch (error) {
      console.error('Error playing audio:', error);
      setFeedbackText('Error playing response');
      resetGlow();
      return Promise.resolve();
  }
};
  // Initialize on component mount
  useEffect(() => {
    initializeAudio();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      resetGlow();
    };
  }, []);


  useEffect(() => {
    const enableAudioSession = async () => {
        try {
            // @ts-ignore - iOS specific
            if (window.webkit?.messageHandlers?.audioSession) {
                // @ts-ignore
                await window.webkit.messageHandlers.audioSession.postMessage({
                    category: 'playback',
                    options: ['mixWithOthers', 'defaultToSpeaker']
                });
            }
        } catch (error) {
            console.warn('Could not configure iOS audio session:', error);
        }
    };

    enableAudioSession();
}, []);

  // UI Helper functions
  const showDotContainer = () => {
    const dotContainer = document.getElementById('dot-container');
    if (dotContainer) dotContainer.classList.remove('hidden');
  };

  const hideDotContainer = () => {
    const dotContainer = document.getElementById('dot-container');
    if (dotContainer) dotContainer.classList.add('hidden');
  };

  const showToast = (message: string, type: string) => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
  };

  const toggleMic = () => {
    if (isFullMicOn) {
      // Completely stop microphone when turning off
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Cancel any ongoing voice detection or recording
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      if (isRecordingRef.current) {
        stopRecording();
      }
      
      // Reset audio-related states
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Reset UI elements
      setFeedbackText('Microphone Off');
      hideDotContainer();
      resetGlow();
      
      // Set mic state
      setIsFullMicOn(false);
    } else {
      // Reinitialize audio when turning mic back on
      initializeAudio();
      setIsFullMicOn(true);
      setFeedbackText('Waiting for speech...');
      setGlowEffectPosition('90%');
    }
  };

  // Function to handle back navigation
  const handleBackButtonClick = () => {
    history.goBack(); // Navigate back to the previous page
  };

  // Effect to handle physical back button press
  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault(); // Prevent default behavior
      handleBackButtonClick(); // Call the back button click handler
    };

    // Listen for popstate event
    window.addEventListener('popstate', handleBackButton);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [history]);

  return (
    <IonContent>
      <button className="back-arrow-btn" onClick={handleBackButtonClick}>
        <IonIcon icon={arrowForward} className="arrow-icon" />
      </button>

      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <div className="talkingcontainer">
        <div className="feedback" id="feedbackText">{feedbackText}</div>

        <div className="speech-container2">
          <div className="rotatingdots-speech-blob">
          <img ref={imageRef} src="/static/voice-square-svgrepo-com.png" alt="speech-blob" id="speech-blob_image" />
          </div>
          <div className="rotatingdots-dot-container" id="dot-container">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="rotatingdots-dot"></div>
            ))}
          </div>
        </div>

        <div className="container-buttons-mic">
          <button className="speech-button" id="toggleButton" onClick={toggleMic}>
            {isMicOn ? "Stop Mic" : "Start Mic"}
          </button>
          <input type="checkbox" id="checkbox" checked={isFullMicOn} readOnly />
          <label className="switch" htmlFor="checkbox" onClick={toggleMic}>
            <div className={isFullMicOn ? "mic-on" : "mic-off"} />
          </label>
        </div>

        <div className="glow" id="glowEffect"></div>

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
    </IonContent>
  );
};

export default TalkingPage;