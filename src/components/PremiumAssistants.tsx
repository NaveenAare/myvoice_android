import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation
import './PremiumAssistants.css';

interface PremiumAssistant {
  category: string;
  code: string;
  id: string;
  image_url: string;
  name: string;
  summary2: string;
}

const PremiumAssistants: React.FC = () => {
  const [assistants, setAssistants] = useState<PremiumAssistant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory(); // Initialize useHistory for routing

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch('https://speakingcharacter.ai/get/premium/assistants');
        if (!response.ok) {
          throw new Error('Failed to fetch premium assistants');
        }
        const data = await response.json();
        setAssistants(data.data || []); // Assuming the data is in the 'data' field
      } catch (err) {
        console.error('Error fetching premium assistants:', err);
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  const handleCardClick = (assistantId: string) => {
    console.log(`Redirecting to chat screen with assistant ID: ${assistantId}`);
    history.push(`/chat/${assistantId}`); // Redirect to the chat screen with the assistant ID
  };

  return (
    <div className="assistant-container">
      {loading && <p>Loading premium assistants...</p>}
      {error && <p className="error-message">{error}</p>}
      {assistants.length > 0 && !error ? (
        assistants.map((assistant) => (
          <div
            className="assistant-card"
            key={assistant.id}
            onClick={() => handleCardClick(assistant.id)} // Redirect on click
          >
            <img
              src={assistant.image_url}
              alt={assistant.name}
              className="assistant-image"
            />
            <div className="assistant-info">
              <h3 className="assistant-title">{assistant.name}</h3>
              <p className="assistant-summary">{assistant.summary2}</p>
            </div>
          </div>
        ))
      ) : (
        !loading && <p>No premium assistants available.</p>
      )}
    </div>
  );
};

export default PremiumAssistants;
