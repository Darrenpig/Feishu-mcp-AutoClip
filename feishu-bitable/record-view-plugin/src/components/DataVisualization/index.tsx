import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Typography,
  Space,
  Tooltip,
  Progress,
  Tag
} from '@douyinfe/semi-ui';
import {
  IconRefresh,
  IconDownload,
  IconFilter,
  IconTrendingUp,
  IconUsers,
  IconMessage,
  IconTarget
} from '@douyinfe/semi-icons';
import './styles.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ChartData {
  date: string;
  customers: number;
  groups: number;
  messages: number;
  conversion: number;
}

interface MetricCard {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  unit?: string;
}

const DataVisualization: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const generateMockData = (): ChartData[] => {
    const data: ChartData[] = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        customers: Math.floor(Math.random() * 50) + 20,
        groups: Math.floor(Math.random() * 15) + 5,
        messages: Math.floor(Math.random() * 200) + 100,
        conversion: Math.floor(Math.random() * 30) + 60
      });
    }
    
    return data;
  };

  const metricCards: MetricCard[] = [
    {
      title: '新增客户',
      value: 1247,
      change: 12.5,
      icon: <IconUsers size="large" />,
      color: '#1890ff',
      unit: '人'
    },
    {
      title: '活跃群聊',
      value: 89,
      change: 8.2,
      icon: <IconMessage size="large" />,
      color: '#52c41a',
      unit: '个'
    },
    {
      title: '转化率',
      value: 68.5,
      change: -2.1,
      icon: <IconTarget size="large" />,
      color: '#fa8c16',
      unit: '%'
    },
    {
      title: '增长趋势',
      value: 15.8,
      change: 5.3,
      icon: <IconTrendingUp size="large" />,
      color: '#722ed1',
      unit: '%'
    }
  ];

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setChartData(generateMockData());
      setLoading(false);
    }, 1000);
  };

  const exportData = () => {
    const csvContent = [
      ['日期', '新增客户', '新建群聊', '消息数量', '转化率'],
      ...chartData.map(item => [
        item.date,
        item.customers,
        item.groups,
        item.messages,
        `${item.conversion}%`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `数据报表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    refreshData();
  }, [timeRange]);

  const renderMetricCard = (metric: MetricCard, index: number) => (
    <Col span={6} key={index}>
      <Card className="metric-card" hoverable>
        <div className="metric-header">
          <div className="metric-icon" style={{ color: metric.color }}>
            {metric.icon}
          </div>
          <div className="metric-change">
            <Tag 
              color={metric.change >= 0 ? 'green' : 'red'}
              size="small"
            >
              {metric.change >= 0 ? '+' : ''}{metric.change}%
            </Tag>
          </div>
        </div>
        <div className="metric-content">
          <Title heading={2} className="metric-value">
            {metric.value.toLocaleString()}
            <span className="metric-unit">{metric.unit}</span>
          </Title>
          <Text type="secondary" className="metric-title">
            {metric.title}
          </Text>
        </div>
        <div className="metric-progress">
          <Progress 
            percent={Math.min(metric.value / 20, 100)} 
            showInfo={false}
            stroke={metric.color}
            size="small"
          />
        </div>
      </Card>
    </Col>
  );

  const renderChart = () => (
    <div className="chart-container">
      <div className="chart-header">
        <Title heading={4}>数据趋势图</Title>
        <Text type="secondary">过去{timeRange === '7d' ? '7天' : timeRange === '30d' ? '30天' : '90天'}的数据变化</Text>
      </div>
      
      <div className="chart-content">
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#1890ff' }}></div>
            <span>新增客户</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#52c41a' }}></div>
            <span>新建群聊</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#fa8c16' }}></div>
            <span>消息数量</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#722ed1' }}></div>
            <span>转化率</span>
          </div>
        </div>
        
        <div className="chart-area">
          {chartData.map((item, index) => (
            <div key={index} className="chart-bar-group">
              <div className="chart-bars">
                <Tooltip content={`新增客户: ${item.customers}人`}>
                  <div 
                    className="chart-bar customers"
                    style={{ 
                      height: `${(item.customers / 70) * 100}%`,
                      backgroundColor: '#1890ff'
                    }}
                  ></div>
                </Tooltip>
                <Tooltip content={`新建群聊: ${item.groups}个`}>
                  <div 
                    className="chart-bar groups"
                    style={{ 
                      height: `${(item.groups / 20) * 100}%`,
                      backgroundColor: '#52c41a'
                    }}
                  ></div>
                </Tooltip>
                <Tooltip content={`消息数量: ${item.messages}条`}>
                  <div 
                    className="chart-bar messages"
                    style={{ 
                      height: `${(item.messages / 300) * 100}%`,
                      backgroundColor: '#fa8c16'
                    }}
                  ></div>
                </Tooltip>
                <Tooltip content={`转化率: ${item.conversion}%`}>
                  <div 
                    className="chart-bar conversion"
                    style={{ 
                      height: `${item.conversion}%`,
                      backgroundColor: '#722ed1'
                    }}
                  ></div>
                </Tooltip>
              </div>
              <div className="chart-label">
                {new Date(item.date).getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="data-visualization">
      <div className="visualization-header">
        <div className="header-content">
          <Title heading={3}>数据分析</Title>
          <Text type="secondary">实时监控客户获取和群聊活跃度</Text>
        </div>
        
        <div className="header-actions">
          <Space>
            <Select 
              value={timeRange} 
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Select.Option value="7d">近7天</Select.Option>
              <Select.Option value="30d">近30天</Select.Option>
              <Select.Option value="90d">近90天</Select.Option>
            </Select>
            
            <RangePicker 
              type="date"
              placeholder={['开始日期', '结束日期']}
            />
            
            <Button 
              icon={<IconFilter />} 
              theme="borderless"
            >
              筛选
            </Button>
            
            <Button 
              icon={<IconRefresh />} 
              onClick={refreshData}
              loading={loading}
              theme="borderless"
            >
              刷新
            </Button>
            
            <Button 
              icon={<IconDownload />} 
              onClick={exportData}
              theme="solid"
              type="primary"
            >
              导出
            </Button>
          </Space>
        </div>
      </div>

      <div className="visualization-content">
        {/* 指标卡片 */}
        <Row gutter={[16, 16]} className="metrics-row">
          {metricCards.map((metric, index) => renderMetricCard(metric, index))}
        </Row>

        {/* 图表区域 */}
        <Row gutter={[16, 16]} className="charts-row">
          <Col span={24}>
            <Card className="chart-card" loading={loading}>
              {renderChart()}
            </Card>
          </Col>
        </Row>

        {/* 详细数据表格 */}
        <Row gutter={[16, 16]} className="table-row">
          <Col span={12}>
            <Card title="客户来源分析" className="source-card">
              <div className="source-list">
                {[
                  { name: '官网注册', count: 456, percent: 36.6 },
                  { name: '社交媒体', count: 324, percent: 26.0 },
                  { name: '推荐邀请', count: 287, percent: 23.0 },
                  { name: '广告投放', count: 180, percent: 14.4 }
                ].map((source, index) => (
                  <div key={index} className="source-item">
                    <div className="source-info">
                      <Text strong>{source.name}</Text>
                      <Text type="secondary">{source.count}人</Text>
                    </div>
                    <div className="source-progress">
                      <Progress 
                        percent={source.percent} 
                        showInfo={false}
                        size="small"
                      />
                      <Text type="secondary">{source.percent}%</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="群聊活跃度排行" className="activity-card">
              <div className="activity-list">
                {[
                  { name: '产品交流群', members: 128, messages: 1456, activity: 92 },
                  { name: '技术支持群', members: 89, messages: 987, activity: 78 },
                  { name: '客户服务群', members: 156, messages: 2341, activity: 85 },
                  { name: '新用户引导群', members: 67, messages: 543, activity: 65 }
                ].map((group, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <Text strong>{group.name}</Text>
                      <Text type="secondary">{group.members}人 · {group.messages}条消息</Text>
                    </div>
                    <div className="activity-score">
                      <Progress 
                        percent={group.activity} 
                        showInfo={false}
                        size="small"
                        stroke={group.activity >= 80 ? '#52c41a' : group.activity >= 60 ? '#fa8c16' : '#f5222d'}
                      />
                      <Text type="secondary">{group.activity}%</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DataVisualization;