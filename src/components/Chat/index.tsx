import React, { useEffect, useState, useRef } from "react";
import { streamText, type CoreMessage } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { Bubble, ThoughtChain } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { message as antdMessage } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Components
import { ChatHeader } from "../chat-header";
import { ChatFooter } from "../chat-footer";
import { Settings } from "../settings";

import "./index.css";

const STORAGE_KEY = "llm-chat-history";
const API_KEY_STORAGE_KEY = "llm-chat-api-key";
const MODEL_STORAGE_KEY = "llm-chat-model";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Chat: React.FC = () => {
  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("deepseek-chat");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load settings and history
  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    const storedHistory = localStorage.getItem(STORAGE_KEY);

    if (storedApiKey) setApiKey(storedApiKey);
    if (storedModel) setModelName(storedModel);
    if (storedHistory) {
      try {
        setMessages(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // TODO 后端持久化聊天记录
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [messages]);

  const saveSettings = (values: any) => {
    setApiKey(values.apiKey);
    setModelName(values.modelName);
    localStorage.setItem(API_KEY_STORAGE_KEY, values.apiKey);
    localStorage.setItem(MODEL_STORAGE_KEY, values.modelName);
    setIsSettingsOpen(false);
    antdMessage.success("Settings saved");
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSend = async (content: string, isRegenerate = false) => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      antdMessage.warning("Please set your API Key first");
      return;
    }

    const deepseek = createDeepSeek({
      apiKey: apiKey,
      baseURL: "https://api.deepseek.com",
    });

    let newMessages = [...messages];
    if (!isRegenerate) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
      };
      newMessages.push(userMsg);
      setMessages(newMessages);
      setInput("");
    } else {
      newMessages.length > 0 && newMessages.pop();
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    const assistantMsgId = Date.now().toString();
    newMessages.push({
      id: assistantMsgId,
      role: "assistant",
      content: "",
    });

    try {
      const coreMessages: CoreMessage[] = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = streamText({
        model: deepseek(modelName),
        messages: coreMessages,
        abortSignal: abortControllerRef.current.signal,
      });

      let fullContent = "";
      for await (const textPart of result.textStream) {
        fullContent += textPart;
        const updated = [...newMessages];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: fullContent,
        };

        setMessages(updated);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Chat error:", error);
        antdMessage.error("Failed to generate response: " + error.message);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const renderMessageContent = (content: string) => {
    // Simple parser to extract <think> blocks
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    const thinkContent = thinkMatch ? thinkMatch[1] : null;
    const mainContent = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();

    return (
      <div>
        {thinkContent && (
          <ThoughtChain
            items={[{ title: "Thinking Process", content: thinkContent }]}
            style={{ marginBottom: 12 }}
          />
        )}
        {mainContent && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {mainContent}
          </ReactMarkdown>
        )}
        {!thinkContent && !mainContent && content && (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    );
  };

  const items = messages.map((msg) => ({
    key: msg.id,
    loading:
      isLoading &&
      msg.role === "assistant" &&
      msg.id === messages[messages.length - 1].id &&
      !msg.content,
    role: msg.role,
    content: renderMessageContent(msg.content),
    avatar: msg.role === "user" ? <UserOutlined /> : <RobotOutlined />,
  }));

  return (
    <div className="chat-layout">
      <ChatHeader
        onClearHistory={clearHistory}
        onOpenSettings={() => {
          setIsSettingsOpen(true);
        }}
      />

      <div className="chat-content">
        <div className="chat-list-container">
          <Bubble.List
            items={items}
            role={{
              user: {
                placement: "end",
                variant: "filled",
                style: {
                  backgroundColor: "#fff",
                  color: "#000",
                },
              },
              assistant: {
                placement: "start",
                variant: "shadow",
                style: {
                  backgroundColor: "#fff",
                  color: "#000",
                },
              },
            }}
          />
        </div>
      </div>

      <ChatFooter
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        handleSend={handleSend}
        stop={stop}
        messages={messages}
      />

      <Settings
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        apiKey={apiKey}
        modelName={modelName}
        saveSettings={saveSettings}
      />
    </div>
  );
};

export default Chat;
