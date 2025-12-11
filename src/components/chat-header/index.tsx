import { Space, Button } from 'antd';
import { SettingOutlined, DeleteOutlined } from '@ant-design/icons';

// Styles
import './index.css';

type ChatHeaderProps = {
  onOpenSettings: () => void;
  onClearHistory: () => void;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenSettings,
  onClearHistory,
}: ChatHeaderProps) => {
  return (
    <div className="chat-header">
      <div style={{ fontWeight: "bold", fontSize: 18 }}>LLM Chat</div>
      <Space>
        <Button
          icon={<SettingOutlined />}
          onClick={onOpenSettings}
        >
          Settings
        </Button>
        <Button
          icon={<DeleteOutlined />}
          onClick={onClearHistory}
          danger
          type="text"
        >
          Clear History
        </Button>
      </Space>
    </div>
  );
};
