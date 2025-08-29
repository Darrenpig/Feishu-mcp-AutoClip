// 现代化主页组件 - 参考AutoClip的设计理念
import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Progress,
  Badge,
  Avatar,
  Divider,
  Tag,
  Tooltip,
  Empty,
  Spin
} from '@douyinfe/semi-ui';
import {
  IconUser,
  IconUserGroup,
  IconRobot,
  IconChartPie,
  IconSetting,
  IconPlay,
  IconArrowRight,
  IconStar,
  IconTrendingUp,
  IconActivity,
  IconTarget,
  IconBolt,
  IconShield
} from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

interface ModernHomeProps {
  onNavigate?: (page: string) => void;
}

interface StatsData {
  totalCustomers: number;
  activeGroups: number;
  todayMessages: number;
  conversionRate: number;
  aiProcessed: number;
  successRate: number;
}

interface RecentActivity {
  id: string;
  type: 'customer' | 'group' | 'ai' | 'message';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'processing' | 'warning';
}

const ModernHome: React.FC<ModernHomeProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalCustomers: 0,
    activeGroups: 0,
    todayMessages: 0,
    conversionRate: 0,
    aiProcessed: 0,
    successRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // 模拟数据加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalCustomers: 1247,
        activeGroups: 38,
        todayMessages: 156,
        conversionRate: 23.5,
        aiProcessed: 89,
        successRate: 95.2
      });
      
      setRecentActivities([
        {
          id: '1',
          type: 'customer',
          title: '新客户注册',
          description: '张三通过官网注册成为潜在客户',
          time: '2分钟前',
          status: 'success'
        },
        {
          id: '2',
          type: 'ai',
          title: 'AI智能分析',
          description: '完成15个客户的智能画像分析',
          time: '5分钟前',
          status: 'success'
        },
        {
          id: '3',
          type: 'group',
          title: '自动拉群',
          description: '为高意向客户创建专属服务群',
          time: '8分钟前',
          status: 'processing'
        },
        {
          id: '4',
          type: 'message',
          title: '智能回复',
          description: 'AI自动回复了12条客户咨询',
          time: '15分钟前',
          status: 'success'
        }
      ]);
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  // 获取活动类型图标
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <IconUser style={{ color: '#1890ff' }} />;
      case 'group':
        return <IconUserGroup style={{ color: '#52c41a' }} />;
      case 'ai':
        return <IconRobot style={{ color: '#722ed1' }} />;
      case 'message':
        return <IconActivity style={{ color: '#fa8c16' }} />;
      default:
        return <IconActivity />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'processing':
        return 'blue';
      case 'warning':
        return 'orange';
      default:
        return 'grey';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '32px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* 头部欢迎区域 */}
      <div style={{ 
        marginBottom: '32px',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title 
          heading={1} 
          style={{ 
            color: 'white', 
            marginBottom: '16px',
            fontSize: '48px',
            fontWeight: 'bold'
          }}
        >
          飞书智能获客系统
        </Title>
        <Text 
          size="large" 
          style={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '18px'
          }}
        >
          AI驱动的全流程自动化客户管理平台
        </Text>
        <div style={{ marginTop: '24px' }}>
          <Tag size="large" color="white" style={{ margin: '0 8px' }}>
            <IconBolt style={{ marginRight: '4px' }} />
            智能高效
          </Tag>
          <Tag size="large" color="white" style={{ margin: '0 8px' }}>
            <IconShield style={{ marginRight: '4px' }} />
            安全可靠
          </Tag>
          <Tag size="large" color="white" style={{ margin: '0 8px' }}>
            <IconTarget style={{ marginRight: '4px' }} />
            精准获客
          </Tag>
        </div>
      </div>

      {/* 核心数据统计 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col span={8}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#1890ff',
                marginBottom: '8px'
              }}>
                {stats.totalCustomers.toLocaleString()}
              </div>
              <Text type="secondary" size="large">总客户数</Text>
              <div style={{ marginTop: '12px' }}>
                <Progress 
                  percent={75} 
                  showInfo={false} 
                  stroke="#1890ff"
                  size="small"
                />
                <Text size="small" type="secondary">较上月增长 +15%</Text>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#52c41a',
                marginBottom: '8px'
              }}>
                {stats.activeGroups}
              </div>
              <Text type="secondary" size="large">活跃群聊</Text>
              <div style={{ marginTop: '12px' }}>
                <Progress 
                  percent={85} 
                  showInfo={false} 
                  stroke="#52c41a"
                  size="small"
                />
                <Text size="small" type="secondary">活跃度 85%</Text>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#722ed1',
                marginBottom: '8px'
              }}>
                {stats.successRate}%
              </div>
              <Text type="secondary" size="large">AI成功率</Text>
              <div style={{ marginTop: '12px' }}>
                <Progress 
                  percent={stats.successRate} 
                  showInfo={false} 
                  stroke="#722ed1"
                  size="small"
                />
                <Text size="small" type="secondary">今日处理 {stats.aiProcessed} 次</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 快速操作面板 */}
        <Col span={16}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconPlay style={{ marginRight: '8px', color: '#1890ff' }} />
                <span>快速操作</span>
              </div>
            }
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card 
                  hoverable
                  onClick={() => onNavigate?.('customers')}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <Avatar 
                      style={{ backgroundColor: '#1890ff', marginRight: '12px' }}
                      icon={<IconUser />}
                    />
                    <div>
                      <Title heading={5} style={{ margin: 0 }}>客户管理</Title>
                      <Text type="secondary" size="small">管理客户信息和沟通记录</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge count={12} overflowCount={99}>
                      <Text>待跟进客户</Text>
                    </Badge>
                    <IconArrowRight style={{ color: '#1890ff' }} />
                  </div>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card 
                  hoverable
                  onClick={() => onNavigate?.('groups')}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <Avatar 
                      style={{ backgroundColor: '#52c41a', marginRight: '12px' }}
                      icon={<IconUserGroup />}
                    />
                    <div>
                      <Title heading={5} style={{ margin: 0 }}>群聊管理</Title>
                      <Text type="secondary" size="small">自动拉群和群聊运营</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge count={5} overflowCount={99}>
                      <Text>待处理群聊</Text>
                    </Badge>
                    <IconArrowRight style={{ color: '#52c41a' }} />
                  </div>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card 
                  hoverable
                  onClick={() => onNavigate?.('ai-config')}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <Avatar 
                      style={{ backgroundColor: '#722ed1', marginRight: '12px' }}
                      icon={<IconRobot />}
                    />
                    <div>
                      <Title heading={5} style={{ margin: 0 }}>AI配置</Title>
                      <Text type="secondary" size="small">智能分析和自动化设置</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="purple">智能模式</Tag>
                    <IconArrowRight style={{ color: '#722ed1' }} />
                  </div>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card 
                  hoverable
                  onClick={() => onNavigate?.('analytics')}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <Avatar 
                      style={{ backgroundColor: '#fa8c16', marginRight: '12px' }}
                      icon={<IconChartPie />}
                    />
                    <div>
                      <Title heading={5} style={{ margin: 0 }}>数据分析</Title>
                      <Text type="secondary" size="small">获客效果和运营数据</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IconTrendingUp style={{ color: '#52c41a', marginRight: '4px' }} />
                      <Text style={{ color: '#52c41a' }}>+23.5%</Text>
                    </div>
                    <IconArrowRight style={{ color: '#fa8c16' }} />
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        
        {/* 最近活动 */}
        <Col span={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconActivity style={{ marginRight: '8px', color: '#52c41a' }} />
                <span>最近活动</span>
              </div>
            }
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              height: '400px'
            }}
            bodyStyle={{ padding: '16px', height: '320px', overflowY: 'auto' }}
          >
            {recentActivities.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                {recentActivities.map((activity, index) => (
                  <div key={activity.id}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <div style={{ marginRight: '12px', marginTop: '2px' }}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <Text strong size="small">{activity.title}</Text>
                          <Badge 
                            dot 
                            style={{ backgroundColor: getStatusColor(activity.status) }}
                          />
                        </div>
                        <Text type="secondary" size="small" style={{ display: 'block', marginBottom: '4px' }}>
                          {activity.description}
                        </Text>
                        <Text type="tertiary" size="small">{activity.time}</Text>
                      </div>
                    </div>
                    {index < recentActivities.length - 1 && (
                      <Divider style={{ margin: '12px 0' }} />
                    )}
                  </div>
                ))}
              </Space>
            ) : (
              <Empty 
                description="暂无活动记录"
                style={{ marginTop: '60px' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 底部功能亮点 */}
      <Card 
        style={{ 
          marginTop: '32px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title heading={3} style={{ marginBottom: '8px' }}>核心功能亮点</Title>
          <Text type="secondary">参考AutoClip设计理念，打造智能化客户管理体验</Text>
        </div>
        
        <Row gutter={[32, 24]}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <IconRobot style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <Title heading={5} style={{ marginBottom: '8px' }}>AI智能分析</Title>
              <Text type="secondary" size="small">
                基于大语言模型的客户画像分析，自动识别高价值客户
              </Text>
            </div>
          </Col>
          
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <IconUserGroup style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <Title heading={5} style={{ marginBottom: '8px' }}>自动拉群</Title>
              <Text type="secondary" size="small">
                智能匹配客户需求，自动创建专属服务群，提升转化效率
              </Text>
            </div>
          </Col>
          
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <IconActivity style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <Title heading={5} style={{ marginBottom: '8px' }}>实时监控</Title>
              <Text type="secondary" size="small">
                全流程数据监控，实时掌握获客效果和客户动态
              </Text>
            </div>
          </Col>
          
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <IconStar style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <Title heading={5} style={{ marginBottom: '8px' }}>智能推荐</Title>
              <Text type="secondary" size="small">
                AI驱动的个性化推荐，精准匹配客户需求和产品服务
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ModernHome;