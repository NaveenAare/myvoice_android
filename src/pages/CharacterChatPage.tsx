import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonAvatar,
  IonItem,
  IonFooter,
  IonInput,
  IonIcon,
  IonButton,
  useIonRouter,
  IonPopover,
  IonList,
  IonLabel,
  IonModal,
} from '@ionic/react';
import CharacterInfoModal from '../components/CharacterInfoModal';

import { call, mic, volumeHigh, volumeMute, send, cogSharp, ellipsisVertical, trash, logOut, arrowBack } from 'ionicons/icons'; // Import necessary icons
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './Chat.css';
import { io } from 'socket.io-client'; // Import socket.io client
import Shimmer from '../components/shrimmer'; // Import the Shimmer component
import { IonToast } from '@ionic/react';
import { Route, useHistory } from 'react-router-dom';
import { PushNotificationSchema, PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';

import { LocalNotifications } from '@capacitor/local-notifications';
import { useIonViewDidEnter } from '@ionic/react';
   import { chevronBack } from 'ionicons/icons'; // Import the chevron back icon
import React from 'react';
import { App } from '@capacitor/app';

import { Keyboard, KeyboardInfo } from "@capacitor/keyboard";

import { PluginListenerHandle } from "@capacitor/core"; // Correct import
import { Capacitor } from '@capacitor/core';






interface Message {
  content: string;
  role: 'user' | 'bot';
  time?: string;
  loading?: boolean; // Add loading state
}

interface CharacterData {
  name: string;
  summary1: string;
  summary2: string;
  voice: string;
  image_url: string;
  char_voice_name: string;
  char_voice_url: string;
  char_voice_code: string;
  char_voice_trans: string;
}

const truncateString = (str: string, maxLength: number): string => {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...'; // Add ellipsis
    }
    return str;
};

let audioCtx: AudioContext | null = null; // Initialize audio context
let currentSource: AudioBufferSourceNode | null = null; // Variable to hold the current audio source
let audioPlaying: HTMLAudioElement | null = null; // Variable to hold the currently playing audio
let currentButton: HTMLElement | null = null; // Variable to hold the current button

const CharacterChatPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true); // For loading messages
  const [isLoadingHeaderContent, setisLoadingHeaderContent] = useState(true); // For loading messages
  let [isLoadingBotMessage, setIsLoadingBotMessage] = useState(false); // For loading bot message
  const { id } = useParams<{ id: string }>();
  const [isVolumeHigh, setIsVolumeHigh] = useState(true); // State to track volume
  const messageEndRef = useRef<HTMLDivElement | null>(null); // Create a ref for the end of the message container
  const inputRef = useRef<HTMLIonInputElement | null>(null); // Create a ref for the input field
  let storedAudio: string | null = null; // Variable to store audio data
  const [isAudioPopupActive, setIsAudioPopupActive] = useState(false); // State for audio popup
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); // State for loading audio
  const [activeTab, setActiveTab] = useState('category1'); // State for active tab
  const router = useIonRouter();
  const [showPopover, setShowPopover] = useState(false); // State to control popover visibility

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const loadingSpinnerRef = useRef<HTMLDivElement | null>(null);
  const newOverlayRef = useRef<HTMLDivElement | null>(null); // New overlay reference
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false); // State to control toast visibility
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<string>(''); // 'success' or 'error'
  const history = useHistory(); // React Router history
  const ionRouter = useIonRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  
  const [userScrolling, setUserScrolling] = useState(false); // Add this line

  const [shouldFocusInput, setShouldFocusInput] = useState(false); // State to control focus

  let character_image = 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTYkqiLNeAiLJP3AHf04h08Iz9lkd1iVbcmHkOob8rTBgtuZ91EdktitjlijeYz26us1s3VvrRIUohHy7pwzygrKnX7idg_c9pJiSQ3XLE';

  localStorage.setItem("authToken", "eyJ1c2VySWQiOiAxLCAibWFpbCI6ICJhYXJlbmF2ZWVudmFybWFAZ21haWwuY29tIiwgIm5hbWUiOiAiTmF2ZWVuIHZhcm1hIEFhcmUiLCAicHJvZmlsZV9waWMiOiAiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSTZQa3BFSGJkdGZoQTFETFp5OHVCcnZrejRIaDhTVjhMQmtzajRYRjdTVlB2OEllRDU9czk2LWMifTAxODYzNTczMDA3ODJiMmRjOTFjZWNlZDBiZGM0OWNiMWNjZDZmODIzZDM2ZTcyMzY0N2EwZjIwZjVkZTgyOTc=");

  const socket = io('https://speakingcharacter.ai', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 30000,
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  const nullEntry: any[] = []
    const [notifications, setnotifications] = useState(nullEntry);

    useEffect(()=>{
        PushNotifications.checkPermissions().then((res) => {
            if (res.receive !== 'granted') {
              PushNotifications.requestPermissions().then((res) => {
                if (res.receive === 'denied') {
                  console.log('Push Notification permission denied');
                }
                else {
                  console.log('Push Notification permission granted');
                  register();
                }
              });
            }
            else {
              const fcm = localStorage.getItem('fcmToken');
              if (!fcm || fcm.trim() === "") {
                  register();
                  console.log("FCM token is null, undefined, or empty.");
              } else {
                  console.log("FCM token is valid:", fcm);
              }
              
            }
          });
    },[])
    
    const register = () => {
        console.log('Initializing HomePage');

        PushNotifications.register();

        PushNotifications.addListener('registration',
            (token: Token) => {
               localStorage.setItem('fcmToken', token.value);
                console.log('Push registration success');
            }
        );

        PushNotifications.addListener('registrationError',
            (error: any) => {
                alert('Error on registration: ' + JSON.stringify(error));
            }
        );

    }



  
  useEffect(() => {
    hardReloadMessages();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    const authToken = localStorage.getItem('authToken') || '';
    const uniquePart = id;

    let messageHandled = false; // Flag to track if the message has been handled yet

    socket.on(authToken + id + 'new_messagesss', (msg: { text: string; is_user: number }) => {
      console.error('Received new message:', msg);
      setIsLoadingBotMessage(false);

      if (!messageHandled) { // Check if the message has not been handled yet
          setIsLoadingBotMessage(false); // Disable loading messages
          messageHandled = true; // Set the flag to true after handling the message

          if (msg.is_user === 0) {
              // Find the last message in the state
              setMessages((prevMessages) => {
                  // Check if the last message is a bot message and is currently loading
                  const lastMessageIndex = prevMessages.length - 1;
                  const lastMessage = prevMessages[lastMessageIndex];

                  // If the last message is a bot message and is loading, append the new text
                  if (lastMessage && lastMessage.role === 'bot' && lastMessage.loading) {
                      const updatedMessage = {
                          ...lastMessage,
                          content: lastMessage.content + msg.text, // Append new text
                      };

                      const updatedMessages = [
                          ...prevMessages.slice(0, lastMessageIndex), // Keep previous messages
                          updatedMessage, // Update the last message
                      ];

                      // Update local storage
                      localStorage.setItem(id, JSON.stringify(updatedMessages));
                      return updatedMessages;
                  } else {
                      // If there's no loading message, create a new one
                      const newMessage: Message = {
                          content: msg.text,
                          role: 'bot',
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          loading: true, // Set loading state
                      };

                      const updatedMessages = [...prevMessages, newMessage];
                      localStorage.setItem(id, JSON.stringify(updatedMessages));
                      return updatedMessages;
                  }
              });
          } else {
              // Handle user messages if needed
              const newMessage: Message = {
                  content: msg.text,
                  role: 'user',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };

              setMessages((prevMessages) => {
                  const updatedMessages = [...prevMessages, newMessage];
                  localStorage.setItem(id, JSON.stringify(updatedMessages));
                  return updatedMessages;
              });
          }

      }
      // Code to execute when loading is true
    });

    // Add the new socket listener for audio messages
    socket.on(authToken + uniquePart + 'new_message_audio_chat', function(data) {
        if (data.audio && data.audio.length > 0) {
          const audioSrc = `data:audio/mp3;base64,${data.audio}`;
  
          // Initialize the audio context if it hasn't been already
          if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          }
  
          // Create a new Promise to handle audio playback
          new Promise((resolve, reject) => {
            // Decode base64 audio data directly
            const byteCharacters = atob(data.audio); // Decode base64
            const byteNumbers = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
  
            audioCtx.decodeAudioData(byteNumbers.buffer)
              .then(audioBuffer => {
                // Stop the current source if it's playing
                if (currentSource) {
                  currentSource.stop(); // Stop the currently playing audio
                }
  
                currentSource = audioCtx.createBufferSource(); // Create a new audio source
                currentSource.buffer = audioBuffer;
                currentSource.connect(audioCtx.destination);
                currentSource.start(0); // Start playing the new audio
                // showToast('Audio is playing.');
                resolve(); // Resolve when audio starts playing
              })
              .catch(error => {
                console.error('Error decoding audio:', error);
                reject(new Error('Error playing audio: ' + error.message)); // Reject if there's an error
              });
          }).catch(error => {
            console.error('Promise rejected:', error);
          });
  
        } else {
          console.warn('No audio data or empty audio.');
          // Optionally resolve or handle the case where there's no audio
        }
      });
  

    return () => {
      socket.off(authToken + id + 'new_message');
      messageHandled = false
      socket.off('connect');
      socket.off('connect_error');
      socket.off(authToken + uniquePart + 'new_message_audio_chat'); // Clean up the socket listener
    };
  }, [id]);




  const scrollToBottom = () => {
    if (messageEndRef.current ) {
        console.log("Scrolling to bottom");
        messageEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });

        // Add extra bottom padding to ensure complete scroll
        setTimeout(() => {
            window.scrollBy(0, 1500 - keyboardHeight); // Adjust scroll position by keyboard height
        }, 10); // Small delay to allow smooth animation
    } else {
        console.log("messageEndRef is null");
    }
  };


  


  useEffect(() => {
    const keyboardWillShow = async (info: KeyboardInfo) => {
      const platform = Capacitor.getPlatform();
      const delay = platform === 'ios' ? 300 : 150;
  
      await new Promise(resolve => setTimeout(resolve, delay));
    };
  
    Keyboard.addListener('keyboardWillShow', keyboardWillShow);
  }, []);

  



  useEffect(() => {
      scrollToBottom(); // Scroll to bottom when messages change
  }, [messages]); // Dependency array includes messages

 


  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
        event.preventDefault(); // Prevent default back navigation

        if (ionRouter.canGoBack()) {
            ionRouter.goBack(); // Use Ionic's navigation with smooth transitions
        } else {
            // If there's no page to go back to, you can exit the app or show a confirmation
            navigator.app.exitApp(); // Use this only for Android devices
        }
    };

    // Add event listener for back button
    window.addEventListener('popstate', handleBackButton);

    // Cleanup the event listener on component unmount
    return () => {
        window.removeEventListener('popstate', handleBackButton);
    };
}, [ionRouter]);


const scrollToBottomFromSendMessage = () => {
  if (!messageEndRef.current) return;

  requestAnimationFrame(() => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });

      // Adjust scrolling based on keyboard height
      const extraSpace = keyboardHeight > 0 ? keyboardHeight + 60 : 0;
      window.scrollBy(0, extraSpace);
    }, 300); // Small delay to allow reflow
  });
};





  const sendMessage = async () => {

    console.error("Send Button is pressed :::::::")
    if (!message.trim()) return; // Prevent sending empty messages or if already loading

    const userMessage = {
        role: 'user', // Store role first
        content: message, // Then content
    };
    console.error("After Messages Loading:::")

    // Update local state and local storage for user message
    setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, userMessage];

        // Add a temporary bot message with loading state at the end
        const tempBotMessage = {
            role: 'bot', // Store role first
            content: '', // Empty content for loading state
            loading: true, // Set loading state
        };
        updatedMessages.push(tempBotMessage); // Add the temporary bot message

        localStorage.setItem(id, JSON.stringify(updatedMessages)); // Store only essential data

    

        return updatedMessages;
    });



    setMessage(''); // Clear input field
    setIsLoadingBotMessage(true);// Set loading state for bot message

    if (inputRef.current) {
      await inputRef.current.setFocus(); // Ionic's proper focus method
    }

    // Prepare data for the request
    const authToken = localStorage.getItem('authToken') || ''; // Get auth token

    // Append the user message to the conversation history
    const conversationHistory = JSON.stringify([
        ...messages.map(msg => ({ role: msg.role, content: msg.content })), // Existing messages
        userMessage // Append the new user message
    ]);



    const summary1 = localStorage.getItem(`${id}_char_sub_name`) || ''; // Replace with actual summary1 if available
    const summary2 = localStorage.getItem(`${id}_char_sub_name`) || ''; // Replace with actual summary2 if available
    const charId = id; // Use the character ID from the URL params
    const audioStatus = `${isVolumeHigh}`; // Set audio status
    const audioCodes = localStorage.getItem(`${id}_char_audio_code`) || '';  // Replace with actual audio codes if available
    const audioUrl = localStorage.getItem(`${id}_char_audio_url`) || ''; 
    const audioName = localStorage.getItem(`${id}_char_audio_name`) || '';  // Replace with actual audio name if available
    const transcribeText = localStorage.getItem(`${id}_char_voice_trans`) || '';  // Replace with actual transcribe text if available



    // Create URL-encoded body
    const body = new URLSearchParams({
        message: message,
        authToken: authToken,
        conversation_history: conversationHistory,
        summary1: summary1,
        summary2: summary2,
        charId: charId,
        audio_status: audioStatus,
        audio_codes: audioCodes,
        audio_url: audioUrl,
        audio_name: audioName,
        transcibe_text: transcribeText,
    }).toString();

    

    // Send message to the server
    try {
        const response = await fetch('https://speakingcharacter.ai/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

      const responseText = await response.text();
      const botMessage = {
        role: 'bot',
        content: responseText || 'No response received.',
        loading: false,
      };

      // Update local state and local storage for bot message
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg, index) =>
          index === prevMessages.length - 1 ? botMessage : msg
        );
        localStorage.setItem(id, JSON.stringify(updatedMessages));
      
        return updatedMessages;
      });

    } catch (error) {
        console.error('Error sending message:', error);
        displayToast('Error sending message:', 'error');
    } finally {
      setTimeout(() => {
        inputRef.current?.setFocus();
      }, 100);
        setIsLoadingBotMessage(false); // Ensure loading is disabled after the request is complete
    }

    // Call createBubble at the end of the function
    createBubble(); // This will create a bubble after sending the message
};






const displayToast = (message: string, type: string) => {
  console.error("In display toast")
  setToastMessage(message);
  setToastType(type);
  setIsToastVisible(true);
  setTimeout(() => {
      setIsToastVisible(false);
  }, 4000);
};



const hardReloadMessages = async () => {

  console.log("  in ::::: hard reload:::::")
  setIsLoadingMessages(true);
  
  try {
      const authToken = localStorage.getItem('authToken');
      const storedCharData = localStorage.getItem(`${id}_char_data`); // Check local storage for character data

      if(storedCharData){
        console.log("In if ::::::")
        const characterData = JSON.parse(storedCharData);
        setCharacterData(characterData);
        setisLoadingHeaderContent(false);
      } else{
        console.log("In Else ::::::")
        setisLoadingHeaderContent(true)
      }
      const fcm = localStorage.getItem('fcmToken');

      
          // If no messages or character data in local storage, fetch from API
          const response = await fetch(`https://speakingcharacter.ai/get_messages?authToken=${authToken}&charId=${id}`, {
            method: "GET",
            headers: {
                "device": "ios",
                "nottoken": `${fcm}`
            }
        });


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

          

          setCharacterData(data.char_data);
          character_image = data.char_data.image_url;
      
  } catch (error) {
      console.error('Error loading messages:', error);
      // You might want to add error handling UI here
  } finally {
      setIsLoadingMessages(false);
      setisLoadingHeaderContent(false)
  }
};



const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
        const authToken = localStorage.getItem('authToken');
        const storedMessages = localStorage.getItem(id); // Check local storage for messages
        const storedCharData = localStorage.getItem(`${id}_char_data`); // Check local storage for character data

        const fcm = localStorage.getItem('fcmToken');


        if (storedMessages && storedCharData) {
            // If messages and character data are found in local storage, parse and set them
            const formattedMessages = JSON.parse(storedMessages);
            const characterData = JSON.parse(storedCharData);
            const parsedMessages: Message[] = JSON.parse(storedMessages);

            setMessages(formattedMessages);
            setCharacterData(characterData); // Set character data from local storage
        } else {
            // If no messages or character data in local storage, fetch from API
            const response = await fetch(`https://speakingcharacter.ai/get_messages?authToken=${authToken}&charId=${id}`, {
              method: "GET",
              headers: {
                  "device": "ios",
                  "nottoken": `${fcm}`
              }
          });
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
            setCharacterData(data.char_data);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        // You might want to add error handling UI here
    } finally {
        setIsLoadingMessages(false);
    }
};

  const toggleVolume = () => {
    setIsVolumeHigh(prevState => !prevState); // Toggle the volume state
  };

  

  // Function to toggle audio selection popup
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

  // Function to toggle audio playback
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


  // Function to fetch voice data
async function fetchVoiceData() {
    setIsLoadingAudio(true); // Set loading state to true
    const loadingSpinner = document.getElementById('loadingSpinner-for-audio');
    //loadingSpinner.style.display = 'block'; // Show spinner
  
    try {
      const authToken = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append('authToken', authToken);
  
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
  
    // Function to update the voice list in the popup
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
    const authToken = localStorage.getItem('authToken');
    const charId = id; // Assuming this function extracts the character ID

    localStorage.setItem(`${charId}_char_voice_name`, audio);
    localStorage.setItem(`${charId}_char_audio_name`, audio);
    localStorage.setItem(`${charId}_char_audio_url`, voice_url);
    localStorage.setItem(`${charId}_char_audio_code`, voice_code);
    localStorage.setItem(`${charId}_char_voice_trans`, trans);
}

  // Add function to handle call button click
  const handleCallClick = () => {
    const url = `/talking/${id}` 
    window.location.href = url;
  };

  const clearChat = () => {
    setMessages([]); // Clear messages
    localStorage.removeItem(id); // Clear messages from local storage
    setShowPopover(false); // Close the popover
  };

  const showNewOverlay = () => {
    if (newOverlayRef.current) {
        newOverlayRef.current.style.display = 'block'; // Show new overlay
    }
};

const hideNewOverlay = () => {
  if (newOverlayRef.current) {
      newOverlayRef.current.style.display = 'none'; // Hide new overlay
  }
};


const hideDeletePopup = () => {
  hideNewOverlay();
  if (overlayRef.current && popupRef.current) {
      overlayRef.current.style.display = 'none';
      popupRef.current.style.display = 'none';
  }
};


  const showDeletePopup = () => {
    showNewOverlay();
    if (overlayRef.current && popupRef.current && loadingSpinnerRef.current) {
      overlayRef.current.style.display = 'block';
      popupRef.current.style.display = 'flex';

      document.getElementById('cancel-delete')!.onclick = hideDeletePopup;
      document.getElementById('confirm-delete')!.onclick = deleteCharacter; // Use the deleteCharacter function
      document.getElementById('close-popup')!.onclick = hideDeletePopup;
    }
  };


  

// Add this function
const deleteCharacter = async () => {
  const authToken = localStorage.getItem("authToken");
  const characterId = id; // Using id from useParams
  const isPrivate = "";

  const confirmDeleteButton = document.getElementById('confirm-delete');
  const loadingSpinner = document.getElementById('loadingSpinner-2');

  if (confirmDeleteButton && loadingSpinner) {
    // Show loading spinner and disable button
    confirmDeleteButton.disabled = true;
    loadingSpinner.style.display = 'block';

    try {
      const formData = new FormData();
      formData.append('authToken', authToken || '');
      formData.append('characterId', characterId);
      formData.append('isPrivate', isPrivate);

      const response = await fetch('https://speakingcharacter.ai/delete/character', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        //showToast("Chat deleted successfully!", "success");
       // location.reload();
       displayToast("Chat Cleared successfully", "success");
        hideDeletePopup();
        await hardReloadMessages();
        displayToast("Chat Cleared successfully", "success");
      } else {
        displayToast("Failed to delete character chat", "error");
      }
    } catch (error) {
      console.error(error);
      
      displayToast("Error deleting messages.", "error");
    } finally {
      // Reset button state and hide spinner
      confirmDeleteButton.disabled = false;
      loadingSpinner.style.display = 'none';
      hideDeletePopup();
    }
  }
};

const showToast = (message: string, type: 'success' | 'error') => {
  alert(message); // Simple implementation - replace with your toast system
};



const goHome = () => {
  router.push('/home');
};

const handleBackButtonClick = () => {
  router.goBack(); // Uses Ionic's navigation with smooth transitions
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


  // Replace this:




  useEffect(() => {
    // Handle app resume/pause events
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // Blur any focused elements when app resumes
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.tagName === 'ION-INPUT') {
          activeElement.blur();
        }
      }
    });
  

  
    return () => {
      App.removeAllListeners();
    };
  }, []);



  const setInfomodeltotrue = () => {
    console.log("clicked:::::::")
    setShowInfoModal(true)
  }




  // Memoize the header to prevent flickering
  const header = useMemo(() => (
    <IonHeader className='navHead'>
      <IonToolbar color="black" style={{ backgroundColor: 'white', margin: 0, padding: 0 }}>
        <IonButtons slot="start">
          <IonButton onClick={handleBackButtonClick} fill="clear">
            <IonIcon icon={chevronBack} /> {/* Use an icon for the back button */}
          </IonButton>
        </IonButtons>

        <IonItem lines="none" color="white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} >
          <IonAvatar slot="start" >
            {isLoadingHeaderContent ? (
              <Shimmer width="50px" height="50px" border-radius="50%" /> // Shimmer for image
            ) : (
              <img 
                src={characterData?.image_url || 'default-avatar.png'} 
                alt={characterData?.name || 'Character'} 
                onClick={setInfomodeltotrue}
              />
            )}
          </IonAvatar>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
            {isLoadingHeaderContent ? (
              <Shimmer width="100px" height="20px" style={{ borderRadius: '50%' }} /> // Shimmer for title
            ) : (
              <h3 className='custom-title' onClick={setInfomodeltotrue}>
                {truncateString(characterData?.name || 'Loading...', 20)}
              </h3>
            )}
          </div>
          <div slot="end" style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <IonButton fill="clear" onClick={toggleVolume}>
              <IonIcon icon={isVolumeHigh ? volumeHigh : volumeMute} />
            </IonButton>

            <IonButton fill="clear" onClick={handleCallClick}>
              <IonIcon icon={call} />
            </IonButton>

            <IonButton style={{ marginRight: '-20px' }} fill="clear" onClick={() => setShowPopover(true)}>
              <IonIcon icon={ellipsisVertical} /> {/* Three vertical dots icon */}
            </IonButton>
          </div>
        </IonItem>
      </IonToolbar>
    </IonHeader>
  ), [isLoadingMessages, characterData, isVolumeHigh, isLoadingHeaderContent]); // Dependencies to memoize

  
  const [keyboardHeight, setKeyboardHeight] = useState(0);

useEffect(() => {
  // Add keyboard listeners
  Keyboard.addListener('keyboardWillShow', (info) => {
    setKeyboardHeight(info.keyboardHeight);
  });

  Keyboard.addListener('keyboardWillHide', () => {
    setKeyboardHeight(0);
  });

  return () => {
    Keyboard.removeAllListeners();
  };
}, []);




useEffect(() => {
  if (typeof window !== 'undefined' && window.visualViewport) {
    const visualViewport = window.visualViewport;
    
    const handler = () => {
      const offset = visualViewport.height - window.innerHeight;
      setKeyboardHeight(Math.max(0, -offset));
    };

    

    visualViewport.addEventListener('resize', handler);
    return () => visualViewport.removeEventListener('resize', handler);
  }
}, []);


useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    Keyboard.setAccessoryBarVisible({ isVisible: false });
    Keyboard.setScroll({ isDisabled: true });
  }
}, []);

// In your keyboard listener
Keyboard.addListener('keyboardWillShow', (info) => {
  if (Capacitor.getPlatform() === 'ios') {
    setKeyboardHeight(info.keyboardHeight - 5); // Adjust for iOS safe area
  } else {
    setKeyboardHeight(info.keyboardHeight);
  }
});





const [isKeyboardOpen2, setIsKeyboardOpen] = useState(false);

useEffect(() => {
  const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
    setIsKeyboardOpen(true);
  });

  const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
    setIsKeyboardOpen(false);
  });

  return () => {
    showSubscription.remove();
    hideSubscription.remove();
  };
}, []);

const handleContentClick = (e: React.MouseEvent) => {
  if (!inputRef.current || !isKeyboardOpen2) return; // Only proceed if the keyboard is open

  const target = e.target as HTMLElement;
  if (!target.closest('.input-container')) {
    inputRef.current.getInputElement().then((nativeInput) => {
      nativeInput.blur();
      Keyboard.hide(); // Ensures the keyboard is closed
    });
  }
};

// Add proper type for IonContent ref
const ionContentRef = useRef<HTMLIonContentElement>(null);

// Then in your scroll function
useEffect(() => {
  if (ionContentRef.current && !isLoadingMessages) {
    // Use the proper Ionic content API
    ionContentRef.current.getScrollElement().then((scrollElement) => {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
}, [messages, isLoadingMessages]);

// In your keyboard listener
Keyboard.addListener('keyboardWillShow', (info) => {
  const iosSafeArea = Capacitor.getPlatform() === 'ios' ? 
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-bottom')) || 0 : 0;
  
  setKeyboardHeight(info.keyboardHeight - iosSafeArea);
});

const messageContainerRef = useRef<HTMLDivElement | null>(null);
const [isMessageContainerFull, setIsMessageContainerFull] = useState(false);

useEffect(() => {
  const checkMessageContainerHeight = () => {
    if (messageContainerRef.current) {
      const containerHeight = messageContainerRef.current.clientHeight;
      const viewportHeight = window.innerHeight;
      setIsMessageContainerFull(containerHeight >= viewportHeight * 0.9);
    }
  };

  window.addEventListener('resize', checkMessageContainerHeight);
  checkMessageContainerHeight(); // Initial check

  return () => {
    window.removeEventListener('resize', checkMessageContainerHeight);
  };
}, [messages]); // Re-check when messages change


    useEffect(() => {
        const checkMessageContainerHeight = () => {
            if (messageContainerRef.current) {
                const containerHeight = messageContainerRef.current.clientHeight;
                const viewportHeight = window.innerHeight;

                // Check if the container height exceeds 50% of the viewport height
                if (containerHeight > viewportHeight * 0.7) {
                    // Apply styles directly
                    messageContainerRef.current.style.transform = `translateY(-${keyboardHeight}px)`;
                    messageContainerRef.current.style.transition = 'transform 255ms ease-out';
                } else {
                    // Reset styles if condition is not met
                    messageContainerRef.current.style.transform = 'none';
                }
            }
        };

        window.addEventListener('resize', checkMessageContainerHeight);
        checkMessageContainerHeight(); // Initial check

        return () => {
            window.removeEventListener('resize', checkMessageContainerHeight);
        };
    }, [messages, keyboardHeight]); // Re-check when messages change or keyboard height changes



const fullContainerStyle = {
  transform: `translateY(-${keyboardHeight}px)`,
  transition: 'transform 255ms ease-out',
};

const [bubbles, setBubbles] = useState<JSX.Element[]>([]);

  const createBubble = () => {
    const newBubble = (
      <div
        key={Date.now()}
        className="bubble"
        style={{
          left: `${window.innerWidth / 2 - 100}px`,
          top: `${window.innerHeight / 2 - 100}px`,
        }}
      >
        <img
          src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTYkqiLNeAiLJP3AHf04h08Iz9lkd1iVbcmHkOob8rTBgtuZ91EdktitjlijeYz26us1s3VvrRIUohHy7pwzygrKnX7idg_c9pJiSQ3XLE"
          alt="Bubble Content"
        />
      </div>
    );

    setBubbles((prevBubbles) => [...prevBubbles, newBubble]);

    setTimeout(() => {
      setBubbles((prevBubbles) => prevBubbles.slice(1));
    }, 3000);
  };

  return (
    <IonPage className='ionPage'>




      {header} {/* Use the memoized header here */}
      <IonContent 
          ref={ionContentRef} // Add a ref to IonContent

      className="chat-content"  
      onClick={handleContentClick}
      scrollY={true}
     scrollEvents={true}
     onIonScrollStart={() => setUserScrolling(true)}
     onIonScrollEnd={() => setUserScrolling(false)}
     onTouchStart={(e) => e.stopPropagation()} // Prevent touch events from bubbling up
     >
        {isLoadingMessages ? (
          <div className="message-container">
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
            <Shimmer width="100%" height="40px" position="right" /> {/* Shimmer for user message */}
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
            <Shimmer width="100%" height="40px" position="right" /> {/* Shimmer for user message */}
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
            <Shimmer width="100%" height="40px" position="right" /> {/* Shimmer for user message */}
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}

            <Shimmer width="100%" height="40px" position="right" /> {/* Shimmer for user message */}
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
            <Shimmer width="100%" height="40px" position="right" /> {/* Shimmer for user message */}
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
          </div>
        ) : (
          <div 
          ref={messageContainerRef}
          style={{
            transform: `translateY(-${keyboardHeight}px)`,
            transition: 'transform 255ms ease-out',
          }} className="message-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.role === 'user' ? 'sent' : 'received'}`}
                >
                  {msg.role !== 'user' && ( // Show avatar only for received messages
                    <img src = {localStorage.getItem(`${id}_char_image_url`) || ""} alt="Bot Avatar" className="message-avatar" />
                  )}
                  <div className={`message-bubble ${msg.role === 'user' ? 'sent' : 'received'}`}>
                    <p>{msg.content}</p>
                    {index === messages.length - 1 && msg.loading && isLoadingBotMessage && (
                      <div className="loading-dots">
                        <span></span><span></span><span></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ height: "70px" }}></div> {/* Extra space at the bottom */}
              <div ref={messageEndRef} className="message-end"></div>

            </div>

        )}

    
      </IonContent>


        <div className="containerbubble">
          {bubbles}
        </div>
      
<IonFooter 
  style={{
    transform: `translateY(-${keyboardHeight}px)`,
    transition: 'transform 255ms ease-out',
  }}
  className="input-footer"
>
  <div className="input-container">
    <IonInput
      ref={inputRef}
      
      placeholder="Type a message"
      inputmode="text"
      value={message}
      enterkeyhint="send"
      className="message-input"
      autocomplete="on"
      autocorrect="on"
      style={{ "--padding-bottom": "5px" }}
      onIonBlur={() => {
        // Only prevent blur if using native keyboard
        if (Capacitor.isNativePlatform() && keyboardHeight > 0) {
          inputRef.current?.setFocus();
        }
      }}
      onIonInput={(e: CustomEvent) => setMessage(e.detail.value as string)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }}
      autoCapitalize="sentences"
    />
    <IonButton
    onClick={(e) => {
      e.stopPropagation();
      sendMessage();
    }}
      fill="clear"
      className="send-button"
      disabled={isLoadingBotMessage || !message.trim()}
      
    >
      <IonIcon icon={send} />
    </IonButton>
  </div>
</IonFooter>



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

<IonPopover
  isOpen={showPopover}
  onDidDismiss={() => setShowPopover(false)}
  showBackdrop={false}
  className="custom-popover"
>
  <IonContent className="popover-content">
    <IonList>
      <IonItem button onClick={() => {
        showDeletePopup();
        setShowPopover(false);  // Close popover
      }} detail={false} className="custom-item">
        <IonIcon 
          slot="start" 
          icon={trash}
          className="delete-icon"
        />
        <IonLabel className="delete-label">Clear Chat</IonLabel>
      </IonItem>

      <IonItem button onClick={() => {
        toggleAudioPopup();
        setShowPopover(false);  // Close popover
      }} detail={false} className="custom-item">
        <IonIcon 
          slot="start" 
          icon={mic}
          className="delete-icon"
        />
        <IonLabel className="delete-label">Change Voice</IonLabel>
      </IonItem>
    </IonList>
  </IonContent>




</IonPopover>

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


            <div className="new-overlay-delete" id="new-overlay" ref={newOverlayRef} style={{ display: 'none' }}></div>

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


{showInfoModal && (
        <CharacterInfoModal
          characterImage={localStorage.getItem(`${id}_char_image_url`) || "Character Bio"}
          characterName= {localStorage.getItem(`${id}_char_name`) || "Character Name"}
          characterBio= {localStorage.getItem(`${id}_char_image_url`) || "Character Bio"}
          welcomeMessage= {localStorage.getItem(`${id}_char_sub_name_2`) || "Character Bio"}
          onAddToGroup={() => console.log('Add to group')}
          onDeleteChat={() => console.log('Delete chat')}
          onClose={() => setShowInfoModal(false)} // This controls visibility
        />
      )}
    </IonPage>




    
  );

  
};



export default CharacterChatPage; 