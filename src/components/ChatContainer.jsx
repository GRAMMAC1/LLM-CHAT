import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatContainer.css';

function ChatContainer() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text) => {
    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate LLM response (in a real app, this would be an API call)
    setTimeout(() => {
      const botMessage = {
        id: crypto.randomUUID(),
        text: `I received your message: "${text}". This is a demo response. In a production app, this would connect to an actual LLM API like OpenAI, Anthropic, or others.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="chat-container">
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}

export default ChatContainer;
