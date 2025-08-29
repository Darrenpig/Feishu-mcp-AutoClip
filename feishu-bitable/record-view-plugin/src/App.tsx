import React, { useEffect, useState } from 'react';
import { Layout, Nav, Button, Breadcrumb, Skeleton, Avatar } from '@douyinfe/semi-ui';
import { IconSemiLogo, IconBell, IconHelpCircle, IconBytedanceLogo, IconHome, IconHistogram, IconLive, IconSetting, IconUsers, IconMessage, IconRobot, IconCustomerSupport, IconChartPie, IconBarChart } from '@douyinfe/semi-icons';
import { getTableData } from './utils';
import { RenderFuncMap } from './render_helper';
import CustomerManagement from './components/CustomerManagement';
import GroupManagement from './components/GroupManagement';
import BotManagement from './components/BotManagement';
import ChatManagement from './components/ChatManagement';
import Analytics from './components/Analytics';
import AIConfig from './components/AIConfig';
import ModernHome from './components/ModernHome';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationSystem from './components/NotificationSystem';
import DataVisualization from './components/DataVisualization';

const { Header, Footer, Sider, Content } = Layout;

type ActivePage = 'home' | 'customers' | 'groups' | 'bot' | 'chat' | 'data' | 'settings' | 'analytics' | 'ai-config' | 'data-analysis';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<ActivePage>('home');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tableData = await getTableData();
        setData(tableData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case 'customers':
        return <CustomerManagement />;
      case 'groups':
        return <GroupManagement />;
      case 'bot':
        return <BotManagement />;
      case 'chat':
        return <ChatManagement />;
      case 'analytics':
        return <Analytics />;
      case 'ai-config':
        return <AIConfig />;
      case 'data-analysis':
        return <DataVisualization />;
      case 'data':
        return (
          <div>
            <h2>多维表格数据</h2>
            {loading ? (
              <Skeleton placeholder={<Skeleton.Paragraph rows={8} />} loading={loading}>
              </Skeleton>
            ) : (
              data.map((record, index) => (
                <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e8e8e8', borderRadius: '6px' }}>
                  {Object.entries(record).map(([fieldName, fieldValue]) => {
                    const renderFunc = RenderFuncMap[fieldValue?.type];
                    return (
                      <div key={fieldName} style={{ marginBottom: '8px' }}>
                        <strong>{fieldName}: </strong>
                        {renderFunc ? renderFunc(fieldValue) : JSON.stringify(fieldValue)}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2>系统设置</h2>
            <p>系统设置功能开发中...</p>
          </div>
        );
      default:
        return <ModernHome onNavigate={setActivePage} />;
    }
  };

  const getBreadcrumbRoutes = () => {
    const routeMap = {
      home: ['首页'],
      customers: ['首页', '客户管理'],
      groups: ['首页', '群聊管理'],
      bot: ['首页', '机器人管理'],
      chat: ['首页', '智能客服'],
      'ai-config': ['首页', 'AI配置'],
       'data-analysis': ['首页', '数据分析'],
      data: ['首页', '基础数据'],
      settings: ['首页', '系统设置']
    };
    return routeMap[activePage] || ['首页'];
  };

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <Layout style={{ border: '1px solid var(--semi-color-border)' }}>
      <Header style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <div>
          <Nav mode="horizontal" selectedKeys={[activePage]} onSelect={({ itemKey }) => setActivePage(itemKey as ActivePage)}>
            <Nav.Header>
              <IconSemiLogo style={{ fontSize: 36 }} />
            </Nav.Header>
            <Nav.Item itemKey="home" text="首页" icon={<IconHome size="large" />} />
            <Nav.Item itemKey="customers" text="客户管理" icon={<IconUsers size="large" />} />
            <Nav.Item itemKey="groups" text="群聊管理" icon={<IconMessage size="large" />} />
            <Nav.Item itemKey="bot" text="机器人管理" icon={<IconRobot size="large" />} />
            <Nav.Item itemKey="chat" text="智能客服" icon={<IconCustomerSupport size="large" />} />
             <Nav.Item itemKey="ai-config" text="AI配置" icon={<IconSetting size="large" />} />
             <Nav.Item itemKey="data-analysis" text="数据分析" icon={<IconBarChart size="large" />} />
            <Nav.Item itemKey="data" text="基础数据" icon={<IconHistogram size="large" />} />
            <Nav.Item itemKey="settings" text="系统设置" icon={<IconSetting size="large" />} />
            <Nav.Footer>
              <Button
                theme="borderless"
                icon={<IconBell size="large" />}
                style={{
                  color: 'var(--semi-color-text-2)',
                  marginRight: '12px',
                }}
              />
              <Button
                theme="borderless"
                icon={<IconHelpCircle size="large" />}
                style={{
                  color: 'var(--semi-color-text-2)',
                  marginRight: '12px',
                }}
              />
              <Avatar color="orange" size="small">
                YJ
              </Avatar>
            </Nav.Footer>
          </Nav>
        </div>
      </Header>
      <Content
        style={{
          padding: activePage === 'customers' || activePage === 'groups' || activePage === 'bot' || activePage === 'chat' || activePage === 'analytics' || activePage === 'ai-config' || activePage === 'data-analysis' ? '0' : '24px',
          backgroundColor: 'var(--semi-color-bg-0)',
        }}
      >
        {(activePage === 'customers' || activePage === 'groups' || activePage === 'bot' || activePage === 'chat' || activePage === 'analytics' || activePage === 'ai-config' || activePage === 'data-analysis') ? null : (
          <Breadcrumb
            style={{
              marginBottom: '24px',
            }}
            routes={getBreadcrumbRoutes()}
          />
        )}
        <div
          style={{
            borderRadius: activePage === 'customers' || activePage === 'groups' || activePage === 'bot' || activePage === 'chat' || activePage === 'analytics' || activePage === 'ai-config' || activePage === 'data-analysis' ? '0' : '10px',
            border: activePage === 'customers' || activePage === 'groups' || activePage === 'bot' || activePage === 'chat' || activePage === 'analytics' || activePage === 'ai-config' || activePage === 'data-analysis' ? 'none' : '1px solid var(--semi-color-border)',
            height: activePage === 'customers' || activePage === 'groups' || activePage === 'bot' || activePage === 'chat' || activePage === 'analytics' || activePage === 'ai-config' || activePage === 'data-analysis' ? 'calc(100vh - 60px)' : '376px',
            padding: activePage === 'customers' || activePage === 'groups' || activePage === 'bot' || activePage === 'chat' || activePage === 'analytics' || activePage === 'ai-config' || activePage === 'data-analysis' ? '0' : '32px',
            overflow: 'auto'
          }}
        >
          {renderContent()}
        </div>
      </Content>
      <Footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '20px',
          color: 'var(--semi-color-text-2)',
          backgroundColor: 'rgba(var(--semi-grey-0), 1)',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconBytedanceLogo size="large" style={{ marginRight: '8px' }} />
          <span>Copyright © 2022 ByteDance. All Rights Reserved. </span>
        </span>
        <span>
          <span style={{ marginRight: '24px' }}>平台客服</span>
          <span>反馈建议</span>
        </span>
      </Footer>
      </Layout>
      <NotificationSystem position="topRight" maxCount={5} />
    </ErrorBoundary>
  );
}

export default App;
