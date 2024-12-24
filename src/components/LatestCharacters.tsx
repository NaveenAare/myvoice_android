import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetch('https://speakingcharacter.ai/get/firstSection/popular', {
      method: 'POST',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="popular-cards-container">
      {cards.map((card) => (
        <div key={card.id} className="popular-card">
          <img src={card.image_url} alt={card.name} className="popular-card-image" />
          <h3 className="popular-card-title">{card.name}</h3>
          <p className="popular-card-summary">{card.summary2}</p>
        </div>
      ))}
    </div>
  );
};

export default LatestCharacters;
