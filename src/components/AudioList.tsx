import React, { useState, useEffect, useRef } from 'react';
import './AudioList.css';

interface AudioItem {
  code: string;
  created_date: string | null;
  description: string;
  id: string;
  name: string;
  transcribe_text: string;
  voice_url: string;
}

const AudioList: React.FC = () => {
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch audio data from the API
    const fetchAudios = async () => {
      try {
        const response = await fetch('https://speakingcharacter.ai/get/all/audios');
        if (!response.ok) {
          throw new Error('Failed to fetch audio data');
        }
        const data = await response.json();
        setAudios(data.data); // Assuming the data is in the 'data' field
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchAudios();
  }, []);

  const handlePlay = (audioElement: HTMLAudioElement) => {
    // Stop the currently playing audio, if any
    if (currentAudioRef.current && currentAudioRef.current !== audioElement) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0; // Reset the playback to the start
    }
    // Set the current audio as the one being played
    currentAudioRef.current = audioElement;
  };

  if (loading) {
    return <p>Loading audio data...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="audio-list-container">
      <h2 className="audio-list-heading">🎵 Audio List</h2>
      <div className="audio-list">
        {audios.map((audio) => (
          <div className="audio-card" key={audio.id}>
            <h3 className="audio-name">{audio.name}</h3>
            <p className="audio-description">{audio.description}</p>
            <audio
              controls
              className="audio-player"
              onPlay={(e) => handlePlay(e.currentTarget)}
            >
              <source src={audio.voice_url} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioList;
