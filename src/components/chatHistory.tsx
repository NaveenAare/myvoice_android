import React, { useEffect, useState } from 'react';
import './chatHistory.css';
import { IonIcon, IonItem } from '@ionic/react';
import { searchOutline, closeCircleOutline } from 'ionicons/icons';

const MenuCards: React.FC = () => {
    const [characters, setCharacters] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        updateHamCards();
    }, []);

    const handleCallClick = (chatId: number) => {
        // Navigate to the TalkingPage with chatId as a query parameter
        const url = `/talking?chatId=${chatId}` // Use navigate instead of history.push

        window.location.href = url;

    };

    async function updateHamCards() {
        try {
            const authToken = "eyJ1c2VySWQiOiAxLCAibWFpbCI6ICJhYXJlbmF2ZWVudmFybWFAZ21haWwuY29tIiwgIm5hbWUiOiAiTmF2ZWVuIHZhcm1hIEFhcmUiLCAicHJvZmlsZV9waWMiOiAiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSTZQa3BFSGJkdGZoQTFETFp5OHVCcnZrejRIaDhTVjhMQmtzajRYRjdTVlB2OEllRDU9czk2LWMifTAxODYzNTczMDA3ODJiMmRjOTFjZWNlZDBiZGM0OWNiMWNjZDZmODIzZDM2ZTcyMzY0N2EwZjIwZjVkZTgyOTc=";
            const formData = new FormData();
            formData.append('authToken', authToken || '');

            const response = await fetch('https://speakingcharacter.ai/user/history', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setCharacters(data); // Store the fetched characters
            renderCards(data); // Render cards with the fetched data
        } catch (error) {
            console.error('Error updating menu cards:', error);
        }
    }

    function renderCards(data: any[]) {
        const cardsContainer = document.getElementById('cards-container');
        if (!cardsContainer) return;
        cardsContainer.innerHTML = ''; // Clear existing content

        // If searchTerm is empty, show all characters
        const filteredData = searchTerm
            ? data.filter(character =>
                character.character_info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                character.character_info.summary2.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : data; // Show all characters if searchTerm is empty

        // Render the filtered data
        filteredData.forEach(character => {
            const menuCard = document.createElement('div');
            menuCard.classList.add('menu-card');

            const img = document.createElement('img');
            img.src = character.character_info.image_url || 'default-image.png';
            img.alt = character.character_info.name + ' Image';
            img.classList.add('card-image');

            const cardText = document.createElement('div');
            cardText.classList.add('card-text');

            const title = document.createElement('h4');
            const fullName = character.character_info.name;
            title.textContent = fullName.length > 30 ? fullName.substring(0, 30) + '...' : fullName;

            const description = document.createElement('p');
            const fullDescription = character.character_info.summary2;
            description.textContent = fullDescription.length > 30 ? fullDescription.substring(0, 35) + '...' : fullDescription;

           // const deleteButton = document.createElement('button');
            //deleteButton.classList.add('delete-button');
            //deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';

            const callButton = document.createElement('button');
            callButton.classList.add('call-button');
            callButton.innerHTML = '<i class="fas fa-phone-alt"></i>';

           // deleteButton.addEventListener('click', (e) => {
                   // e.stopPropagation();
                    //showDeletePopup(character);
               // });

            callButton.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Calling ${character.character_info.name}`);
            });

            menuCard.addEventListener('click', () => {
                const url = character.charc_id.includes('PREMIUM')
                    ? `/character-chat/${character.charc_id}`
                    : `/character-chat/${character.charc_id}`;
                window.location.href = url;
            });

            cardText.appendChild(title);
            cardText.appendChild(description);
            menuCard.appendChild(img);
            menuCard.appendChild(cardText);
           // menuCard.appendChild(deleteButton);
            menuCard.appendChild(callButton);

            callButton.addEventListener('click', () => {
                const url = `/talking/${character.charc_id}` 
                window.location.href = url;
            });


            cardsContainer.appendChild(menuCard);
        });
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        renderCards(characters); // Re-render cards with the updated search term
    };

    const clearSearch = () => {
        setSearchTerm(''); // Clear the search term
        renderCards(characters); // Re-render cards with the full list of characters

        setSearchTerm(''); // Clear the search term
        renderCards(characters);
    };

    return (
        <div className="menu-cards">
            <div className="search-icon-container-history">
                <IonIcon icon={searchOutline} className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search characters..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                
            </div>
            <hr style={{ border: '1px solid #ccc', width: '80%' }} />
            <div id="cards-container" className="cards-container">
            <div className="shimmer-card">
                    <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>
                    <div className="shimmer-card">
                        <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>
                    <div className="shimmer-card">
                        <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>

                    <div className="shimmer-card">
                        <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>
                    <div className="shimmer-card">
                        <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>

                    <div className="shimmer-card">
                        <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>
                    <div className="shimmer-card">
                        <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>

                    <div className="shimmer-card">
                        <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>
                    <div className="shimmer-card">
                        <div className="shimmer-image shimmer"></div>
                        <div className="shimmer-content">
                            <div className="shimmer-title shimmer"></div>
                            <div className="shimmer-text shimmer"></div>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default MenuCards;

