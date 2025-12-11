import React from 'react';
import './Message.css';

function Message({ message }) {
  const { text, sender, timestamp } = message;
  
  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`message ${sender}`}>
      <div className="message-content">
        <div className="message-text">{text}</div>
        <div className="message-time">{formattedTime}</div>
      </div>
    </div>
  );
}

export default Message;
