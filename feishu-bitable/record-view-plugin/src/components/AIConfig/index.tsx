// AI配置组件 - 参考AutoClip的智能配置理念
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Slider,
  Space,
  Typography,
  Divider,
  Toast,
  Badge,
  Tooltip,
  Progress
} from '@douyinfe/semi-ui';
import { IconSettings, IconConnection, IconStar, IconRefresh } from '@douyinfe/semi-icons';
import aiService, { AIConfig } from '../../services/aiService';

const { Title, Text } = Typography;

interface AIConfigProps {
  onConfigChange?: (config: AIConfig) => void;
}

const AIConfigComponent: React.FC<AIConfigProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<AIConfig>({
    provider: 'qwen',
    apiKey: '',
    model: 'qwen-plus',
    temperature: 0.7,
    maxTokens: 1000,
    enabled: false
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [usageStats, setUsageStats] = useState({
    totalRequests: 0,
    successRate: 0.95,
    averageResponseTime: 1200
  });

  // AI服务提供商选项
  const providerOptions = [
    { value: 'openai', label: 'OpenAI GPT', description: '强大的通用AI模型' },
    { value: 'qwen', label: '通义千问', description: '阿里云AI大模型' },
    { value: 'siliconflow', label: 'SiliconFlow', description: '高性价比AI服务' }
  ];

  // 模型选项（根据提供商动态变化）
  const getModelOptions = (provider: string) => {
    switch (provider) {
      case 'openai':
        return [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
        ];
      case 'qwen':
        return [
          { value: 'qwen-plus', label: 'Qwen Plus' },
          { value: 'qwen-turbo', label: 'Qwen Turbo' },
          { value: 'qwen-max', label: 'Qwen Max' }
        ];
      case 'siliconflow':
        return [
          { value: 'deepseek-chat', label: 'DeepSeek Chat' },
          { value: 'qwen2-7b-instruct', label: 'Qwen2 7B' },
          { value: 'llama3-8b-instruct', label: 'Llama3 8B' }
        ];
      default:
        return [];
    }
  };

  // 初始化配置
  useEffect(() => {
    loadConfig();
    loadUsageStats();
  }, []);

  // 加载配置
  const loadConfig = async () => {
    try {
      setLoading(true);
      await aiService.initializeConfig();
      // 这里应该从aiService获取当前配置
      // const currentConfig = await aiService.getConfig();
      // setConfig(currentConfig);
    } catch (error) {
      console.error('加载AI配置失败:', error);
      Toast.error('加载AI配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载使用统计
  const loadUsageStats = () => {
    const stats = aiService.getUsageStats();
    setUsageStats(stats);
  };

  // 保存配置
  const saveConfig = async () => {
    try {
      setLoading(true);
      await aiService.updateConfig(config);
      onConfigChange?.(config);
      Toast.success('AI配置保存成功');
    } catch (error) {
      console.error('保存AI配置失败:', error);
      Toast.error('保存AI配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试连接
  const testConnection = async () => {
    if (!config.apiKey) {
      Toast.warning('请先输入API密钥');
      return;
    }

    try {
      setTesting(true);
      setConnectionStatus('unknown');
      
      // 临时更新配置用于测试
      await aiService.updateConfig(config);
      const isConnected = await aiService.testConnection();
      
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      Toast[isConnected ? 'success' : 'error'](
        isConnected ? 'AI服务连接成功' : 'AI服务连接失败'
      );
    } catch (error) {
      console.error('测试AI连接失败:', error);
      setConnectionStatus('failed');
      Toast.error('测试AI连接失败');
    } finally {
      setTesting(false);
    }
  };

  // 重置配置
  const resetConfig = () => {
    setConfig({
      provider: 'qwen',
      apiKey: '',
      model: 'qwen-plus',
      temperature: 0.7,
      maxTokens: 1000,
      enabled: false
    });
    setConnectionStatus('unknown');
  };

  // 获取连接状态显示
  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge count="已连接" type="success" />;
      case 'failed':
        return <Badge count="连接失败" type="danger" />;
      default:
        return <Badge count="未测试" type="secondary" />;
    }
  };

  // 获取温度参数说明
  const getTemperatureDescription = (value: number) => {
    if (value <= 0.3) return '保守 - 回复更加确定和一致';
    if (value <= 0.7) return '平衡 - 在创造性和一致性之间平衡';
    return '创造性 - 回复更加多样和创新';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title heading={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <IconSettings style={{ marginRight: '8px' }} />
          AI智能分析配置
        </Title>
        <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
          配置AI服务以启用智能客户分析、群聊洞察和自动回复功能
        </Text>
      </div>

      {/* 使用统计卡片 */}
      <Card 
        title="使用统计" 
        style={{ marginBottom: '24px' }}
        headerExtraContent={
          <Button 
            icon={<IconRefresh />} 
            size="small" 
            onClick={loadUsageStats}
          >
            刷新
          </Button>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {usageStats.totalRequests}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>总请求数</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {(usageStats.successRate * 100).toFixed(1)}%
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>成功率</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
              {usageStats.averageResponseTime}ms
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>平均响应时间</div>
          </div>
        </div>
      </Card>

      {/* 主配置表单 */}
      <Card title="基础配置">
        <Form layout="vertical">
          {/* 启用开关 */}
          <Form.Item label="启用AI功能">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Switch
                checked={config.enabled}
                onChange={(enabled) => setConfig({ ...config, enabled })}
                size="large"
              />
              <Text type={config.enabled ? 'success' : 'secondary'}>
                {config.enabled ? '已启用' : '已禁用'}
              </Text>
              {config.enabled && getConnectionBadge()}
            </div>
          </Form.Item>

          <Divider />

          {/* AI服务提供商 */}
          <Form.Item label="AI服务提供商">
            <Select
              value={config.provider}
              onChange={(provider) => {
                const newConfig = { ...config, provider: provider as any };
                // 重置模型为该提供商的默认模型
                const modelOptions = getModelOptions(provider as string);
                if (modelOptions.length > 0) {
                  newConfig.model = modelOptions[0].value;
                }
                setConfig(newConfig);
                setConnectionStatus('unknown');
              }}
              style={{ width: '100%' }}
            >
              {providerOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    <Text size="small" type="secondary">{option.description}</Text>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* API密钥 */}
          <Form.Item label="API密钥">
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input.Password
                value={config.apiKey}
                onChange={(apiKey) => {
                  setConfig({ ...config, apiKey });
                  setConnectionStatus('unknown');
                }}
                placeholder="请输入API密钥"
                style={{ flex: 1 }}
              />
              <Tooltip content="测试API密钥是否有效">
                <Button
                  icon={<IconConnection />}
                  onClick={testConnection}
                  loading={testing}
                  disabled={!config.apiKey}
                >
                  测试连接
                </Button>
              </Tooltip>
            </div>
          </Form.Item>

          {/* 模型选择 */}
          <Form.Item label="AI模型">
            <Select
              value={config.model}
              onChange={(model) => setConfig({ ...config, model })}
              style={{ width: '100%' }}
            >
              {getModelOptions(config.provider).map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          {/* 高级参数 */}
          <Title heading={5}>高级参数</Title>
          
          {/* 创造性参数 */}
          <Form.Item label={`创造性参数 (${config.temperature})`}>
            <div style={{ padding: '0 8px' }}>
              <Slider
                value={config.temperature}
                onChange={(temperature) => setConfig({ ...config, temperature })}
                min={0}
                max={1}
                step={0.1}
                marks={{
                  0: '保守',
                  0.5: '平衡',
                  1: '创造性'
                }}
              />
              <Text size="small" type="secondary" style={{ marginTop: '4px', display: 'block' }}>
                {getTemperatureDescription(config.temperature)}
              </Text>
            </div>
          </Form.Item>

          {/* 最大令牌数 */}
          <Form.Item label="最大令牌数">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Slider
                value={config.maxTokens}
                onChange={(maxTokens) => setConfig({ ...config, maxTokens })}
                min={100}
                max={4000}
                step={100}
                style={{ flex: 1 }}
                marks={{
                  100: '100',
                  1000: '1000',
                  2000: '2000',
                  4000: '4000'
                }}
              />
              <Text style={{ minWidth: '60px', textAlign: 'right' }}>
                {config.maxTokens}
              </Text>
            </div>
            <Text size="small" type="secondary" style={{ marginTop: '4px', display: 'block' }}>
              控制AI回复的最大长度，更高的值允许更详细的回复但消耗更多资源
            </Text>
          </Form.Item>
        </Form>

        {/* 操作按钮 */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button onClick={resetConfig}>
            重置配置
          </Button>
          <Button 
            type="primary" 
            onClick={saveConfig}
            loading={loading}
            disabled={!config.apiKey}
          >
            保存配置
          </Button>
        </div>
      </Card>

      {/* AI功能说明 */}
      <Card title="AI功能说明" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <Title heading={6} style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
              <IconStar style={{ marginRight: '6px', color: '#1890ff' }} />
              智能客户分析
            </Title>
            <Text size="small" type="secondary">
              自动分析客户信息，识别客户类型、评估转化概率、推荐跟进策略
            </Text>
          </div>
          
          <div>
            <Title heading={6} style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
              <IconStar style={{ marginRight: '6px', color: '#52c41a' }} />
              群聊智能洞察
            </Title>
            <Text size="small" type="secondary">
              分析群聊活跃度、识别关键话题、评估成员参与度、提供运营建议
            </Text>
          </div>
          
          <div>
            <Title heading={6} style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
              <IconStar style={{ marginRight: '6px', color: '#fa8c16' }} />
              智能自动回复
            </Title>
            <Text size="small" type="secondary">
              理解用户意图，生成个性化回复，判断是否需要人工介入
            </Text>
          </div>
          
          <div>
            <Title heading={6} style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
              <IconStar style={{ marginRight: '6px', color: '#722ed1' }} />
              批量智能处理
            </Title>
            <Text size="small" type="secondary">
              批量分析客户数据、群聊信息，提供统一的智能化处理方案
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIConfigComponent;