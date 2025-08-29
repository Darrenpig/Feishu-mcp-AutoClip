import React, { useState } from 'react';
import { Layout, Nav, Button, Badge, Message, Tooltip, Progress } from '@douyinfe/semi-ui';
import {
  IconUser,
  IconUserGroup,
  IconBarChart,
  IconSetting,
  IconImport,
  IconExport,
} from '@douyinfe/semi-icons';
import { Customer } from '../../types/customer';
import aiService, { CustomerAIAnalysis } from '../../services/aiService';
import CustomerList from './CustomerList';
import CustomerStats from './CustomerStats';
import GroupManagement from '../GroupManagement';
import Settings from './Settings';

const { Sider, Content } = Layout;

// 菜单项配置
const MENU_ITEMS = [
  {
    itemKey: 'customers',
    text: '客户管理',
    icon: <IconUser />,
  },
  {
    itemKey: 'groups',
    text: '群聊管理',
    icon: <IconUserGroup />,
  },
  {
    itemKey: 'stats',
    text: '数据统计',
    icon: <IconBarChart />,
  },
  {
    itemKey: 'settings',
    text: '系统设置',
    icon: <IconSetting />,
  },
];

interface CustomerManagementProps {
  onCreateGroup?: (customer: Customer) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ onCreateGroup }) => {
  const [activeKey, setActiveKey] = useState('customers');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pendingGroupCreations, setPendingGroupCreations] = useState<Customer[]>([]);

  // 处理菜单选择
  const handleMenuSelect = (data: any) => {
    setActiveKey(data.itemKey);
  };

  // 处理客户选择
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  // 处理创建群聊
  const handleCreateGroup = (customer: Customer) => {
    // 添加到待处理列表
    setPendingGroupCreations(prev => {
      if (prev.find(c => c.id === customer.id)) {
        Message.warning('该客户已在群聊创建队列中');
        return prev;
      }
      return [...prev, customer];
    });

    // 切换到群聊管理页面
    setActiveKey('groups');
    
    // 调用外部回调
    if (onCreateGroup) {
      onCreateGroup(customer);
    }

    Message.success(`已将客户 ${customer.name} 添加到群聊创建队列`);
  };

  // 处理群聊创建完成
  const handleGroupCreated = (customer: Customer) => {
    setPendingGroupCreations(prev => prev.filter(c => c.id !== customer.id));
    Message.success(`已为客户 ${customer.name} 创建群聊`);
  };

  // 渲染内容区域
  const renderContent = () => {
    switch (activeKey) {
      case 'customers':
        return (
          <CustomerList
            onCustomerSelect={handleCustomerSelect}
            onCreateGroup={handleCreateGroup}
          />
        );
      case 'groups':
        return (
          <GroupManagement
            pendingCustomers={pendingGroupCreations}
            onGroupCreated={handleGroupCreated}
            selectedCustomer={selectedCustomer}
          />
        );
      case 'stats':
        return <CustomerStats />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  // 获取菜单项的徽章
  const getMenuBadge = (itemKey: string) => {
    if (itemKey === 'groups' && pendingGroupCreations.length > 0) {
      return (
        <Badge
          count={pendingGroupCreations.length}
          type="danger"
          size="small"
        />
      );
    }
    return null;
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <div style={{ padding: '20px 16px' }}>
          <h3 style={{ margin: 0, color: 'var(--semi-color-text-0)' }}>
            自动获客拉群
          </h3>
        </div>
        
        <Nav
          style={{ maxWidth: 220, height: '100%' }}
          defaultSelectedKeys={['customers']}
          selectedKeys={[activeKey]}
          onSelect={handleMenuSelect}
          items={MENU_ITEMS.map(item => ({
            ...item,
            text: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{item.text}</span>
                {getMenuBadge(item.itemKey)}
              </div>
            ),
          }))}
          footer={{
            collapseButton: true,
          }}
        />
      </Sider>
      
      <Content
        style={{
          padding: 0,
          backgroundColor: 'var(--semi-color-bg-0)',
          overflow: 'auto',
        }}
      >
        {renderContent()}
      </Content>
    </Layout>
  );
};

export default CustomerManagement;