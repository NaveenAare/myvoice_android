import React, { useState } from 'react';
import './TextToSpeech.css';

const TextToSpeech: React.FC = () => {
    const [text, setText] = useState('');

    const handlePlaySpeech = async () => {
        // Call the external API to play speech
        try {
            const response = await fetch('YOUR_PLAY_SPEECH_API_URL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error playing speech:', error);
        }
    };

    const handleChangeVoice = async () => {
        // Call the external API to change voice
        try {
            const response = await fetch('YOUR_CHANGE_VOICE_API_URL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error changing voice:', error);
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Text to Speech</h1>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text here"
                style={{ width: '80%', padding: '10px', margin: '20px 0' }}
            />
            <div>
                <button onClick={handlePlaySpeech} style={{ marginRight: '20px' }}>
                    Play Speech
                </button>
                <button onClick={handleChangeVoice}>
                    Change Voice
                </button>
            </div>
        </div>
    );
};

export default TextToSpeech;