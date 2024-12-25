import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation
import './PopularTools.css';

interface Assistant {
  category: string;
  code: string;
  id: string;
  image_url: string;
  name: string;
  summary2: string;
}

const AssistantComponent: React.FC = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const history = useHistory(); // Initialize useHistory for routing

  useEffect(() => {
    // Fetch the assistant data from the API
    const fetchAssistants = async () => {
      try {
        const response = await fetch('https://speakingcharacter.ai/get/assistants');
        if (!response.ok) {
          throw new Error('Failed to fetch assistants');
        }
        const data = await response.json();
        setAssistants(data.data); // Assuming the data is in 'data' field
      } catch (error) {
        console.error("Error fetching data", error);
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
      {assistants.length > 0 ? (
        assistants.map((assistant) => (
          <div
            className="assistant-card"
            key={assistant.id}
            onClick={() => handleCardClick(assistant.id)} // Redirect on click
          >
            <img
              src={assistant.image_url}
              alt={assistant.category}
              className="assistant-image"
            />
            <div className="assistant-info">
              <h3 className="assistant-title">{assistant.name}</h3>
              <p className="assistant-code">{assistant.summary2}</p>
            </div>
          </div>
        ))
      ) : (
        <p>Loading assistants...</p>
      )}
    </div>
  );
};

export default AssistantComponent;
