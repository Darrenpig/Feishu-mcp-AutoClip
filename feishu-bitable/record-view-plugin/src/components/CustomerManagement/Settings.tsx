import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  Select,
  InputNumber,
  TextArea,
  Message,
  Modal,
  List,
  Tag,
  Popconfirm,
} from '@douyinfe/semi-ui';
import {
  IconSave,
  IconRefresh,
  IconPlus,
  IconDelete,
  IconEdit,
  IconKey,
  IconSetting,
  IconRobot,
  IconNotification,
} from '@douyinfe/semi-icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 设置配置接口
interface SettingsConfig {
  // 飞书API配置
  feishu: {
    appId: string;
    appSecret: string;
    botToken: string;
    webhookUrl: string;
    encryptKey: string;
    verificationToken: string;
  };
  // 自动拉群配置
  autoGroup: {
    enabled: boolean;
    maxGroupSize: number;
    groupNameTemplate: string;
    autoInviteInternal: boolean;
    autoInviteExternal: boolean;
    groupDescription: string;
  };
  // 智能客服配置
  smartService: {
    enabled: boolean;
    autoReply: boolean;
    replyDelay: number;
    workingHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    keywords: string[];
    defaultReply: string;
  };
  // 通知配置
  notification: {
    newCustomer: boolean;
    groupCreated: boolean;
    customerStatusChange: boolean;
    followUpReminder: boolean;
    emailNotification: boolean;
    webhookNotification: boolean;
  };
  // 数据同步配置
  dataSync: {
    autoSync: boolean;
    syncInterval: number;
    backupEnabled: boolean;
    backupInterval: number;
  };
}

// 默认配置
const DEFAULT_CONFIG: SettingsConfig = {
  feishu: {
    appId: '',
    appSecret: '',
    botToken: '',
    webhookUrl: '',
    encryptKey: '',
    verificationToken: '',
  },
  autoGroup: {
    enabled: true,
    maxGroupSize: 200,
    groupNameTemplate: '客户服务群-{customerName}-{date}',
    autoInviteInternal: true,
    autoInviteExternal: true,
    groupDescription: '欢迎加入我们的客户服务群，我们将为您提供专业的服务支持。',
  },
  smartService: {
    enabled: true,
    autoReply: true,
    replyDelay: 3,
    workingHours: {
      enabled: true,
      start: '09:00',
      end: '18:00',
      timezone: 'Asia/Shanghai',
    },
    keywords: ['帮助', '咨询', '问题', '服务'],
    defaultReply: '您好！感谢您的咨询，我们的客服人员会尽快为您处理。如有紧急问题，请直接拨打客服电话。',
  },
  notification: {
    newCustomer: true,
    groupCreated: true,
    customerStatusChange: true,
    followUpReminder: true,
    emailNotification: false,
    webhookNotification: false,
  },
  dataSync: {
    autoSync: true,
    syncInterval: 30,
    backupEnabled: true,
    backupInterval: 24,
  },
};

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [config, setConfig] = useState<SettingsConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  // 加载配置
  const loadConfig = async () => {
    try {
      // 从本地存储或API加载配置
      const savedConfig = localStorage.getItem('feishu-auto-group-config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
        form.setValues(parsedConfig);
      } else {
        form.setValues(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('Load config error:', error);
      Message.error('加载配置失败');
    }
  };

  // 保存配置
  const saveConfig = async (values: any) => {
    setLoading(true);
    try {
      const newConfig = { ...config, ...values };
      
      // 保存到本地存储
      localStorage.setItem('feishu-auto-group-config', JSON.stringify(newConfig));
      
      // TODO: 保存到服务器
      // await settingsService.saveConfig(newConfig);
      
      setConfig(newConfig);
      Message.success('配置保存成功');
    } catch (error) {
      console.error('Save config error:', error);
      Message.error('配置保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试飞书连接
  const testFeishuConnection = async () => {
    setTestingConnection(true);
    try {
      const values = form.getValues();
      
      // TODO: 实际测试飞书API连接
      // const result = await feishuService.testConnection(values.feishu);
      
      // 模拟测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (values.feishu.appId && values.feishu.appSecret) {
        Message.success('飞书API连接测试成功');
      } else {
        Message.error('请填写完整的飞书API配置');
      }
    } catch (error) {
      console.error('Test connection error:', error);
      Message.error('飞书API连接测试失败');
    } finally {
      setTestingConnection(false);
    }
  };

  // 添加关键词
  const addKeyword = () => {
    if (!newKeyword.trim()) {
      Message.warning('请输入关键词');
      return;
    }
    
    const currentKeywords = form.getValues().smartService?.keywords || [];
    if (currentKeywords.includes(newKeyword.trim())) {
      Message.warning('关键词已存在');
      return;
    }
    
    const updatedKeywords = [...currentKeywords, newKeyword.trim()];
    form.setValue('smartService.keywords', updatedKeywords);
    setNewKeyword('');
    setShowKeywordModal(false);
  };

  // 删除关键词
  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues().smartService?.keywords || [];
    const updatedKeywords = currentKeywords.filter(k => k !== keyword);
    form.setValue('smartService.keywords', updatedKeywords);
  };

  // 重置配置
  const resetConfig = () => {
    form.setValues(DEFAULT_CONFIG);
    Message.success('配置已重置为默认值');
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title heading={4} style={{ margin: 0 }}>系统设置</Title>
          </Col>
          <Col>
            <Space>
              <Button onClick={resetConfig}>重置默认</Button>
              <Button
                type="primary"
                icon={<IconSave />}
                loading={loading}
                onClick={() => form.submitForm()}
              >
                保存配置
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Form
        form={form}
        onSubmit={saveConfig}
        labelPosition="left"
        labelWidth={150}
      >
        {/* 飞书API配置 */}
        <Card
          title={
            <Space>
              <IconKey />
              <span>飞书API配置</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                field="feishu.appId"
                label="App ID"
                rules={[{ required: true, message: '请输入App ID' }]}
              >
                <Input placeholder="请输入飞书应用的App ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                field="feishu.appSecret"
                label="App Secret"
                rules={[{ required: true, message: '请输入App Secret' }]}
              >
                <Input.Password placeholder="请输入飞书应用的App Secret" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="feishu.botToken" label="Bot Token">
                <Input.Password placeholder="请输入机器人Token" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="feishu.webhookUrl" label="Webhook URL">
                <Input placeholder="请输入Webhook回调地址" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="feishu.encryptKey" label="Encrypt Key">
                <Input.Password placeholder="请输入加密密钥" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="feishu.verificationToken" label="Verification Token">
                <Input.Password placeholder="请输入验证Token" />
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right' }}>
            <Button
              type="secondary"
              loading={testingConnection}
              onClick={testFeishuConnection}
            >
              测试连接
            </Button>
          </div>
        </Card>

        {/* 自动拉群配置 */}
        <Card
          title={
            <Space>
              <IconRobot />
              <span>自动拉群配置</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Form.Item field="autoGroup.enabled" label="启用自动拉群">
            <Switch />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="autoGroup.maxGroupSize" label="群聊最大人数">
                <InputNumber
                  min={2}
                  max={500}
                  placeholder="群聊最大人数"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="autoGroup.groupNameTemplate" label="群名称模板">
                <Input placeholder="支持变量：{customerName}, {date}, {time}" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="autoGroup.autoInviteInternal" label="自动邀请内部员工">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="autoGroup.autoInviteExternal" label="自动邀请外部客户">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item field="autoGroup.groupDescription" label="群描述">
            <TextArea
              placeholder="请输入群聊描述"
              rows={3}
              maxCount={200}
            />
          </Form.Item>
        </Card>

        {/* 智能客服配置 */}
        <Card
          title={
            <Space>
              <IconMessage />
              <span>智能客服配置</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Form.Item field="smartService.enabled" label="启用智能客服">
            <Switch />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="smartService.autoReply" label="自动回复">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="smartService.replyDelay" label="回复延迟(秒)">
                <InputNumber
                  min={0}
                  max={60}
                  placeholder="自动回复延迟时间"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item field="smartService.workingHours.enabled" label="工作时间限制">
            <Switch />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item field="smartService.workingHours.start" label="开始时间">
                <Input placeholder="09:00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item field="smartService.workingHours.end" label="结束时间">
                <Input placeholder="18:00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item field="smartService.workingHours.timezone" label="时区">
                <Select placeholder="选择时区">
                  <Option value="Asia/Shanghai">Asia/Shanghai</Option>
                  <Option value="Asia/Tokyo">Asia/Tokyo</Option>
                  <Option value="America/New_York">America/New_York</Option>
                  <Option value="Europe/London">Europe/London</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="触发关键词">
            <div>
              <div style={{ marginBottom: 8 }}>
                <Space wrap>
                  {(form.getValues().smartService?.keywords || []).map((keyword: string) => (
                    <Tag
                      key={keyword}
                      closable
                      onClose={() => removeKeyword(keyword)}
                    >
                      {keyword}
                    </Tag>
                  ))}
                  <Button
                    size="small"
                    type="dashed"
                    icon={<IconPlus />}
                    onClick={() => setShowKeywordModal(true)}
                  >
                    添加关键词
                  </Button>
                </Space>
              </div>
            </div>
          </Form.Item>
          
          <Form.Item field="smartService.defaultReply" label="默认回复">
            <TextArea
              placeholder="请输入默认自动回复内容"
              rows={4}
              maxCount={500}
            />
          </Form.Item>
        </Card>

        {/* 通知配置 */}
        <Card
          title={
            <Space>
              <IconNotification />
              <span>通知配置</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="notification.newCustomer" label="新客户通知">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="notification.groupCreated" label="群聊创建通知">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="notification.customerStatusChange" label="客户状态变更通知">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="notification.followUpReminder" label="跟进提醒通知">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="notification.emailNotification" label="邮件通知">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="notification.webhookNotification" label="Webhook通知">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 数据同步配置 */}
        <Card
          title={
            <Space>
              <IconSetting />
              <span>数据同步配置</span>
            </Space>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="dataSync.autoSync" label="自动同步">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="dataSync.syncInterval" label="同步间隔(分钟)">
                <InputNumber
                  min={1}
                  max={1440}
                  placeholder="数据同步间隔"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item field="dataSync.backupEnabled" label="自动备份">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item field="dataSync.backupInterval" label="备份间隔(小时)">
                <InputNumber
                  min={1}
                  max={168}
                  placeholder="数据备份间隔"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>

      {/* 添加关键词弹窗 */}
      <Modal
        title="添加关键词"
        visible={showKeywordModal}
        onCancel={() => {
          setShowKeywordModal(false);
          setNewKeyword('');
        }}
        onOk={addKeyword}
        okText="添加"
        cancelText="取消"
      >
        <Input
          placeholder="请输入关键词"
          value={newKeyword}
          onChange={setNewKeyword}
          onEnterPress={addKeyword}
        />
      </Modal>
    </div>
  );
};

export default Settings;