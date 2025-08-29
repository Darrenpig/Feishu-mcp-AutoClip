import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Switch,
  Divider,
  Toast,
  Spin,
  TextArea,
  InputNumber,
  Select,
  Tag,
  Modal,
  Table,
  Popconfirm
} from '@douyinfe/semi-ui';
import {
  IconSettings,
  IconRobot,
  IconPlus,
  IconEdit,
  IconDelete,
  IconPlay,
  IconPause
} from '@douyinfe/semi-icons';
import botService from '../../services/botService';
import {
  BotConfig as IBotConfig,
  AutoReplyRule,
  MessageType,
  ChatType,
  SenderType
} from '../../types/bot';

const { Title, Text } = Typography;
const { Option } = Select;

interface BotConfigProps {
  onConfigChange?: (config: IBotConfig) => void;
}

const BotConfig: React.FC<BotConfigProps> = ({ onConfigChange }) => {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [config, setConfig] = useState<IBotConfig>({
    app_id: '',
    app_secret: '',
    verification_token: '',
    encrypt_key: '',
    webhook_url: '',
    enabled: false
  });
  const [autoReplyRules, setAutoReplyRules] = useState<AutoReplyRule[]>([]);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [ruleForm] = Form.useForm();

  useEffect(() => {
    loadConfig();
    loadAutoReplyRules();
  }, []);

  const loadConfig = async () => {
    try {
      // 从本地存储加载配置
      const stored = localStorage.getItem('feishu_bot_config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        setConfig(parsedConfig);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const loadAutoReplyRules = async () => {
    try {
      const rules = await botService.getAutoReplyRules();
      setAutoReplyRules(rules);
    } catch (error) {
      console.error('加载自动回复规则失败:', error);
    }
  };

  const handleConfigSave = async (values: any) => {
    setLoading(true);
    try {
      const newConfig: IBotConfig = {
        ...values,
        enabled: values.enabled || false
      };
      
      // 保存到本地存储
      localStorage.setItem('feishu_bot_config', JSON.stringify(newConfig));
      setConfig(newConfig);
      
      // 如果启用了机器人，初始化服务
      if (newConfig.enabled) {
        await botService.initialize(newConfig);
      }
      
      onConfigChange?.(newConfig);
      Toast.success('配置保存成功');
    } catch (error) {
      console.error('保存配置失败:', error);
      Toast.error('保存配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      await botService.initialize(config);
      const token = await botService.getAccessToken();
      if (token) {
        Toast.success('连接测试成功');
      } else {
        Toast.error('连接测试失败');
      }
    } catch (error) {
      console.error('连接测试失败:', error);
      Toast.error(`连接测试失败: ${error}`);
    } finally {
      setTestLoading(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    ruleForm.reset();
    setRuleModalVisible(true);
  };

  const handleEditRule = (rule: AutoReplyRule) => {
    setEditingRule(rule);
    ruleForm.setValues({
      ...rule,
      keywords: rule.conditions.keywords?.join(', ') || '',
      messageType: rule.conditions.messageType || [],
      chatType: rule.conditions.chatType || [],
      senderType: rule.conditions.senderType || [],
      timeRangeStart: rule.conditions.timeRange?.start || '',
      timeRangeEnd: rule.conditions.timeRange?.end || ''
    });
    setRuleModalVisible(true);
  };

  const handleRuleSave = async (values: any) => {
    try {
      const ruleData = {
        name: values.name,
        description: values.description,
        isActive: values.isActive,
        priority: values.priority,
        conditions: {
          keywords: values.keywords ? values.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
          messageType: values.messageType || [],
          chatType: values.chatType || [],
          senderType: values.senderType || [],
          timeRange: values.timeRangeStart && values.timeRangeEnd ? {
            start: values.timeRangeStart,
            end: values.timeRangeEnd
          } : undefined
        },
        actions: {
          replyType: values.replyType,
          content: values.content,
          delay: values.delay || 0,
          transferToHuman: values.transferToHuman || false
        }
      };

      if (editingRule) {
        await botService.updateAutoReplyRule(editingRule.id, ruleData);
        Toast.success('规则更新成功');
      } else {
        await botService.createAutoReplyRule(ruleData);
        Toast.success('规则创建成功');
      }

      setRuleModalVisible(false);
      loadAutoReplyRules();
    } catch (error) {
      console.error('保存规则失败:', error);
      Toast.error('保存规则失败');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await botService.deleteAutoReplyRule(id);
      Toast.success('规则删除成功');
      loadAutoReplyRules();
    } catch (error) {
      console.error('删除规则失败:', error);
      Toast.error('删除规则失败');
    }
  };

  const handleToggleRule = async (rule: AutoReplyRule) => {
    try {
      await botService.updateAutoReplyRule(rule.id, {
        isActive: !rule.isActive
      });
      loadAutoReplyRules();
    } catch (error) {
      console.error('切换规则状态失败:', error);
      Toast.error('切换规则状态失败');
    }
  };

  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AutoReplyRule) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="tertiary" size="small">{record.description}</Text>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: AutoReplyRule) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleRule(record)}
          checkedText="启用"
          uncheckedText="禁用"
        />
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) => (
        <Tag color={priority <= 3 ? 'red' : priority <= 6 ? 'orange' : 'green'}>
          {priority}
        </Tag>
      )
    },
    {
      title: '触发条件',
      key: 'conditions',
      render: (record: AutoReplyRule) => (
        <div>
          {record.conditions.keywords && record.conditions.keywords.length > 0 && (
            <div>
              <Text size="small">关键词: </Text>
              {record.conditions.keywords.map(keyword => (
                <Tag key={keyword} size="small">{keyword}</Tag>
              ))}
            </div>
          )}
          {record.conditions.messageType && record.conditions.messageType.length > 0 && (
            <div>
              <Text size="small">消息类型: </Text>
              {record.conditions.messageType.map(type => (
                <Tag key={type} size="small">{type}</Tag>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (record: AutoReplyRule) => (
        <Space>
          <Button
            theme="borderless"
            type="primary"
            icon={<IconEdit />}
            size="small"
            onClick={() => handleEditRule(record)}
          />
          <Popconfirm
            title="确定要删除这个规则吗？"
            onConfirm={() => handleDeleteRule(record.id)}
          >
            <Button
              theme="borderless"
              type="danger"
              icon={<IconDelete />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title heading={3} icon={<IconRobot />}>
        机器人配置
      </Title>

      {/* 基础配置 */}
      <Card title="基础配置" style={{ marginBottom: '24px' }}>
        <Form
          initValues={config}
          onSubmit={handleConfigSave}
          labelPosition="left"
          labelWidth={120}
        >
          <Form.Switch
            field="enabled"
            label="启用机器人"
            checkedText="启用"
            uncheckedText="禁用"
          />
          
          <Divider />
          
          <Form.Input
            field="app_id"
            label="App ID"
            placeholder="请输入飞书应用的 App ID"
            rules={[{ required: true, message: 'App ID 不能为空' }]}
          />
          
          <Form.Input
            field="app_secret"
            label="App Secret"
            mode="password"
            placeholder="请输入飞书应用的 App Secret"
            rules={[{ required: true, message: 'App Secret 不能为空' }]}
          />
          
          <Form.Input
            field="verification_token"
            label="Verification Token"
            placeholder="请输入事件订阅的 Verification Token"
            rules={[{ required: true, message: 'Verification Token 不能为空' }]}
          />
          
          <Form.Input
            field="encrypt_key"
            label="Encrypt Key"
            placeholder="请输入事件加密密钥（可选）"
          />
          
          <Form.Input
            field="webhook_url"
            label="Webhook URL"
            placeholder="请输入事件回调地址"
          />
          
          <div style={{ marginTop: '24px' }}>
            <Space>
              <Button
                htmlType="submit"
                type="primary"
                loading={loading}
                icon={<IconSettings />}
              >
                保存配置
              </Button>
              
              <Button
                onClick={handleTestConnection}
                loading={testLoading}
                disabled={!config.app_id || !config.app_secret}
              >
                测试连接
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      {/* 自动回复规则 */}
      <Card
        title="自动回复规则"
        headerExtraContent={
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={handleCreateRule}
          >
            新建规则
          </Button>
        }
      >
        <Table
          columns={ruleColumns}
          dataSource={autoReplyRules}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
        />
      </Card>

      {/* 规则编辑弹窗 */}
      <Modal
        title={editingRule ? '编辑自动回复规则' : '新建自动回复规则'}
        visible={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={ruleForm}
          onSubmit={handleRuleSave}
          labelPosition="left"
          labelWidth={120}
        >
          <Form.Input
            field="name"
            label="规则名称"
            placeholder="请输入规则名称"
            rules={[{ required: true, message: '规则名称不能为空' }]}
          />
          
          <Form.TextArea
            field="description"
            label="规则描述"
            placeholder="请输入规则描述"
            rows={2}
          />
          
          <Form.Switch
            field="isActive"
            label="启用规则"
            initValue={true}
            checkedText="启用"
            uncheckedText="禁用"
          />
          
          <Form.InputNumber
            field="priority"
            label="优先级"
            placeholder="数字越小优先级越高"
            min={1}
            max={100}
            initValue={10}
          />
          
          <Divider>触发条件</Divider>
          
          <Form.Input
            field="keywords"
            label="关键词"
            placeholder="多个关键词用逗号分隔"
            helpText="当消息包含任一关键词时触发"
          />
          
          <Form.Select
            field="messageType"
            label="消息类型"
            multiple
            placeholder="选择消息类型"
          >
            <Option value={MessageType.TEXT}>文本</Option>
            <Option value={MessageType.IMAGE}>图片</Option>
            <Option value={MessageType.FILE}>文件</Option>
            <Option value={MessageType.AUDIO}>音频</Option>
            <Option value={MessageType.VIDEO}>视频</Option>
          </Form.Select>
          
          <Form.Select
            field="chatType"
            label="聊天类型"
            multiple
            placeholder="选择聊天类型"
          >
            <Option value={ChatType.P2P}>单聊</Option>
            <Option value={ChatType.GROUP}>群聊</Option>
          </Form.Select>
          
          <Form.Select
            field="senderType"
            label="发送者类型"
            multiple
            placeholder="选择发送者类型"
          >
            <Option value={SenderType.USER}>用户</Option>
            <Option value={SenderType.APP}>应用</Option>
            <Option value={SenderType.ANONYMOUS}>匿名</Option>
          </Form.Select>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Form.Input
              field="timeRangeStart"
              label="时间范围"
              placeholder="开始时间 (HH:mm)"
              style={{ flex: 1 }}
            />
            <Form.Input
              field="timeRangeEnd"
              placeholder="结束时间 (HH:mm)"
              style={{ flex: 1 }}
            />
          </div>
          
          <Divider>回复动作</Divider>
          
          <Form.Select
            field="replyType"
            label="回复类型"
            placeholder="选择回复类型"
            initValue="text"
          >
            <Option value="text">文本回复</Option>
            <Option value="card">卡片回复</Option>
            <Option value="template">模板回复</Option>
          </Form.Select>
          
          <Form.TextArea
            field="content"
            label="回复内容"
            placeholder="请输入回复内容"
            rows={4}
            rules={[{ required: true, message: '回复内容不能为空' }]}
          />
          
          <Form.InputNumber
            field="delay"
            label="延迟回复"
            placeholder="延迟时间（毫秒）"
            min={0}
            max={60000}
            initValue={0}
            suffix="ms"
          />
          
          <Form.Switch
            field="transferToHuman"
            label="转人工处理"
            checkedText="是"
            uncheckedText="否"
          />
          
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRuleModalVisible(false)}>
                取消
              </Button>
              <Button htmlType="submit" type="primary">
                {editingRule ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BotConfig;