import React, { useState, useEffect } from 'react';
import './FilterSection2.css'; // Import CSS styles

const FilterSection2: React.FC = () => {
  const emojis: string[] = ["All", "History & Culture 📜", "Love & Relationships 💖", "Food & Cooking 🍽️", "Art & Creativity 🎨", "Sports & Fitness ⚽", "Health & Wellness 🏥", "Adventure & Travel ✈️", "Finance & Business 💼", "Environment & Nature 🌍", "Gaming & Entertainment 🎮", "Fashion & Lifestyle 👗", "Motivation & Inspiration 🌟", "Self-Improvement & Personal Development 📈", "Mythology & Fantasy 🧚‍♂️", "Comedy & Humor 😂"]; // Emoji list
  // Don't set initial state
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Initialize on mount
  useEffect(() => {
    setActiveFilter(emojis[0]);
  }, []);

  // Separate effect for data fetching
  useEffect(() => {
    if (!activeFilter) return; // Don't fetch if no active filter

    const fetchData = async () => {
      const formData = new FormData();
      formData.append('filters', activeFilter);

      try {
        const response = await fetch('https://speakingcharacter.ai/get/filterSection', {
          method: 'POST',
          body: formData,
        });
        const dataFull = await response.json();
        
        const movingCardsWrapper = document.querySelector('.moving-cards-wrapper-your-char-full-card') as HTMLElement;
        if (!movingCardsWrapper) return;

        movingCardsWrapper.innerHTML = '';



        dataFull.data.forEach((character: any) => {
          // Create the card elements
          const cardDiv = document.createElement('div');
          cardDiv.classList.add('full-image-card');

          // Set the cursor to hand on hover
          cardDiv.style.cursor = 'pointer'; // Alternatively, this can be set in CSS

          const img = document.createElement('img');
          img.classList.add('full-image-card-img');
          img.src = character.image_url; // Assuming API returns an 'imageUrl' field
          img.alt = character.name;

          const infoDiv = document.createElement('div');
          infoDiv.classList.add('full-image-card-info');

          const h3 = document.createElement('h3');
          h3.classList.add('full-image-card-info-h3');
          h3.textContent = character.name;

          const pBy = document.createElement('p');
          pBy.classList.add('full-image-card-info-p');
          pBy.textContent = `${character.summary2}`;

          const h4 = document.createElement('h4');
          h4.classList.add('full-image-card-info-h4');
          h4.textContent = character.description;

          // Append elements to their respective parents
          infoDiv.appendChild(h3);
          infoDiv.appendChild(pBy);
          infoDiv.appendChild(h4);
          cardDiv.appendChild(img);
          cardDiv.appendChild(infoDiv);

          // Add click event listener to redirect on card click
          cardDiv.addEventListener('click', () => {
            checkLoginStatus(`/chatbox/chat/${character.code}`);
            //window.location.href = `/chatbox/chat/${character.code}`;  // Assuming API returns a 'code' field for each character
          });

          // Add the new card to the wrapper
          movingCardsWrapper.appendChild(cardDiv);
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [activeFilter]); // Re-run when activeFilter changes

  // Dummy checkLoginStatus function (you can replace it with actual logic)
  const checkLoginStatus = (url: string) => {
    console.log(`Redirecting to: ${url}`);
  };

  return (
    <div className="emoji-filter-wrapper">
      <div className="unique-filter-container-emoji">
        {emojis.map((emoji, index) => (
          <button
            key={`emoji-${index}`} // More specific key
            className={`unique-filter-button-emoji ${activeFilter === emoji ? 'active' : ''}`}
            onClick={() => setActiveFilter(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="moving-section-your-char">
        <div className="moving-cards-wrapper-your-char-full-card">
          {/* Skeleton card elements will be displayed here initially */}
      
            <div className ="full-image-card">
                <img className ="full-image-card-img" src="/assets/shrimmer.png"  />
            </div>
            <div className ="full-image-card">
                <img className ="full-image-card-img" src="/assets/shrimmer.png"  />
            </div>
            <div className ="full-image-card">
                <img className ="full-image-card-img" src="/assets/shrimmer.png"  />
            </div>
            <div className ="full-image-card">
                <img className ="full-image-card-img" src="/assets/shrimmer.png"  />
            </div>
            <div className ="full-image-card">
                <img className ="full-image-card-img" src="/assets/shrimmer.png"  />
            </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection2;
