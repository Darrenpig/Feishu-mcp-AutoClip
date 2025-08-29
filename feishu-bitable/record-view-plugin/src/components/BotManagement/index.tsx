import React, { useState, useEffect } from 'react';
import {
  Layout,
  Nav,
  Card,
  Typography,
  Space,
  Button,
  Badge,
  Statistic,
  Row,
  Col,
  Progress,
  Tag,
  Avatar,
  List,
  Empty,
  Spin
} from '@douyinfe/semi-ui';
import {
  IconRobot,
  IconSettings,
  IconMessage,
  IconBarChart,
  IconPlay,
  IconPause,
  IconCheckCircle,
  IconAlertTriangle
} from '@douyinfe/semi-icons';
import BotConfig from './BotConfig';
import MessageHistory from './MessageHistory';
import botService from '../../services/botService';
import { BotConfig as IBotConfig, AutoReplyRule } from '../../types/bot';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface BotStats {
  totalMessages: number;
  autoReplies: number;
  activeRules: number;
  totalRules: number;
  successRate: number;
}

const BotManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [botConfig, setBotConfig] = useState<IBotConfig | null>(null);
  const [botStats, setBotStats] = useState<BotStats>({
    totalMessages: 0,
    autoReplies: 0,
    activeRules: 0,
    totalRules: 0,
    successRate: 0
  });
  const [autoReplyRules, setAutoReplyRules] = useState<AutoReplyRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBotData();
  }, []);

  const loadBotData = async () => {
    setLoading(true);
    try {
      // 加载机器人配置
      const stored = localStorage.getItem('feishu_bot_config');
      if (stored) {
        setBotConfig(JSON.parse(stored));
      }

      // 加载自动回复规则
      const rules = await botService.getAutoReplyRules();
      setAutoReplyRules(rules);

      // 计算统计数据
      const activeRulesCount = rules.filter(rule => rule.isActive).length;
      setBotStats({
        totalMessages: 1250, // 模拟数据
        autoReplies: 890,
        activeRules: activeRulesCount,
        totalRules: rules.length,
        successRate: 92.5
      });
    } catch (error) {
      console.error('加载机器人数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (config: IBotConfig) => {
    setBotConfig(config);
    loadBotData(); // 重新加载数据
  };

  const navItems = [
    {
      itemKey: 'overview',
      text: '概览',
      icon: <IconBarChart />
    },
    {
      itemKey: 'config',
      text: '机器人配置',
      icon: <IconSettings />
    },
    {
      itemKey: 'messages',
      text: '消息历史',
      icon: <IconMessage />
    }
  ];

  const renderOverview = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div style={{ padding: '24px' }}>
        <Title heading={3} icon={<IconRobot />}>
          机器人概览
        </Title>

        {/* 状态卡片 */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar size="large" color={botConfig?.enabled ? 'green' : 'grey'}>
                <IconRobot />
              </Avatar>
              <div>
                <Title heading={4} style={{ margin: 0 }}>
                  智能客服机器人
                </Title>
                <Text type="tertiary">
                  {botConfig?.enabled ? '运行中' : '已停用'}
                </Text>
              </div>
            </div>
            <div>
              <Badge
                count={botConfig?.enabled ? '在线' : '离线'}
                type={botConfig?.enabled ? 'success' : 'danger'}
              />
            </div>
          </div>
        </Card>

        {/* 统计数据 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总消息数"
                value={botStats.totalMessages}
                prefix={<IconMessage />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="自动回复数"
                value={botStats.autoReplies}
                prefix={<IconRobot />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃规则"
                value={`${botStats.activeRules}/${botStats.totalRules}`}
                prefix={<IconCheckCircle />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="成功率"
                value={botStats.successRate}
                suffix="%"
                prefix={<IconBarChart />}
              />
              <Progress
                percent={botStats.successRate}
                showInfo={false}
                size="small"
                style={{ marginTop: '8px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* 自动回复规则状态 */}
          <Col span={12}>
            <Card title="自动回复规则" style={{ height: '400px' }}>
              {autoReplyRules.length > 0 ? (
                <List
                  dataSource={autoReplyRules.slice(0, 5)} // 只显示前5个
                  renderItem={(rule) => (
                    <List.Item
                      main={
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong>{rule.name}</Text>
                            <Tag
                              color={rule.isActive ? 'green' : 'grey'}
                              size="small"
                            >
                              {rule.isActive ? '启用' : '禁用'}
                            </Tag>
                            <Tag color="blue" size="small">
                              优先级 {rule.priority}
                            </Tag>
                          </div>
                          <Text type="tertiary" size="small">
                            {rule.description}
                          </Text>
                        </div>
                      }
                      extra={
                        rule.isActive ? (
                          <IconPlay style={{ color: 'var(--semi-color-success)' }} />
                        ) : (
                          <IconPause style={{ color: 'var(--semi-color-tertiary)' }} />
                        )
                      }
                    />
                  )}
                />
              ) : (
                <Empty
                  title="暂无规则"
                  description="还没有配置自动回复规则"
                />
              )}
              
              {autoReplyRules.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Button
                    theme="borderless"
                    type="primary"
                    onClick={() => setActiveTab('config')}
                  >
                    查看全部 {autoReplyRules.length} 个规则
                  </Button>
                </div>
              )}
            </Card>
          </Col>

          {/* 最近活动 */}
          <Col span={12}>
            <Card title="最近活动" style={{ height: '400px' }}>
              <List
                dataSource={[
                  {
                    id: '1',
                    type: 'auto_reply',
                    message: '自动回复了用户咨询',
                    time: '2分钟前',
                    status: 'success'
                  },
                  {
                    id: '2',
                    type: 'rule_trigger',
                    message: '触发了"欢迎消息"规则',
                    time: '5分钟前',
                    status: 'success'
                  },
                  {
                    id: '3',
                    type: 'message_received',
                    message: '收到新消息',
                    time: '8分钟前',
                    status: 'info'
                  },
                  {
                    id: '4',
                    type: 'error',
                    message: '发送消息失败',
                    time: '15分钟前',
                    status: 'error'
                  },
                  {
                    id: '5',
                    type: 'config_update',
                    message: '更新了机器人配置',
                    time: '1小时前',
                    status: 'info'
                  }
                ]}
                renderItem={(item) => {
                  const getIcon = () => {
                    switch (item.type) {
                      case 'auto_reply':
                        return <IconRobot />;
                      case 'rule_trigger':
                        return <IconPlay />;
                      case 'message_received':
                        return <IconMessage />;
                      case 'error':
                        return <IconAlertTriangle />;
                      case 'config_update':
                        return <IconSettings />;
                      default:
                        return <IconMessage />;
                    }
                  };

                  const getColor = () => {
                    switch (item.status) {
                      case 'success':
                        return 'green';
                      case 'error':
                        return 'red';
                      case 'info':
                      default:
                        return 'blue';
                    }
                  };

                  return (
                    <List.Item
                      main={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar size="small" color={getColor()}>
                            {getIcon()}
                          </Avatar>
                          <div>
                            <Text>{item.message}</Text>
                            <br />
                            <Text type="tertiary" size="small">
                              {item.time}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  );
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'config':
        return <BotConfig onConfigChange={handleConfigChange} />;
      case 'messages':
        return <MessageHistory />;
      default:
        return renderOverview();
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <div style={{ padding: '20px' }}>
          <Title heading={4} style={{ margin: 0, textAlign: 'center' }}>
            <IconRobot /> 机器人管理
          </Title>
        </div>
        <Nav
          items={navItems}
          selectedKeys={[activeTab]}
          onSelect={({ itemKey }) => setActiveTab(itemKey as string)}
          style={{ maxWidth: 220 }}
        />
      </Sider>
      
      <Layout>
        <Content style={{ backgroundColor: 'var(--semi-color-bg-0)' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default BotManagement;