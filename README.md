# LLM-CHAT

A modern, responsive chat web application built with React and rsbuild for interacting with Large Language Models (LLMs).

## Features

- 🚀 Fast and modern development experience with rsbuild
- ⚛️ Built with React 19
- 💬 Clean and intuitive chat interface
- 📱 Responsive design that works on all devices
- 🎨 Beautiful gradient UI with smooth animations
- ⌨️ Support for Enter key to send messages
- 🔄 Auto-scroll to latest messages
- ⏳ Loading indicators for pending responses

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GRAMMAC1/LLM-CHAT.git
cd LLM-CHAT
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run preview` - Preview the production build locally

## Project Structure

```
LLM-CHAT/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── ChatContainer.jsx    # Main chat container component
│   │   ├── MessageList.jsx      # Message list component
│   │   ├── Message.jsx          # Individual message component
│   │   ├── MessageInput.jsx     # Message input component
│   │   └── *.css               # Component styles
│   ├── App.jsx             # Main application component
│   ├── App.css             # Application styles
│   ├── index.jsx           # Application entry point
│   └── index.css           # Global styles
├── rsbuild.config.js       # rsbuild configuration
└── package.json            # Project dependencies and scripts
```

## Customization

### Connecting to an LLM API

The current implementation includes a simulated response. To connect to a real LLM API (like OpenAI, Anthropic, etc.):

1. Update the `handleSendMessage` function in `src/components/ChatContainer.jsx`
2. Replace the `setTimeout` simulation with an actual API call
3. Add your API key (use environment variables for security)

Example:
```javascript
const handleSendMessage = async (text) => {
  const userMessage = { /* ... */ };
  setMessages(prev => [...prev, userMessage]);
  setIsLoading(true);

  try {
    const response = await fetch('YOUR_LLM_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({ message: text })
    });
    
    const data = await response.json();
    const botMessage = { /* ... use data.response ... */ };
    setMessages(prev => [...prev, botMessage]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Technologies Used

- **React 19** - UI library
- **rsbuild** - Fast build tool powered by Rspack
- **CSS3** - Styling with modern features including gradients and animations

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.