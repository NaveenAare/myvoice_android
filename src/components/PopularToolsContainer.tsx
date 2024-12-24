import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Fetch the assistant data from the API
    const fetchAssistants = async () => {
      try {
        const response = await fetch('https://speakingcharacter.ai/get/assistants');
        const data = await response.json();
        setAssistants(data.data); // Assuming the data is in 'data' field
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchAssistants();
  }, []);

  return (
    <div className="assistant-container">
      {assistants.length > 0 ? (
        assistants.map((assistant) => (
          <div className="assistant-card" key={assistant.id}>
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
