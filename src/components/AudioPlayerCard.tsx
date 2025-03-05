import React, { useState, useRef, useEffect } from 'react';
import '../components/AudioPlayerCard.css';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';

import { Dialog } from '@capacitor/dialog';




const AudioPlayerCard = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track user interaction
  const audioRef = useRef(null);

  const [isAudioPopupActive, setIsAudioPopupActive] = useState(false); // State for audio popup
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); // State for loading audio


  

  // Handle play/pause
  const togglePlay = () => {
    if (!audioUrl || !isAudioLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Attempt to play audio
      audioRef.current.play().catch((error) => {
        console.error('Audio playback failed:', error);
        setIsAudioLoaded(false); // Disable playback if it fails
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Update progress as audio plays
  const updateProgress = () => {
    if (!audioUrl || !isAudioLoaded) return;
    const duration = audioRef.current.duration;
    const currentTime = audioRef.current.currentTime;
    setProgress((currentTime / duration) * 100);
  };

  // Handle seeker change
  const handleSeekerChange = (e) => {
    if (!audioUrl || !isAudioLoaded) return;
    const seekTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  // Reset when audio ends
  useEffect(() => {
    if (!audioUrl || !isAudioLoaded) return;

    const audioElement = audioRef.current;
    audioElement.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });

    return () => {
      audioElement.removeEventListener('ended', () => {});
    };
  }, [audioUrl, isAudioLoaded]);

  // Check if audio is loaded
  useEffect(() => {
    if (!audioUrl) {
      setIsAudioLoaded(false);
      return;
    }

    const audioElement = audioRef.current;

    // Load audio after user interaction (required for iOS)
    const handleUserInteraction = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        audioElement.load(); // Explicitly load the audio
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Check if audio is loaded
    audioElement.addEventListener('loadeddata', () => {
      setIsAudioLoaded(true);
    });

    // Handle audio errors
    audioElement.addEventListener('error', () => {
      setIsAudioLoaded(false);
      console.error('Failed to load audio.');
    });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      audioElement.removeEventListener('loadeddata', () => {});
      audioElement.removeEventListener('error', () => {});
    };
  }, [audioUrl, hasUserInteracted]);



 

  const [loading, setLoading] = useState(false);

  const downloadAudio = async () => {
    if (!audioUrl || !isAudioLoaded) return;
  
    setLoading(true); // Show TTS loading spinner
  
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
  
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result?.toString().split(',')[1]; // Remove data type prefix
          if (!base64Data) throw new Error('Base64 conversion failed');
  
          const fileName = `audio_${Date.now()}.mp3`;
          const directory = Directory.Documents;
  
          // Save MP3 file as Base64
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: directory,
            encoding: Encoding.Base64, // ✅ Correct encoding for MP3
          });
  
          if (Capacitor.isNativePlatform()) {
            // Get file URI
            const uri = await Filesystem.getUri({ directory, path: fileName });
  
            // Open file with system player
            await FileOpener.open({ filePath: uri.uri, contentType: 'audio/mpeg' });
  
            // Show success message
            await Dialog.alert({
              title: 'Download Complete',
              message: 'Audio saved successfully!',
            });
          } else {
            // Web fallback - Download file
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          }
        } catch (error) {
          console.error('File saving error:', error);
          alert('Failed to save the audio file.');
        } finally {
          setLoading(false); // Hide loading spinner
        }
      };
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download audio. Please check storage permissions.');
      setLoading(false);
    }
  };





  

  return (
    <div 
    className=
    {`audio-player-card-tts ${!audioUrl || !isAudioLoaded ? 'inactive' : ''}`}
    >
      {/* Audio element */}
      <audio ref={audioRef} src={audioUrl} onTimeUpdate={updateProgress} preload="none" />

      {/* Play/Pause Button */}
      <button
        className={`play-button-tts ${!audioUrl || !isAudioLoaded ? 'inactive' : ''}`}
        onClick={togglePlay}
        disabled={!audioUrl || !isAudioLoaded}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#FFFFFF"
          >
            <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#FFFFFF"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Seeker (Progress Bar) */}
      <input
        type="range"
        className={`seeker-tts ${!audioUrl || !isAudioLoaded ? 'inactive' : ''}`}
        value={progress}
        onChange={handleSeekerChange}
        min="0"
        max="100"
        disabled={!audioUrl || !isAudioLoaded}
      />

      {/* Download Button */}
      <a
  href={audioUrl}
  download="audio.mp3"
  className={`download-button-tts ${!audioUrl || !isAudioLoaded ? 'inactive' : ''}`}
  onClick={(e) => {
    e.preventDefault(); // Prevent download if no audio
    if (!audioUrl || !isAudioLoaded) {
      e.preventDefault(); // Prevent download if no audio
      return;
    }
    downloadAudio();
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="#FFFFFF"
  >
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
</a>
    </div>
  );
};

export default AudioPlayerCard;