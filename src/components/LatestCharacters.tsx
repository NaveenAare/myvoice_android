import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation
import './LatestCharacters.css';

interface PopularCard {
  category: string;
  code: string;
  id: string;
  image_url: string;
  name: string;
  summary2: string;
}

const LatestCharacters: React.FC = () => {
  const [cards, setCards] = useState<PopularCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory(); // Initialize useHistory for routing

  useEffect(() => {
    fetch('https://speakingcharacter.ai/get/firstSection/popular', {
      method: 'POST',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch characters');
        }
        return response.json();
      })
      .then((data) => {
        setCards(data.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (charId: string) => {
    console.log(`Redirecting to chat screen with character ID: ${charId}`);
    history.push(`/chat/${charId}`); // Redirect to the chat screen with the character ID
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="popular-cards-container">
        {cards.map((card) => (
          <div
            key={card.id}
            className="popular-card"
            onClick={() => handleCardClick(card.id)}
          >
            <img src={card.image_url} alt={card.name} className="popular-card-image" />
            <h3 className="popular-card-title">{card.name}</h3>
            <p className="popular-card-summary">{card.summary2}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestCharacters;
