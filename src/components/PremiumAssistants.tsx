import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch('https://speakingcharacter.ai/get/premium/assistants');
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

  return (
    <div className="assistant-container">
      {loading && <p>Loading premium assistants...</p>}
      {error && <p className="error-message">{error}</p>}
      {assistants.length > 0 && !error ? (
        assistants.map((assistant) => (
          <div className="assistant-card" key={assistant.id}>
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
