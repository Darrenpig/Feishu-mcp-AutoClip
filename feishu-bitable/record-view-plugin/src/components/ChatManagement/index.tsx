import React, { useState, useEffect } from 'react';
import {
  Layout,
  Nav,
  Card,
  Statistic,
  Row,
  Col,
  Button,
  Badge,
  Avatar,
  List,
  Typography,
  Space,
  Divider,
  Tag,
  Progress,
  Empty,
  Spin,
  Tooltip
} from '@douyinfe/semi-ui';
import {
  IconComment,
  IconUser,
  IconCustomerSupport,
  IconRobot,
  IconSetting,
  IconBarChart,
  IconRefresh,
  IconPhone,
  IconMail,
  IconClock,
  IconCheckCircle,
  IconClose,
  IconTransfer
} from '@douyinfe/semi-icons';
import {
  ChatSession,
  ChatAgent,
  ChatStats,
  AgentWorkload,
  ChatStatus,
  AgentStatus,
  ChatPriority,
  SenderType
} from '../../types/chat';
import chatService from '../../services/chatService';
import ChatInterface from './ChatInterface';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface ChatManagementProps {
  // 可以传入当前登录的客服ID
  currentAgentId?: string;
}

const ChatManagement: React.FC<ChatManagementProps> = ({ currentAgentId }) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('chat');
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [agentWorkloads, setAgentWorkloads] = useState<AgentWorkload[]>([]);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<ChatAgent | null>(null);

  // 初始化数据
  useEffect(() => {
    initializeData();
    
    // 设置定时刷新
    const interval = setInterval(() => {
      if (activeTab === 'overview') {
        loadOverviewData();
      }
    }, 30000); // 30秒刷新一次
    
    return () => clearInterval(interval);
  }, [activeTab]);

  // 初始化数据
  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOverviewData(),
        loadAgents()
      ]);
      
      // 设置当前客服
      if (currentAgentId) {
        const agent = agents.find(a => a.id === currentAgentId);
        setCurrentAgent(agent || null);
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载概览数据
  const loadOverviewData = async () => {
    try {
      const [statsResponse, workloadsResponse, chatsResponse] = await Promise.all([
        chatService.getStats(),
        chatService.getAgentWorkloads(),
        chatService.getChats({ page: 1, pageSize: 10 })
      ]);
      
      setStats(statsResponse);
      setAgentWorkloads(workloadsResponse);
      setRecentChats(chatsResponse.items);
    } catch (error) {
      console.error('Failed to load overview data:', error);
    }
  };

  // 加载客服列表
  const loadAgents = async () => {
    try {
      const agentsResponse = await chatService.getAgents();
      setAgents(agentsResponse);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: ChatStatus) => {
    switch (status) {
      case ChatStatus.WAITING: return 'orange';
      case ChatStatus.ACTIVE: return 'green';
      case ChatStatus.TRANSFERRED: return 'blue';
      case ChatStatus.CLOSED: return 'grey';
      case ChatStatus.TIMEOUT: return 'red';
      default: return 'grey';
    }
  };

  // 获取客服状态颜色
  const getAgentStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.ONLINE: return 'green';
      case AgentStatus.BUSY: return 'orange';
      case AgentStatus.AWAY: return 'yellow';
      case AgentStatus.OFFLINE: return 'grey';
      default: return 'grey';
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: ChatPriority) => {
    switch (priority) {
      case ChatPriority.LOW: return 'grey';
      case ChatPriority.NORMAL: return 'blue';
      case ChatPriority.HIGH: return 'orange';
      case ChatPriority.URGENT: return 'red';
      default: return 'blue';
    }
  };

  // 渲染概览页面
  const renderOverview = () => {
    if (!stats) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div style={{ padding: '24px' }}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日对话"
                value={stats.todayChats}
                prefix={<IconComment />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃对话"
                value={stats.activeChats}
                prefix={<IconUser />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="在线客服"
                value={stats.onlineAgents}
                prefix={<IconCustomerSupport />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均响应时间"
                value={stats.avgResponseTime}
                suffix="秒"
                prefix={<IconClock />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* 客服工作负载 */}
          <Col span={12}>
            <Card title="客服工作负载" extra={
              <Button 
                icon={<IconRefresh />} 
                size="small" 
                onClick={loadOverviewData}
                loading={loading}
              />
            }>
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {agentWorkloads.length > 0 ? (
                  agentWorkloads.map(workload => {
                    const agent = agents.find(a => a.id === workload.agentId);
                    if (!agent) return null;
                    
                    return (
                      <div key={workload.agentId} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <Badge 
                            dot 
                            style={{ backgroundColor: getAgentStatusColor(agent.status) }}
                          >
                            <Avatar size="small">
                              {agent.name.charAt(0)}
                            </Avatar>
                          </Badge>
                          <div style={{ marginLeft: 8, flex: 1 }}>
                            <Text strong>{agent.name}</Text>
                            <Text size="small" type="tertiary" style={{ marginLeft: 8 }}>
                              {agent.department}
                            </Text>
                          </div>
                          <Text size="small">
                            {workload.activeChats}/{workload.maxChats}
                          </Text>
                        </div>
                        <Progress
                          percent={(workload.activeChats / workload.maxChats) * 100}
                          size="small"
                          stroke={workload.activeChats >= workload.maxChats ? '#f5222d' : '#1890ff'}
                        />
                      </div>
                    );
                  })
                ) : (
                  <Empty description="暂无数据" />
                )}
              </div>
            </Card>
          </Col>

          {/* 最近对话 */}
          <Col span={12}>
            <Card title="最近对话" extra={
              <Button 
                size="small" 
                onClick={() => setActiveTab('chat')}
              >
                查看全部
              </Button>
            }>
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {recentChats.length > 0 ? (
                  <List
                    size="small"
                    dataSource={recentChats}
                    renderItem={(chat) => (
                      <List.Item
                        style={{ padding: '8px 0' }}
                        main={
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                              <Text strong ellipsis style={{ maxWidth: 120 }}>
                                {chat.customerName}
                              </Text>
                              <Tag size="small" color={getStatusColor(chat.status)} style={{ marginLeft: 8 }}>
                                {chat.status}
                              </Tag>
                              <Tag size="small" color={getPriorityColor(chat.priority)} style={{ marginLeft: 4 }}>
                                {chat.priority}
                              </Tag>
                            </div>
                            <Text size="small" type="tertiary" ellipsis>
                              {chat.lastMessage || '暂无消息'}
                            </Text>
                          </div>
                        }
                        extra={
                          <Text size="small" type="tertiary">
                            {new Date(chat.lastMessageTime).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        }
                      />
                    )}
                  />
                ) : (
                  <Empty description="暂无对话" />
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 今日统计详情 */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="今日统计详情">
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      {stats.totalMessages}
                    </div>
                    <div style={{ color: '#666', marginTop: 4 }}>总消息数</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                      {stats.resolvedChats}
                    </div>
                    <div style={{ color: '#666', marginTop: 4 }}>已解决对话</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                      {stats.transferredChats}
                    </div>
                    <div style={{ color: '#666', marginTop: 4 }}>转接对话</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                      {stats.timeoutChats}
                    </div>
                    <div style={{ color: '#666', marginTop: 4 }}>超时对话</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染客服管理页面
  const renderAgentManagement = () => {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title heading={4}>客服管理</Title>
          <Space>
            <Button 
              icon={<IconRefresh />} 
              onClick={loadAgents}
              loading={loading}
            >
              刷新
            </Button>
            <Button type="primary">
              添加客服
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {agents.map(agent => {
            const workload = agentWorkloads.find(w => w.agentId === agent.id);
            
            return (
              <Col span={8} key={agent.id}>
                <Card
                  style={{
                    borderLeft: `4px solid ${getAgentStatusColor(agent.status) === 'green' ? '#52c41a' : 
                      getAgentStatusColor(agent.status) === 'orange' ? '#fa8c16' : 
                      getAgentStatusColor(agent.status) === 'yellow' ? '#fadb14' : '#d9d9d9'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <Badge 
                      dot 
                      style={{ backgroundColor: getAgentStatusColor(agent.status) }}
                    >
                      <Avatar size="large">
                        {agent.name.charAt(0)}
                      </Avatar>
                    </Badge>
                    <div style={{ marginLeft: 12, flex: 1 }}>
                      <Title heading={6} style={{ margin: 0 }}>
                        {agent.name}
                      </Title>
                      <Text size="small" type="tertiary">
                        {agent.department}
                      </Text>
                      <br />
                      <Tag size="small" color={getAgentStatusColor(agent.status)}>
                        {agent.status}
                      </Tag>
                    </div>
                  </div>

                  {workload && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text size="small">工作负载</Text>
                        <Text size="small">
                          {workload.activeChats}/{workload.maxChats}
                        </Text>
                      </div>
                      <Progress
                        percent={(workload.activeChats / workload.maxChats) * 100}
                        size="small"
                        stroke={workload.activeChats >= workload.maxChats ? '#f5222d' : '#1890ff'}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="small">
                      {agent.phone && (
                        <Tooltip content="拨打电话">
                          <Button 
                            size="small" 
                            icon={<IconPhone />}
                            onClick={() => window.open(`tel:${agent.phone}`)}
                          />
                        </Tooltip>
                      )}
                      {agent.email && (
                        <Tooltip content="发送邮件">
                          <Button 
                            size="small" 
                            icon={<IconMail />}
                            onClick={() => window.open(`mailto:${agent.email}`)}
                          />
                        </Tooltip>
                      )}
                    </Space>
                    
                    <Space size="small">
                      <Button size="small" type="tertiary">
                        编辑
                      </Button>
                      <Button size="small" type="tertiary">
                        详情
                      </Button>
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  // 渲染设置页面
  const renderSettings = () => {
    return (
      <div style={{ padding: '24px' }}>
        <Title heading={4}>系统设置</Title>
        
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="基础设置">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>自动分配规则</Text>
                  <br />
                  <Text size="small" type="tertiary">
                    配置新对话的自动分配策略
                  </Text>
                </div>
                <Divider />
                <div>
                  <Text strong>工作时间设置</Text>
                  <br />
                  <Text size="small" type="tertiary">
                    设置客服工作时间和休息时间
                  </Text>
                </div>
                <Divider />
                <div>
                  <Text strong>消息模板</Text>
                  <br />
                  <Text size="small" type="tertiary">
                    管理快捷回复和自动回复模板
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="高级设置">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>知识库管理</Text>
                  <br />
                  <Text size="small" type="tertiary">
                    维护客服知识库和FAQ
                  </Text>
                </div>
                <Divider />
                <div>
                  <Text strong>质检规则</Text>
                  <br />
                  <Text size="small" type="tertiary">
                    设置对话质量检查规则
                  </Text>
                </div>
                <Divider />
                <div>
                  <Text strong>数据导出</Text>
                  <br />
                  <Text size="small" type="tertiary">
                    导出对话记录和统计数据
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'chat':
        return <ChatInterface agentId={currentAgentId} />;
      case 'agents':
        return renderAgentManagement();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ 
        padding: '0 24px', 
        backgroundColor: 'var(--semi-color-bg-2)',
        borderBottom: '1px solid var(--semi-color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconCustomerSupport size="large" style={{ marginRight: 12 }} />
            <Title heading={4} style={{ margin: 0 }}>智能客服系统</Title>
          </div>
          
          {currentAgent && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Badge 
                dot 
                style={{ backgroundColor: getAgentStatusColor(currentAgent.status) }}
              >
                <Avatar size="small">
                  {currentAgent.name.charAt(0)}
                </Avatar>
              </Badge>
              <div style={{ marginLeft: 8 }}>
                <Text strong>{currentAgent.name}</Text>
                <br />
                <Text size="small" type="tertiary">
                  {currentAgent.department}
                </Text>
              </div>
            </div>
          )}
        </div>
      </Header>
      
      <Layout>
        <Sider width={200} style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
          <Nav
            mode="vertical"
            selectedKeys={[activeTab]}
            onSelect={({ selectedKeys }) => setActiveTab(selectedKeys[0] as string)}
            style={{ padding: '16px 0' }}
          >
            <Nav.Item itemKey="overview" text="概览" icon={<IconBarChart />} />
            <Nav.Item itemKey="chat" text="对话" icon={<IconComment />} />
            <Nav.Item itemKey="agents" text="客服管理" icon={<IconCustomerSupport />} />
            <Nav.Item itemKey="settings" text="设置" icon={<IconSetting />} />
          </Nav>
        </Sider>
        
        <Content style={{ backgroundColor: 'var(--semi-color-bg-0)' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChatManagement;