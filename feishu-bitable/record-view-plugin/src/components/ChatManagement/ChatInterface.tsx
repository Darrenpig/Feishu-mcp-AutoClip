import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layout,
  List,
  Card,
  Input,
  Button,
  Avatar,
  Badge,
  Tag,
  Dropdown,
  Modal,
  Form,
  Select,
  TextArea,
  Tooltip,
  Spin,
  Empty,
  Space,
  Typography,
  Divider,
  Upload,
  Popover
} from '@douyinfe/semi-ui';
import {
  IconSend,
  IconMore,
  IconClose,
  IconTransfer,
  IconStar,
  IconStarStroked,
  IconPhone,
  IconMail,
  IconAttachment,
  IconEmoji,
  IconImage,
  IconFile,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconUser,
  IconRobot,
  IconCustomerSupport
} from '@douyinfe/semi-icons';
import {
  ChatSession,
  ChatMessage,
  ChatAgent,
  QuickReply,
  KnowledgeItem,
  ChatStatus,
  SenderType,
  MessageType,
  ChatPriority,
  AgentStatus,
  WSMessageType,
  TypingStatus
} from '../../types/chat';
import chatService from '../../services/chatService';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

interface ChatInterfaceProps {
  agentId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agentId }) => {
  // 状态管理
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<ChatStatus[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(new Map());
  const [currentAgent, setCurrentAgent] = useState<ChatAgent | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // 表单实例
  const [transferForm] = Form.useForm();
  const [ratingForm] = Form.useForm();

  // 初始化
  useEffect(() => {
    initializeData();
    setupEventListeners();
    
    return () => {
      // 清理事件监听器
      chatService.off(WSMessageType.CHAT_MESSAGE, handleNewMessage);
      chatService.off(WSMessageType.CHAT_STATUS_CHANGE, handleChatStatusChange);
      chatService.off(WSMessageType.TYPING_START, handleTypingStart);
      chatService.off(WSMessageType.TYPING_END, handleTypingEnd);
    };
  }, []);

  // 当选中对话改变时，加载消息
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化数据
  const initializeData = async () => {
    setLoading(true);
    try {
      const [chatsResponse, agentsResponse, quickRepliesResponse] = await Promise.all([
        chatService.getChats({ agentId, page: 1, pageSize: 50 }),
        chatService.getAgents(),
        chatService.getQuickReplies()
      ]);
      
      setChats(chatsResponse.items);
      setAgents(agentsResponse);
      setQuickReplies(quickRepliesResponse);
      
      // 设置当前客服
      if (agentId) {
        const agent = agentsResponse.find(a => a.id === agentId);
        setCurrentAgent(agent || null);
      }
      
      // 默认选中第一个对话
      if (chatsResponse.items.length > 0) {
        setSelectedChat(chatsResponse.items[0]);
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 设置事件监听器
  const setupEventListeners = () => {
    chatService.on(WSMessageType.CHAT_MESSAGE, handleNewMessage);
    chatService.on(WSMessageType.CHAT_STATUS_CHANGE, handleChatStatusChange);
    chatService.on(WSMessageType.TYPING_START, handleTypingStart);
    chatService.on(WSMessageType.TYPING_END, handleTypingEnd);
  };

  // 处理新消息
  const handleNewMessage = useCallback((message: ChatMessage) => {
    if (selectedChat && message.chatId === selectedChat.id) {
      setMessages(prev => [...prev, message]);
    }
    
    // 更新对话列表中的最后消息
    setChats(prev => prev.map(chat => 
      chat.id === message.chatId 
        ? { 
            ...chat, 
            lastMessage: message.content.substring(0, 100),
            lastMessageTime: message.timestamp,
            unreadCount: chat.id === selectedChat?.id ? 0 : chat.unreadCount + 1
          }
        : chat
    ));
  }, [selectedChat]);

  // 处理对话状态变化
  const handleChatStatusChange = useCallback((data: { chatId: string; status: ChatStatus }) => {
    setChats(prev => prev.map(chat => 
      chat.id === data.chatId ? { ...chat, status: data.status } : chat
    ));
    
    if (selectedChat && selectedChat.id === data.chatId) {
      setSelectedChat(prev => prev ? { ...prev, status: data.status } : null);
    }
  }, [selectedChat]);

  // 处理打字状态
  const handleTypingStart = useCallback((data: TypingStatus) => {
    setTypingUsers(prev => {
      const newMap = new Map(prev);
      newMap.set(`${data.chatId}_${data.userId}`, data);
      return newMap;
    });
  }, []);

  const handleTypingEnd = useCallback((data: TypingStatus) => {
    setTypingUsers(prev => {
      const newMap = new Map(prev);
      newMap.delete(`${data.chatId}_${data.userId}`);
      return newMap;
    });
  }, []);

  // 加载消息
  const loadMessages = async (chatId: string) => {
    setMessagesLoading(true);
    try {
      const response = await chatService.getMessages({ chatId, page: 1, pageSize: 100 });
      setMessages(response.items);
      
      // 标记消息为已读
      const unreadMessageIds = response.items
        .filter(msg => !msg.isRead && msg.senderType !== SenderType.AGENT)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        await chatService.markAsRead(chatId, unreadMessageIds);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || sendingMessage) return;
    
    setSendingMessage(true);
    try {
      const message = {
        chatId: selectedChat.id,
        senderId: agentId || 'agent_001',
        senderType: SenderType.AGENT,
        senderName: currentAgent?.name || '客服',
        messageType: MessageType.TEXT,
        content: messageInput.trim(),
        isRead: false
      };
      
      await chatService.sendMessage(selectedChat.id, message);
      setMessageInput('');
      
      // 停止打字状态
      if (agentId) {
        chatService.stopTyping(selectedChat.id, agentId, currentAgent?.name || '客服');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setMessageInput(value);
    
    // 发送打字状态
    if (selectedChat && agentId && value.trim()) {
      chatService.startTyping(selectedChat.id, agentId, currentAgent?.name || '客服');
    }
  };

  // 选择对话
  const selectChat = (chat: ChatSession) => {
    setSelectedChat(chat);
    
    // 更新未读数量
    setChats(prev => prev.map(c => 
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  // 关闭对话
  const closeChat = async () => {
    if (!selectedChat) return;
    
    try {
      await chatService.closeChat(selectedChat.id, '客服主动关闭');
      setSelectedChat(null);
    } catch (error) {
      console.error('Failed to close chat:', error);
    }
  };

  // 转接对话
  const transferChat = async (values: any) => {
    if (!selectedChat) return;
    
    try {
      await chatService.transferChat(selectedChat.id, values.agentId, values.reason);
      setShowTransferModal(false);
      transferForm.reset();
    } catch (error) {
      console.error('Failed to transfer chat:', error);
    }
  };

  // 使用快捷回复
  const useQuickReply = (reply: QuickReply) => {
    setMessageInput(reply.content);
    setShowQuickReplies(false);
    messageInputRef.current?.focus();
  };

  // 搜索知识库
  const searchKnowledge = async (keyword: string) => {
    try {
      const items = await chatService.searchKnowledge(keyword);
      setKnowledgeItems(items);
    } catch (error) {
      console.error('Failed to search knowledge:', error);
    }
  };

  // 使用知识库内容
  const useKnowledgeItem = (item: KnowledgeItem) => {
    setMessageInput(item.content);
    setShowKnowledge(false);
    messageInputRef.current?.focus();
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 过滤对话
  const filteredChats = chats.filter(chat => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      if (!chat.customerName.toLowerCase().includes(keyword) &&
          !(chat.lastMessage && chat.lastMessage.toLowerCase().includes(keyword))) {
        return false;
      }
    }
    
    if (filterStatus.length > 0 && !filterStatus.includes(chat.status)) {
      return false;
    }
    
    return true;
  });

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

  // 获取发送者图标
  const getSenderIcon = (senderType: SenderType) => {
    switch (senderType) {
      case SenderType.CUSTOMER: return <IconUser />;
      case SenderType.BOT: return <IconRobot />;
      case SenderType.AGENT: return <IconCustomerSupport />;
      default: return <IconUser />;
    }
  };

  // 渲染对话列表项
  const renderChatItem = (chat: ChatSession) => {
    const isSelected = selectedChat?.id === chat.id;
    
    return (
      <List.Item
        key={chat.id}
        className={`chat-item ${isSelected ? 'selected' : ''}`}
        onClick={() => selectChat(chat)}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--semi-color-primary-light-default)' : 'transparent',
          borderLeft: isSelected ? '3px solid var(--semi-color-primary)' : '3px solid transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Badge count={chat.unreadCount} size="small">
            <Avatar size="small">
              {chat.customerName.charAt(0)}
            </Avatar>
          </Badge>
          
          <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text strong ellipsis style={{ maxWidth: '60%' }}>
                {chat.customerName}
              </Text>
              <Text size="small" type="tertiary">
                {new Date(chat.lastMessageTime).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <Tag size="small" color={getStatusColor(chat.status)}>
                {chat.status}
              </Tag>
              <Tag size="small" color={getPriorityColor(chat.priority)} style={{ marginLeft: 4 }}>
                {chat.priority}
              </Tag>
            </div>
            
            <Text size="small" type="tertiary" ellipsis style={{ marginTop: 4 }}>
              {chat.lastMessage || '暂无消息'}
            </Text>
          </div>
        </div>
      </List.Item>
    );
  };

  // 渲染消息项
  const renderMessage = (message: ChatMessage) => {
    const isAgent = message.senderType === SenderType.AGENT;
    const isSystem = message.senderType === SenderType.BOT && message.messageType === MessageType.SYSTEM;
    
    if (isSystem) {
      return (
        <div key={message.id} style={{ textAlign: 'center', margin: '16px 0' }}>
          <Text size="small" type="tertiary">
            {message.content}
          </Text>
        </div>
      );
    }
    
    return (
      <div
        key={message.id}
        style={{
          display: 'flex',
          justifyContent: isAgent ? 'flex-end' : 'flex-start',
          marginBottom: 16
        }}
      >
        {!isAgent && (
          <Avatar size="small" style={{ marginRight: 8 }}>
            {getSenderIcon(message.senderType)}
          </Avatar>
        )}
        
        <div style={{ maxWidth: '70%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Text size="small" type="tertiary">
              {message.senderName}
            </Text>
            <Text size="small" type="tertiary" style={{ marginLeft: 8 }}>
              {new Date(message.timestamp).toLocaleTimeString('zh-CN')}
            </Text>
          </div>
          
          <Card
            bodyStyle={{
              padding: '8px 12px',
              backgroundColor: isAgent 
                ? 'var(--semi-color-primary)' 
                : 'var(--semi-color-fill-0)',
              color: isAgent ? 'white' : 'inherit'
            }}
          >
            <Text style={{ color: 'inherit' }}>
              {message.content}
            </Text>
          </Card>
        </div>
        
        {isAgent && (
          <Avatar size="small" style={{ marginLeft: 8 }}>
            {getSenderIcon(message.senderType)}
          </Avatar>
        )}
      </div>
    );
  };

  // 渲染打字状态
  const renderTypingIndicator = () => {
    if (!selectedChat) return null;
    
    const chatTypingUsers = Array.from(typingUsers.values())
      .filter(user => user.chatId === selectedChat.id && user.isTyping);
    
    if (chatTypingUsers.length === 0) return null;
    
    return (
      <div style={{ padding: '8px 16px', backgroundColor: 'var(--semi-color-fill-0)' }}>
        <Text size="small" type="tertiary">
          {chatTypingUsers.map(user => user.userName).join(', ')} 正在输入...
        </Text>
      </div>
    );
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* 对话列表 */}
      <Sider width={320} style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <Header style={{ padding: '16px', backgroundColor: 'var(--semi-color-bg-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title heading={5} style={{ margin: 0 }}>对话列表</Title>
            <Button
              icon={<IconRefresh />}
              size="small"
              onClick={initializeData}
              loading={loading}
            />
          </div>
          
          <div style={{ marginTop: 12 }}>
            <Input
              prefix={<IconSearch />}
              placeholder="搜索对话..."
              value={searchKeyword}
              onChange={setSearchKeyword}
              style={{ marginBottom: 8 }}
            />
            
            <Select
              multiple
              placeholder="筛选状态"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
            >
              <Select.Option value={ChatStatus.WAITING}>等待中</Select.Option>
              <Select.Option value={ChatStatus.ACTIVE}>进行中</Select.Option>
              <Select.Option value={ChatStatus.TRANSFERRED}>已转接</Select.Option>
              <Select.Option value={ChatStatus.CLOSED}>已关闭</Select.Option>
              <Select.Option value={ChatStatus.TIMEOUT}>超时</Select.Option>
            </Select>
          </div>
        </Header>
        
        <Content style={{ padding: 0, overflow: 'auto' }}>
          <Spin spinning={loading}>
            {filteredChats.length > 0 ? (
              <List
                dataSource={filteredChats}
                renderItem={renderChatItem}
                split={false}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无对话"
                style={{ padding: '40px 20px' }}
              />
            )}
          </Spin>
        </Content>
      </Sider>
      
      {/* 消息区域 */}
      <Layout>
        {selectedChat ? (
          <>
            {/* 对话头部 */}
            <Header style={{ 
              padding: '16px 24px', 
              backgroundColor: 'var(--semi-color-bg-2)',
              borderBottom: '1px solid var(--semi-color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar size="small">
                    {selectedChat.customerName.charAt(0)}
                  </Avatar>
                  <div style={{ marginLeft: 12 }}>
                    <Title heading={6} style={{ margin: 0 }}>
                      {selectedChat.customerName}
                    </Title>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      <Tag size="small" color={getStatusColor(selectedChat.status)}>
                        {selectedChat.status}
                      </Tag>
                      <Tag size="small" color={getPriorityColor(selectedChat.priority)} style={{ marginLeft: 4 }}>
                        {selectedChat.priority}
                      </Tag>
                      {selectedChat.agentName && (
                        <Text size="small" type="tertiary" style={{ marginLeft: 8 }}>
                          客服：{selectedChat.agentName}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
                
                <Space>
                  {selectedChat.customerPhone && (
                    <Tooltip content="拨打电话">
                      <Button
                        icon={<IconPhone />}
                        size="small"
                        onClick={() => window.open(`tel:${selectedChat.customerPhone}`)}
                      />
                    </Tooltip>
                  )}
                  
                  {selectedChat.customerEmail && (
                    <Tooltip content="发送邮件">
                      <Button
                        icon={<IconMail />}
                        size="small"
                        onClick={() => window.open(`mailto:${selectedChat.customerEmail}`)}
                      />
                    </Tooltip>
                  )}
                  
                  <Dropdown
                    trigger="click"
                    render={
                      <Dropdown.Menu>
                        <Dropdown.Item
                          icon={<IconTransfer />}
                          onClick={() => setShowTransferModal(true)}
                        >
                          转接对话
                        </Dropdown.Item>
                        <Dropdown.Item
                          icon={<IconStar />}
                          onClick={() => setShowRatingModal(true)}
                        >
                          评价对话
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          icon={<IconClose />}
                          type="danger"
                          onClick={closeChat}
                        >
                          关闭对话
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    }
                  >
                    <Button icon={<IconMore />} size="small" />
                  </Dropdown>
                </Space>
              </div>
            </Header>
            
            {/* 消息列表 */}
            <Content style={{ 
              padding: '16px 24px', 
              overflow: 'auto',
              backgroundColor: 'var(--semi-color-bg-0)'
            }}>
              <Spin spinning={messagesLoading}>
                {messages.length > 0 ? (
                  <div>
                    {messages.map(renderMessage)}
                    {renderTypingIndicator()}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无消息"
                    style={{ marginTop: '20%' }}
                  />
                )}
              </Spin>
            </Content>
            
            {/* 消息输入区 */}
            <div style={{ 
              padding: '16px 24px', 
              backgroundColor: 'var(--semi-color-bg-1)',
              borderTop: '1px solid var(--semi-color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Popover
                      content={
                        <div style={{ width: 300, maxHeight: 200, overflow: 'auto' }}>
                          <Input
                            placeholder="搜索快捷回复..."
                            style={{ marginBottom: 8 }}
                          />
                          <List
                            size="small"
                            dataSource={quickReplies}
                            renderItem={(reply) => (
                              <List.Item
                                onClick={() => useQuickReply(reply)}
                                style={{ cursor: 'pointer', padding: '8px 12px' }}
                              >
                                <div>
                                  <Text strong>{reply.title}</Text>
                                  <br />
                                  <Text size="small" type="tertiary" ellipsis>
                                    {reply.content}
                                  </Text>
                                </div>
                              </List.Item>
                            )}
                          />
                        </div>
                      }
                      trigger="click"
                      visible={showQuickReplies}
                      onVisibleChange={setShowQuickReplies}
                    >
                      <Button size="small" type="tertiary">
                        快捷回复
                      </Button>
                    </Popover>
                    
                    <Popover
                      content={
                        <div style={{ width: 400, maxHeight: 300, overflow: 'auto' }}>
                          <Input
                            placeholder="搜索知识库..."
                            onChange={(value) => searchKnowledge(value)}
                            style={{ marginBottom: 8 }}
                          />
                          <List
                            size="small"
                            dataSource={knowledgeItems}
                            renderItem={(item) => (
                              <List.Item
                                onClick={() => useKnowledgeItem(item)}
                                style={{ cursor: 'pointer', padding: '8px 12px' }}
                              >
                                <div>
                                  <Text strong>{item.title}</Text>
                                  <br />
                                  <Text size="small" type="tertiary" ellipsis>
                                    {item.content}
                                  </Text>
                                </div>
                              </List.Item>
                            )}
                          />
                        </div>
                      }
                      trigger="click"
                      visible={showKnowledge}
                      onVisibleChange={setShowKnowledge}
                    >
                      <Button size="small" type="tertiary" style={{ marginLeft: 8 }}>
                        知识库
                      </Button>
                    </Popover>
                    
                    <Button size="small" type="tertiary" style={{ marginLeft: 8 }}>
                      <IconAttachment />
                    </Button>
                    
                    <Button size="small" type="tertiary" style={{ marginLeft: 8 }}>
                      <IconEmoji />
                    </Button>
                  </div>
                  
                  <TextArea
                    ref={messageInputRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="输入消息..."
                    autosize={{ minRows: 2, maxRows: 4 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                
                <Button
                  type="primary"
                  icon={<IconSend />}
                  onClick={sendMessage}
                  loading={sendingMessage}
                  disabled={!messageInput.trim()}
                  style={{ alignSelf: 'flex-end' }}
                >
                  发送
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Content style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'var(--semi-color-bg-0)'
          }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="请选择一个对话开始聊天"
            />
          </Content>
        )}
      </Layout>
      
      {/* 转接对话模态框 */}
      <Modal
        title="转接对话"
        visible={showTransferModal}
        onCancel={() => setShowTransferModal(false)}
        onOk={() => transferForm.submit()}
        okText="确认转接"
        cancelText="取消"
      >
        <Form
          form={transferForm}
          onSubmit={transferChat}
          labelPosition="top"
        >
          <Form.Select
            field="agentId"
            label="选择客服"
            placeholder="请选择要转接的客服"
            rules={[{ required: true, message: '请选择客服' }]}
          >
            {agents
              .filter(agent => agent.status === AgentStatus.ONLINE && agent.id !== agentId)
              .map(agent => (
                <Form.Select.Option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.department})
                </Form.Select.Option>
              ))
            }
          </Form.Select>
          
          <Form.TextArea
            field="reason"
            label="转接原因"
            placeholder="请输入转接原因（可选）"
            maxCount={200}
          />
        </Form>
      </Modal>
      
      {/* 评价对话模态框 */}
      <Modal
        title="对话评价"
        visible={showRatingModal}
        onCancel={() => setShowRatingModal(false)}
        onOk={() => ratingForm.submit()}
        okText="提交评价"
        cancelText="取消"
      >
        <Form
          form={ratingForm}
          onSubmit={(values) => {
            console.log('Rating submitted:', values);
            setShowRatingModal(false);
            ratingForm.reset();
          }}
          labelPosition="top"
        >
          <Form.Rating
            field="rating"
            label="满意度评分"
            rules={[{ required: true, message: '请选择评分' }]}
          />
          
          <Form.TextArea
            field="comment"
            label="评价内容"
            placeholder="请输入评价内容（可选）"
            maxCount={500}
          />
          
          <Form.TagInput
            field="tags"
            label="评价标签"
            placeholder="添加评价标签"
          />
        </Form>
      </Modal>
    </Layout>
  );
};

export default ChatInterface;