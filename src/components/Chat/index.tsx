import React, { useEffect, useState, useRef } from 'react';
import { streamText, type CoreMessage } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { Bubble, Sender, ThoughtChain } from '@ant-design/x';
import { UserOutlined, RobotOutlined, DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Space, Modal, Input, Form, message as antdMessage } from 'antd';
import ReactMarkdown from 'react-markdown';
import './styles.css';

const STORAGE_KEY = 'llm-chat-history';
const API_KEY_STORAGE_KEY = 'llm-chat-api-key';
const MODEL_STORAGE_KEY = 'llm-chat-model';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('deepseek-chat');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
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
        console.error('Failed to parse history', e);
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
    antdMessage.success('Settings saved');
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
      antdMessage.warning('Please set your API Key first');
      return;
    }

    const deepseek = createDeepSeek({
      apiKey: apiKey,
    });

    let newMessages = [...messages];
    if (!isRegenerate) {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content };
      newMessages.push(userMsg);
      setMessages(newMessages);
      setInput('');
    } else {
      // For regenerate, we assume the last message was assistant and we remove it, 
      // or if it was user, we just re-run.
      // If the last message is assistant, remove it to regenerate.
      if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
        newMessages.pop();
      }
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    const assistantMsgId = Date.now().toString();
    // Add a placeholder assistant message
    setMessages([...newMessages, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const coreMessages: CoreMessage[] = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      const result = streamText({
        model: deepseek(modelName),
        messages: coreMessages,
        abortSignal: abortControllerRef.current.signal,
      });

      let fullContent = '';
      for await (const textPart of result.textStream) {
        fullContent += textPart;
        // Use functional update to ensure we have latest state if needed, 
        // but here we just need to update the last message
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.findIndex(m => m.id === assistantMsgId);
          if (lastIndex !== -1) {
            updated[lastIndex] = { ...updated[lastIndex], content: fullContent };
          }
          return updated;
        });
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error);
        antdMessage.error('Failed to generate response: ' + error.message);
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
    const mainContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();

    return (
      <div>
        {thinkContent && (
          <ThoughtChain 
            items={[{ title: 'Thinking Process', content: thinkContent }]} 
            style={{ marginBottom: 12 }}
          />
        )}
        {mainContent && <ReactMarkdown>{mainContent}</ReactMarkdown>}
        {!thinkContent && !mainContent && content && <ReactMarkdown>{content}</ReactMarkdown>}
      </div>
    );
  };

  const items = messages.map((msg) => ({
    key: msg.id,
    loading: isLoading && msg.role === 'assistant' && msg.id === messages[messages.length - 1].id && !msg.content,
    role: msg.role,
    content: renderMessageContent(msg.content),
    avatar: msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />,
  }));

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <div style={{ fontWeight: 'bold', fontSize: 18 }}>LLM Chat</div>
        <Space>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setIsSettingsOpen(true)}
          >
            Settings
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={clearHistory}
            danger
            type="text"
          >
            Clear History
          </Button>
        </Space>
      </div>

      <div className="chat-content">
        <div className="chat-list-container">
          <Bubble.List 
            items={items} 
            role={{
              user: {
                placement: 'end',
                variant: 'shadow',
                style: { backgroundColor: 'var(--chat-primary-color)', color: '#fff' }
              },
              assistant: {
                placement: 'start',
                variant: 'outlined',
              }
            }}
          />
        </div>
      </div>

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
              ) : (
                messages.length > 0 && messages[messages.length - 1].role === 'assistant' ? (
                   <Button type="text" icon={<PlayCircleOutlined />} onClick={() => handleSend('', true)}>
                    Regenerate
                  </Button>
                ) : null
              )
            }
          />
        </div>
      </div>

      <Modal
        title="Settings"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={saveSettings}
          initialValues={{ apiKey, modelName }}
        >
          <Form.Item label="API Key" name="apiKey" rules={[{ required: true }]}>
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item label="Model Name" name="modelName">
            <Input placeholder="deepseek-chat" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Chat;
