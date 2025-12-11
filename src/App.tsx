import { ConfigProvider } from 'antd';
import { Chat } from './components/chat-container';

// Styles
import './App.css';

const App = () => {
  return (
    <ConfigProvider>
      <Chat />
    </ConfigProvider>
  );
};

export default App;
