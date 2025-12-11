import { useState } from "react";
import { Modal, Form, Input, Button, Select } from "antd";

type SettingsProps = {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  apiKey: string;
  saveSettings: (values: { apiKey: string; modelName: string }) => void;
  modelName: string;
  setDeepThink: (value: boolean) => void;
};

export const Settings: React.FC<SettingsProps> = ({
  isSettingsOpen,
  setIsSettingsOpen,
  apiKey,
  saveSettings,
  modelName,
  setDeepThink,
}: SettingsProps) => {
  const [name, setName] = useState(modelName);
  const [form] = Form.useForm();

  const handleModelSelect = (value: string) => {
    form.setFieldValue("modelName", value);
    setName(value);
    if (value !== "deepseek-chat") setDeepThink(false);
    form.setFieldValue("apiKey", "");
  };

  return (
    <Modal
      title="Settings"
      open={isSettingsOpen}
      onCancel={() => setIsSettingsOpen(false)}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={saveSettings}
        initialValues={{ apiKey, modelName }}
      >
        <Form.Item label="API Key" name="apiKey" rules={[{ required: true }]}>
          {name === "GPT-5 mini" ? (
            <Input.Password placeholder="Please enter your API key." />
          ) : (
            <Input.Password disabled placeholder="已内置" />
          )}
        </Form.Item>
        <Form.Item label="Model Name" name="modelName">
          <Select onSelect={handleModelSelect}>
            <Select.Option value="deepseek-chat">deepseek</Select.Option>
            <Select.Option value="GPT-5 mini">GPT-5 mini</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
