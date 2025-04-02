import React, { useState, useEffect } from 'react';
import './group_section.css'; // Import CSS styles
import { useIonRouter } from '@ionic/react';


const GroupSection: React.FC = () => {
  const emojis: string[] = ["latest"]; // Emoji list
  // Don't set initial state
  const [activeFilter, setActiveFilter] = useState<string>('');
  const router = useIonRouter();

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
        const response = await fetch('https://speakingcharacter.ai/get/public/groups', {
          method: 'GET',
        });
        const dataFull = await response.json();
        
        const movingCardsWrapper = document.querySelector('.moving-cards-wrapper-group') as HTMLElement;
        if (!movingCardsWrapper) return;

        movingCardsWrapper.innerHTML = '';

        if (dataFull.is_emoji === 'true') {
          const emojiHead = document.getElementById('emoji-head');
          if (emojiHead) emojiHead.textContent = dataFull.sectionName;
        }

        dataFull.data.forEach((character: any) => {
          // Create the card elements
          const cardDiv = document.createElement('div');
          cardDiv.classList.add('moving-card-group');

          // Set the cursor to hand on hover
          cardDiv.style.cursor = 'pointer'; // Alternatively, this can be set in CSS

          // Create a container for the images
          const imageContainer = document.createElement('div');
          imageContainer.classList.add('group-card-container');

          // Create three image elements for the card
          const imgLeft = document.createElement('img');
          imgLeft.classList.add('group-card-image', 'left-card');
          imgLeft.src = character.image_url_3; // Assuming API returns an 'imageUrl' field
          imgLeft.alt = character.name;

          const imgCenter = document.createElement('img');
          imgCenter.classList.add('group-card-image', 'center-card');
          imgCenter.src = character.image_url_1; // Assuming API returns an 'imageUrl' field
          imgCenter.alt = character.name;

          const imgRight = document.createElement('img');
          imgRight.classList.add('group-card-image', 'right-card');
          imgRight.src = character.image_url_2; // Assuming API returns an 'imageUrl' field
          imgRight.alt = character.name;

          // Append images to the image container
          imageContainer.appendChild(imgLeft);
          imageContainer.appendChild(imgCenter);
          imageContainer.appendChild(imgRight);

          // Append the image container to the card
          cardDiv.appendChild(imageContainer);
          
          // Inside the fetchData function, after appending the image container
          const title = document.createElement('h3');
          title.classList.add('group-card-title'); // Add a class for styling
          title.textContent = character.name; // Set the title text to the character's name

          // Append the title to the card after the image container
          cardDiv.appendChild(title);


          const groupContainer = document.createElement('div');
            groupContainer.classList.add('group-container'); // Add a class for styling

            const groupIcon = document.createElement('img');
            groupIcon.src = 'assets/group_png.png'; // Replace with your icon path
            groupIcon.alt = 'Group Icon';
            groupIcon.classList.add('group-icon-2'); // Add a class for styling

            const groupNumbers = document.createElement('h3');
            groupNumbers.classList.add('group-card-sub-title');
            groupNumbers.textContent = character.summary2;

            // Append icon and text to the container
            groupContainer.appendChild(groupIcon);
            groupContainer.appendChild(groupNumbers);

            // Append the container to the card
            cardDiv.appendChild(groupContainer);


          // Add click event listener to redirect on card click
          cardDiv.addEventListener('click', () => {
            router.push(`/group-chat/${character.code}`, 'forward', 'push');
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

      <div className="moving-section-your-char-latest">
        <h2 id="emoji-head">Latest Groups</h2>
        <div className="moving-cards-wrapper-group">
          {/* Skeleton card elements */}
          <div className="moving-card-group">
            <img className="moving-card-img-group" src="assets/shrimmer.png" alt="Loading..." />
            <div className="moving-card-info">
              <h3 className="moving-card-info-h3"></h3>
              <p className="moving-card-info-p"></p>
              <h4 className="moving-card-info-h4"></h4>
            </div>
          </div>


          <div className="moving-card-group">
            <img className="moving-card-img-group" src="assets/shrimmer.png" alt="Loading..." />
            <div className="moving-card-info">
              <h3 className="moving-card-info-h3"></h3>
              <p className="moving-card-info-p"></p>
              <h4 className="moving-card-info-h4"></h4>
            </div>
          </div>


          <div className="moving-card-group">
            <img className="moving-card-img-group" src="assets/shrimmer.png" alt="Loading..." />
            <div className="moving-card-info">
              <h3 className="moving-card-info-h3"></h3>
              <p className="moving-card-info-p"></p>
              <h4 className="moving-card-info-h4"></h4>
            </div>
          </div>
        </div>
      </div>
  );
};

export default GroupSection;
