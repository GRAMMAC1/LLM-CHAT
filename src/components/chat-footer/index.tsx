import { Sender } from "@ant-design/x";
import { Button } from "antd";
import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";

// Styles
import "./index.css";

type ChatFooterProps = {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSend: (message: string, isRegenerate?: boolean) => void;
  stop: () => void;
  messages: { role: string }[];
};

export const ChatFooter: React.FC<ChatFooterProps> = ({
  input,
  setInput,
  isLoading,
  handleSend,
  stop,
  messages,
}) => {
  return (
    <div className="chat-footer">
      <div className="chat-input-container">
        <Sender
          value={input}
          onChange={setInput}
          onSubmit={() => {
            if (!input.trim()) return;
            handleSend(input);
          }}
          loading={isLoading}
          onCancel={stop}
          placeholder="Type a message..."
          header={
            isLoading ? (
              <Button type="text" icon={<PauseCircleOutlined />} onClick={stop}>
                Stop
              </Button>
            ) : messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" ? (
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleSend("", true)}
              >
                Regenerate
              </Button>
            ) : null
          }
        />
      </div>
    </div>
  );
};
