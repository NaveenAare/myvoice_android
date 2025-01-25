import React, { useState } from 'react';
import { IonContent, IonPage, IonIcon, IonSearchbar } from '@ionic/react';
import { 
  searchOutline, 
  ellipsisVertical, 
  attachOutline, 
  sendOutline, 
  micOutline,
  imageOutline,
  documentOutline,
  cameraOutline
} from 'ionicons/icons';
import './ChatPage.css';
import { IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';





const ChatPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  return (
    <IonPage>
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-left">
            <img src="https://via.placeholder.com/40" alt="Profile" className="profile-pic" />
            <div className="header-info">
              <h2>Chat Name</h2>
              <p>online</p>
            </div>
          </div>
          <div className="header-actions">
            <button><IonIcon icon={searchOutline} /></button>
            <button><IonIcon icon={ellipsisVertical} /></button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="messages-container">
          {/* Sample messages */}
          <div className="message received">
            <p>Hello! How are you?</p>
            <span className="time">10:30 AM</span>
          </div>
          <div className="message sent">
            <p>I'm good, thanks! How about you?</p>
            <span className="time">10:31 AM</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <button 
              className="attach-button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
            >
              <IonIcon icon={attachOutline} />
            </button>
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="send-button">
              {message ? (
                <IonIcon icon={sendOutline} />
              ) : (
                <IonIcon icon={micOutline} />
              )}
            </button>
          </div>

          {/* Attachment Menu */}
          {showAttachMenu && (
            <div className="attach-menu">
              <button className="attach-option">
                <IonIcon icon={imageOutline} />
                <span>Image</span>
              </button>
              <button className="attach-option">
                <IonIcon icon={documentOutline} />
                <span>Document</span>
              </button>
              <button className="attach-option">
                <IonIcon icon={cameraOutline} />
                <span>Camera</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </IonPage>
  );
};

export default ChatPage; 