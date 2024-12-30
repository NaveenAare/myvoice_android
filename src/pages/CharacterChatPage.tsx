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
} from '@ionic/react';
import { call, mic, volumeHigh, volumeMute, send } from 'ionicons/icons'; // Import necessary icons
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './Chat.css';
import { io } from 'socket.io-client'; // Import socket.io client
import Shimmer from '../components/shrimmer'; // Import the Shimmer component


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

const CharacterChatPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true); // For loading messages
  const [isLoadingBotMessage, setIsLoadingBotMessage] = useState(false); // For loading bot message
  const { id } = useParams<{ id: string }>();
  const [isVolumeHigh, setIsVolumeHigh] = useState(true); // State to track volume
  const messageEndRef = useRef<HTMLDivElement | null>(null); // Create a ref for the end of the message container
  const inputRef = useRef<HTMLIonInputElement | null>(null); // Create a ref for the input field
  let storedAudio: string | null = null; // Variable to store audio data

  localStorage.setItem("authToken", "eyJ1c2VySWQiOiAxLCAibWFpbCI6ICJhYXJlbmF2ZWVudmFybWFAZ21haWwuY29tIiwgIm5hbWUiOiAiTmF2ZWVuIHZhcm1hIEFhcmUiLCAicHJvZmlsZV9waWMiOiAiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSTZQa3BFSGJkdGZoQTFETFp5OHVCcnZrejRIaDhTVjhMQmtzajRYRjdTVlB2OEllRDU9czk2LWMifTAxODYzNTczMDA3ODJiMmRjOTFjZWNlZDBiZGM0OWNiMWNjZDZmODIzZDM2ZTcyMzY0N2EwZjIwZjVkZTgyOTc=");

  const socket = io('https://api.speakingcharacter.ai', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 30000,
    pingInterval: 25000,
    pingTimeout: 60000,
  });
  useEffect(() => {
    loadMessages();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    const authToken = localStorage.getItem('authToken') || '';
    const uniquePart = id;

    let messageHandled = false; // Flag to track if the message has been handled

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
                reject(new Error('Error playing audio: ' + error.message)); // Reject if there’s an error
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

  // Function to scroll to the bottom of the message container
  const scrollToBottom = () => {
      if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
  };

  useEffect(() => {
      scrollToBottom(); // Scroll to bottom when the component mounts
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
      scrollToBottom(); // Scroll to bottom when messages change
  }, [messages]); // Dependency array includes messages

  const sendMessage = async () => {
    if (!message.trim() || isLoadingBotMessage) return; // Prevent sending empty messages or if already loading

    const userMessage = {
        role: 'user', // Store role first
        content: message, // Then content
    };

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
    setIsLoadingBotMessage(true); // Set loading state for bot message

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
        const response = await fetch('https://api.speakingcharacter.ai/send_message', {
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
    } finally {
        setIsLoadingBotMessage(false); // Ensure loading is disabled after the request is complete
    }
};





const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
        const authToken = localStorage.getItem('authToken');
        const storedMessages = localStorage.getItem(id); // Check local storage for messages
        const storedCharData = localStorage.getItem(`${id}_char_data`); // Check local storage for character data

        if (storedMessages && storedCharData) {
            // If messages and character data are found in local storage, parse and set them
            const formattedMessages = JSON.parse(storedMessages);
            const characterData = JSON.parse(storedCharData);
            const parsedMessages: Message[] = JSON.parse(storedMessages);

            setMessages(formattedMessages);
            setCharacterData(characterData); // Set character data from local storage
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

  // Function to handle key down in the input field
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default behavior (like form submission)
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="white">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="" />
          </IonButtons>
          <IonItem lines="none" color="white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <IonAvatar slot="start">
              {isLoadingMessages ? (
                <Shimmer width="50px" height="50px" /> // Shimmer for image
              ) : (
                <img 
                  src={characterData?.image_url || 'default-avatar.png'} 
                  alt={characterData?.name || 'Character'} 
                />
              )}
            </IonAvatar>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
              {isLoadingMessages ? (
                <Shimmer width="100px" height="20px" /> // Shimmer for title
              ) : (
                <h3 className='custom-title'>{truncateString(characterData?.name || 'Loading...', 20)}</h3>
              )}
            </div>
            <div slot="end" style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <IonButton fill="clear" onClick={toggleVolume}>
                    <IonIcon icon={isVolumeHigh ? volumeHigh : volumeMute} />
                </IonButton>

               
                <IonButton fill="clear" onClick={() => console.log('Mic button clicked')}>
                    <IonIcon icon={mic} />
                </IonButton>

                <IonButton fill="clear" onClick={() => console.log('Call button clicked')}>
                    <IonIcon icon={call} />
                </IonButton>
                
            </div>
          </IonItem>
        </IonToolbar>
      </IonHeader>

      <IonContent className="chat-content">
        {isLoadingMessages ? (
          <div className="message-container">
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
            <Shimmer width="100%" height="40px" position="right" /> {/* Shimmer for user message */}
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
            <Shimmer width="100%" height="40px" position="right" /> {/* Shimmer for user message */}
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
            <Shimmer width="100%" height="40px" position="right" /> {/* Shimmer for user message */}
            <Shimmer width="100%" height="40px" position="left" /> {/* Shimmer for bot message */}
          </div>
        ) : (
          <div className="message-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === 'user' ? 'sent' : 'received'}`}
              >
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  {index === messages.length - 1 && msg.loading && isLoadingBotMessage && (
                    <div className="loading-dots">
                      <span></span><span></span><span></span>
                    </div>
                  )}
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} /> {/* Empty div to scroll to */}
          </div>
        )}

        {isLoadingBotMessage && (
          <div className="loading-dots-container">
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </IonContent>

      <IonFooter>
        <div className="input-container">
         
          <IonInput
            ref={inputRef} // Attach the ref to the input field
            placeholder="Type a message"
            value={message}
            onIonChange={e => setMessage(e.detail.value!)}
            onKeyDown={handleKeyDown} // Use onKeyDown for Enter key
            className="message-input"
            rows={3} // Allow for multiple rows
            multiline // Enable multiline input
          />
          <IonButton
            fill="clear"
            className="send-button"
            onClick={sendMessage}
            disabled={isLoadingBotMessage} // Disable button while loading
          >
            <IonIcon icon={send} />
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default CharacterChatPage; 