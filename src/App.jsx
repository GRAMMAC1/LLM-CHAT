import React from 'react';
import ChatContainer from './components/ChatContainer';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>LLM Chat</h1>
      </header>
      <ChatContainer />
    </div>
  );
}

export default App;
