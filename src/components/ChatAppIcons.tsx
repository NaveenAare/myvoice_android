import React from 'react';
import './ChatAppIcons.css'; // Import CSS for styling

const ChatAppIcons: React.FC = () => {
  const apps = [
    { name: 'WhatsApp', icon: '/assets/icons/whatsapp-icon.png' },
    { name: 'Instagram', icon: '/assets/icons/instagram-icon.png' },
    { name: 'Snapchat', icon: 'path/to/snapchat-icon.png' },
    // Add more apps as needed
  ];

  return (
    <div className="chat-app-icons">
      {apps.map((app) => (
        <img key={app.name} src={app.icon} alt={app.name} className="chat-icon" />
      ))}
    </div>
  );
};

export default ChatAppIcons; 