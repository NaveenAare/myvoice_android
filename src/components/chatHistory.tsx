import React, { useEffect, useState, useRef } from 'react';
import './chatHistory.scss';
import { IonIcon, IonItem, useIonRouter } from '@ionic/react';
import { searchOutline, closeCircleOutline } from 'ionicons/icons';
import ChatAppIcons from '../components/ChatAppIcons'; // Import the new component


const MenuCards: React.FC = () => {
    const [characters, setCharacters] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
 const router = useIonRouter();
const emojis: string[] = ["All", "Unread", "Groups"]; // Emoji list
const whatsappFilters: string[] = ["All", "UnRead"]; // Emoji list
  // Don't set initial state
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [activeFilterForWhatsApp, setActiveFilterForWhatsApp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize on mount
  useEffect(() => {
    setActiveFilter(emojis[0]);
  }, []);


  useEffect(() => {
    setActiveFilterForWhatsApp(whatsappFilters[0]);
  }, []);
 
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
            const authToken = localStorage.getItem('authToken') || '';
            const formData = new FormData();
            formData.append('authToken', authToken || '');

            const response = await fetch('https://speakingcharacter.ai/user/history/mobile', {
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

    const renderCards = (data: any[]) => {
        const cardsContainer = document.getElementById('cards-container');
        if (!cardsContainer) return;
        cardsContainer.innerHTML = ''; // Clear existing content

        // Check if the data array is empty
        if (data.length === 0) {
            const emptyCard = document.createElement('div');
            emptyCard.classList.add('menu-card-1'); // Use the same class as existing cards

            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message'; // Add a class for styling
            emptyMessage.textContent = 'No characters available'; // Message to display

            emptyCard.appendChild(emptyMessage); // Append the message to the card
            cardsContainer.appendChild(emptyCard); // Append the card to the container
            return; // Exit the function early
        }

        // Group characters by message_time_period
        const groupedCharacters: { [key: string]: any[] } = {};
        data.forEach(character => {
            const period = character.message_time_period || 'Unknown'; // Default to 'Unknown' if not defined
            if (!groupedCharacters[period]) {
                groupedCharacters[period] = [];
            }
            groupedCharacters[period].push(character);
        });

        // Render the grouped data
        const uniquePeriods = Object.keys(groupedCharacters);
        uniquePeriods.forEach(period => {
            // Create a heading for the time period
            const periodHeading = document.createElement('h6');
            periodHeading.textContent = period; // Set the heading text
            cardsContainer.appendChild(periodHeading); // Append heading to the container

            // Render characters for this period
            groupedCharacters[period].forEach(character => {
                const menuCard = document.createElement('div');
                menuCard.classList.add('menu-card-1');

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

                // Create notification badge for unseen messages
                const notificationContainer = document.createElement('div');
                notificationContainer.classList.add('notification-container');

                const notificationBadge = document.createElement('span');
                notificationBadge.classList.add('notification-badge');
                const unseenCount = character.unseen_messages_count; // Assuming this is part of the character object
                if (unseenCount > 0) {
                    notificationBadge.textContent = unseenCount.toString();
                } else {
                    notificationBadge.style.display = 'none'; // Hide if zero
                }

                notificationContainer.appendChild(notificationBadge); // Append badge to the container

                menuCard.addEventListener('click', () => {
                    if(character.chat_category == 'character_chat'){
                        router.push(`/character-chat/${character.charc_id}`, 'forward', 'push');
                    } else{
                        router.push(`/group-chat/${character.group_id}`, 'forward', 'push');
                    }
                    
                });
                cardText.appendChild(title);
                cardText.appendChild(description);
                menuCard.appendChild(img);
                menuCard.appendChild(cardText);
                menuCard.appendChild(notificationContainer); // Add the container to the card

                cardsContainer.appendChild(menuCard); // Append the card to the container
            });
        });
    };

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

    const handleFilterChange = (emoji: string) => {
        setActiveFilter(emoji); // Update the active filter

        // Filter the original characters data based on the new filter
        const filteredCharacters = characters.filter(character => {
            // Check for active filter match
            if (emoji === 'Unread') {
                return character.unseen_messages_count > 0; // Show only characters with unseen messages
            } else if (emoji === 'Groups') {
                return character.chat_category == 'group'; // Assuming there's a property to identify group characters
            } else if (emoji === 'Popular') {
                return character.isPopular; // Assuming there's a property to identify popular characters
            } else if (emoji === 'All') {
                return true; // Show all characters for 'All' filter
            }
            return true; // Default case, show all characters
        });

        // Call renderCards with the filtered characters
        renderCards(filteredCharacters); // Re-render cards with the filtered characters
    };

    const handleFilterChange2 = (emoji: string) => {
        setActiveFilterForWhatsApp(emoji);
    };

    useEffect(() => {
        if (loading && videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Error playing video:", error);
            });
        }
    }, [loading]);

    return (
        <div className={`menu-cards ${activeFilter === 'WhatsApp' ? 'whatsapp-ui whatsapp-menu-cards' : ''}`}>
            {loading && (
                <div className="loading">
                <div className="loading-text">
                    <span className="loading-text-words">L</span>
                    <span className="loading-text-words">O</span>
                    <span className="loading-text-words">A</span>
                    <span className="loading-text-words">D</span>
                    <span className="loading-text-words">I</span>
                    <span className="loading-text-words">N</span>
                    <span className="loading-text-words">G</span>
                </div>
            </div>
            )}


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


             <div className="emoji-filter-wrapper">
                <div className="unique-filter-container-emoji">
                    {emojis.map((emoji, index) => (
                        <button
                            key={`emoji-${index}`}
                            className={`unique-filter-button-emoji ${activeFilter === emoji ? 'active' : ''}`}
                            onClick={() => handleFilterChange(emoji)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            

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

