import { ConfigProvider } from 'antd';
import Chat from './components/Chat';
import './App.css';

const App = () => {
  return (
    <ConfigProvider>
      <Chat />
    </ConfigProvider>
  );
};

export default App;
