import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation
import './FilterSection.css';

interface FilterResponse {
  category: string;
  code: string;
  id: string;
  image_url: string;
  name: string;
  summary2: string;
}

const FilterSection: React.FC = () => {
  const [filteredData, setFilteredData] = useState<FilterResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory(); // Initialize useHistory for routing

  const buttons = [
    { label: 'All', value: 'All' },
    { label: 'History & Culture 📜', value: 'History & Culture 📜' },
    { label: 'Love & Relationships 💖', value: 'Love & Relationships 💖' },
    { label: 'Food & Cooking 🍽️', value: 'Food & Cooking 🍽️' },
    { label: 'Art & Creativity 🎨', value: 'Art & Creativity 🎨' },
    { label: 'Sports & Fitness ⚽', value: 'Sports & Fitness ⚽' },
    { label: 'Health & Wellness 🏥', value: 'Health & Wellness 🏥' },
    { label: 'Adventure & Travel ✈️', value: 'Adventure & Travel ✈️' },
    { label: 'Finance & Business 💼', value: ' Finance & Business 💼' },
    { label: 'Environment & Nature 🌍', value: 'Environment & Nature 🌍' },
    { label: 'Gaming & Entertainment 🎮', value: 'Gaming & Entertainment 🎮' },
    { label: 'Fashion & Lifestyle 👗', value: ' Fashion & Lifestyle 👗' },
    { label: 'Motivation & Inspiration 🌟', value: 'Motivation & Inspiration 🌟' },
    { label: 'Self-Improvement & Personal Development 📈', value: 'Self-Improvement & Personal Development 📈' },
    { label: 'Comedy & Humor 😂', value: 'Comedy & Humor 😂' },
  ];

  // Function to fetch the data
  const handleFilter = async (value: string) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('filters', value);

      const response = await fetch('https://speakingcharacter.ai/get/filterSection', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch filtered data');
      }
      const data = await response.json();
      setFilteredData(data.data); // Assuming the response data is in the 'data' field
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for 'All' category when component mounts
  useEffect(() => {
    handleFilter('All');
  }, []);

  const handleCardClick = (itemId: string) => {
    console.log(`Redirecting to chat screen with item ID: ${itemId}`);
    history.push(`/chat/${itemId}`); // Redirect to the chat screen with the item ID
  };

  return (
    <div className="filter-section-container">
      <div className="filter-buttons">
        {buttons.map((button) => (
          <button
            key={button.value}
            className="filter-button"
            onClick={() => handleFilter(button.value)}
          >
            {button.label}
          </button>
        ))}
      </div>
      {loading && <p>Loading filtered data...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="filtered-data-container">
        {filteredData.map((item) => (
          <div
            className="filtered-data-card"
            key={item.id}
            onClick={() => handleCardClick(item.id)} // Redirect on click
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="filtered-data-image"
            />
            <div className="filtered-data-info">
              <h3 className="filtered-data-title">{item.name}</h3>
              <p className="filtered-data-summary">{item.summary2}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSection;
