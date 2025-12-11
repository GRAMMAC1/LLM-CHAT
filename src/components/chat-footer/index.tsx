import { useMemo } from "react";
import { Sender } from "@ant-design/x";
import { Button } from "antd";
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  OpenAIOutlined,
} from "@ant-design/icons";

// Styles
import "./index.css";

type ChatFooterProps = {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSend: (message: string, isRegenerate?: boolean) => void;
  stop: () => void;
  messages: { role: string }[];
  modelName: string;
  deepThink: boolean;
  setDeepThink: (value: boolean) => void;
};

const SwitchTextStyle = {
  display: "inline-flex",
  width: 28,
  justifyContent: "center",
  alignItems: "center",
};

const Switch = Sender.Switch;

export const ChatFooter: React.FC<ChatFooterProps> = ({
  input,
  setInput,
  isLoading,
  handleSend,
  stop,
  messages,
  modelName,
  deepThink,
  setDeepThink,
}) => {
  const footer = useMemo(() => {
    return (
      <Switch
        disabled={modelName !== "deepseek-chat"}
        value={deepThink}
        checkedChildren={
          <div>
            深度思考:<span style={SwitchTextStyle}>开启</span>
          </div>
        }
        unCheckedChildren={
          <div>
            深度思考:<span style={SwitchTextStyle}>关闭</span>
          </div>
        }
        onChange={(checked: boolean) => {
          setDeepThink(checked);
        }}
        icon={<OpenAIOutlined />}
      />
    );
  }, [deepThink, setDeepThink, modelName]);

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
          footer={footer}
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
