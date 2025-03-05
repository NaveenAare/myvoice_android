import React from 'react';
import './CharacterInfoModal.css';

interface CharacterInfoModalProps {
  characterImage: string;
  characterName: string;
  characterBio: string;
  welcomeMessage: string;
  onAddToGroup: () => void;
  onDeleteChat: () => void;
  onClose: () => void;
}

const CharacterInfoModal: React.FC<CharacterInfoModalProps> = ({
  characterImage,
  characterName,
  characterBio,
  welcomeMessage,
  onAddToGroup,
  onDeleteChat,
  onClose,
}) => {


  return (
    <div className="character-info-overlay">
      <div className="character-info-modal">
        {/* Header with close button */}
        <div className="character-info-header">
          <button className="close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Character Image */}
        <div className="character-image-container">
          <div 
            className="character-image"
            style={{ backgroundImage: `url(${characterImage})` }}
            role="img"
            aria-label={`${characterName}'s profile picture`}
          />
        </div>

        {/* Character Info */}
        <div className="character-info-content">
          <h2 className="character-name">{characterName}</h2>
          <div className="welcome-message">
            <p>{welcomeMessage}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="add-to-group-button"
            onClick={onAddToGroup}
          >
            Add to Group
          </button>
          <button 
            className="delete-chat-button"
            onClick={onDeleteChat}
          >
            Delete Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterInfoModal;