// 群聊管理主组件
import React, { useState, useEffect } from 'react';
import {
  Layout,
  Nav,
  Card,
  Typography,
  Space,
  Button,
  Badge,
  Row,
  Col,
  Statistic,
  Progress,
  Divider
} from '@douyinfe/semi-ui';
import {
  IconUsers,
  IconMessage,
  IconSetting,
  IconBarChart,
  IconList,
  IconPlus,
  IconRefresh
} from '@douyinfe/semi-icons';
import { Group, GroupStats as GroupStatsType } from '../../types/group';
import groupService from '../../services/groupService';
import GroupList from './GroupList';
import GroupStats from './GroupStats';
import AutoGroupRules from './AutoGroupRules';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type ActiveSection = 'overview' | 'groups' | 'stats' | 'rules' | 'settings';

const GroupManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [stats, setStats] = useState<GroupStatsType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeService();
    loadStats();
  }, []);

  // 初始化服务
  const initializeService = async () => {
    try {
      await groupService.initialize();
    } catch (error) {
      console.error('群聊服务初始化失败:', error);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const statsData = await groupService.getGroupStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导航菜单项
  const navItems = [
    {
      itemKey: 'overview',
      text: '概览',
      icon: <IconBarChart />
    },
    {
      itemKey: 'groups',
      text: '群聊列表',
      icon: <IconList />
    },
    {
      itemKey: 'stats',
      text: '数据统计',
      icon: <IconBarChart />
    },
    {
      itemKey: 'rules',
      text: '自动拉群规则',
      icon: <IconSetting />
    },
    {
      itemKey: 'settings',
      text: '系统设置',
      icon: <IconSetting />
    }
  ];

  // 渲染概览页面
  const renderOverview = () => (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title heading={3}>群聊管理概览</Title>
        <Text type="tertiary">管理和监控所有群聊活动</Text>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总群聊数"
                value={stats.totalGroups}
                prefix={<IconUsers />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃群聊"
                value={stats.activeGroups}
                prefix={<IconMessage />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总成员数"
                value={stats.totalMembers}
                prefix={<IconUsers />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均成员数"
                value={Math.round(stats.averageMembersPerGroup)}
                suffix="人/群"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 群聊类型分布 */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="群聊类型分布">
              <Space vertical style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>客服群</Text>
                  <Badge count={stats.groupsByType.customer_service} />
                </div>
                <Progress
                  percent={stats.totalGroups > 0 ? (stats.groupsByType.customer_service / stats.totalGroups) * 100 : 0}
                  showInfo={false}
                  stroke="#1890ff"
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>销售群</Text>
                  <Badge count={stats.groupsByType.sales} />
                </div>
                <Progress
                  percent={stats.totalGroups > 0 ? (stats.groupsByType.sales / stats.totalGroups) * 100 : 0}
                  showInfo={false}
                  stroke="#52c41a"
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>技术支持群</Text>
                  <Badge count={stats.groupsByType.support} />
                </div>
                <Progress
                  percent={stats.totalGroups > 0 ? (stats.groupsByType.support / stats.totalGroups) * 100 : 0}
                  showInfo={false}
                  stroke="#fa8c16"
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>通用群</Text>
                  <Badge count={stats.groupsByType.general} />
                </div>
                <Progress
                  percent={stats.totalGroups > 0 ? (stats.groupsByType.general / stats.totalGroups) * 100 : 0}
                  showInfo={false}
                  stroke="#722ed1"
                />
              </Space>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="群聊状态分布">
              <Space vertical style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>活跃群聊</Text>
                  <Badge count={stats.activeGroups} style={{ backgroundColor: '#52c41a' }} />
                </div>
                <Progress
                  percent={stats.totalGroups > 0 ? (stats.activeGroups / stats.totalGroups) * 100 : 0}
                  showInfo={false}
                  stroke="#52c41a"
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>不活跃群聊</Text>
                  <Badge count={stats.inactiveGroups} style={{ backgroundColor: '#fa8c16' }} />
                </div>
                <Progress
                  percent={stats.totalGroups > 0 ? (stats.inactiveGroups / stats.totalGroups) * 100 : 0}
                  showInfo={false}
                  stroke="#fa8c16"
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>已归档群聊</Text>
                  <Badge count={stats.archivedGroups} style={{ backgroundColor: '#8c8c8c' }} />
                </div>
                <Progress
                  percent={stats.totalGroups > 0 ? (stats.archivedGroups / stats.totalGroups) * 100 : 0}
                  showInfo={false}
                  stroke="#8c8c8c"
                />
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* 消息活跃度 */}
      {stats && (
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="今日消息数"
                value={stats.dailyMessageCount}
                prefix={<IconMessage />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="本周消息数"
                value={stats.weeklyMessageCount}
                prefix={<IconMessage />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="本月消息数"
                value={stats.monthlyMessageCount}
                prefix={<IconMessage />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 快捷操作 */}
      <Card title="快捷操作" style={{ marginTop: 24 }}>
        <Space>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => setActiveSection('groups')}
          >
            创建群聊
          </Button>
          <Button
            icon={<IconBarChart />}
            onClick={() => setActiveSection('stats')}
          >
            查看统计
          </Button>
          <Button
            icon={<IconSetting />}
            onClick={() => setActiveSection('rules')}
          >
            管理规则
          </Button>
          <Button
            icon={<IconRefresh />}
            onClick={loadStats}
            loading={loading}
          >
            刷新数据
          </Button>
        </Space>
      </Card>
    </div>
  );

  // 渲染内容区域
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'groups':
        return <GroupList onGroupSelect={setSelectedGroup} />;
      case 'stats':
        return <GroupStats />;
      case 'rules':
        return <AutoGroupRules />;
      case 'settings':
        return (
          <div style={{ padding: 24 }}>
            <Title heading={3}>系统设置</Title>
            <Text type="tertiary">系统设置功能开发中...</Text>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <div style={{ padding: '20px 16px' }}>
          <Title heading={4} style={{ margin: 0, color: 'var(--semi-color-text-0)' }}>
            群聊管理
          </Title>
        </div>
        <Nav
          items={navItems}
          selectedKeys={[activeSection]}
          onSelect={({ itemKey }) => setActiveSection(itemKey as ActiveSection)}
          style={{ maxWidth: 220 }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          backgroundColor: 'var(--semi-color-bg-0)', 
          padding: '0 24px',
          borderBottom: '1px solid var(--semi-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <Title heading={4} style={{ margin: 0 }}>
              {navItems.find(item => item.itemKey === activeSection)?.text || '群聊管理'}
            </Title>
          </div>
          
          {selectedGroup && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text type="tertiary">当前选中:</Text>
              <Text strong>{selectedGroup.name}</Text>
            </div>
          )}
        </Header>
        
        <Content style={{ 
          backgroundColor: 'var(--semi-color-bg-0)',
          overflow: 'auto'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default GroupManagement;