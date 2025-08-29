import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Table,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  TextArea,
  Toast,
  Empty,
  Spin,
  Divider,
  List,
  Badge
} from '@douyinfe/semi-ui';
import {
  IconSearch,
  IconRefresh,
  IconMessage,
  IconSend,
  IconUser,
  IconRobot,
  IconMore,
  IconReply,
  IconCopy,
  IconDelete
} from '@douyinfe/semi-icons';
import botService from '../../services/botService';
import {
  Message,
  MessageType,
  ChatType,
  SenderType
} from '../../types/bot';

const { Title, Text } = Typography;
const { Option } = Select;

interface MessageHistoryProps {
  chatId?: string;
}

interface MessageFilter {
  chatId?: string;
  messageType?: MessageType;
  senderType?: SenderType;
  keyword?: string;
  dateRange?: [Date, Date];
}

interface ChatInfo {
  chat_id: string;
  name: string;
  chat_type: ChatType;
  member_count: number;
  avatar?: string;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({ chatId }) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | undefined>(chatId);
  const [filter, setFilter] = useState<MessageFilter>({});
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [replyForm] = Form.useForm();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      // TODO: 实现获取群聊列表的API
      // 这里使用模拟数据
      const mockChats: ChatInfo[] = [
        {
          chat_id: 'chat_001',
          name: '产品咨询群',
          chat_type: ChatType.GROUP,
          member_count: 25,
          avatar: ''
        },
        {
          chat_id: 'chat_002',
          name: '技术支持群',
          chat_type: ChatType.GROUP,
          member_count: 18,
          avatar: ''
        },
        {
          chat_id: 'chat_003',
          name: '客户服务',
          chat_type: ChatType.P2P,
          member_count: 2,
          avatar: ''
        }
      ];
      setChats(mockChats);
      
      if (!selectedChat && mockChats.length > 0) {
        setSelectedChat(mockChats[0].chat_id);
      }
    } catch (error) {
      console.error('加载群聊列表失败:', error);
      Toast.error('加载群聊列表失败');
    }
  };

  const loadMessages = async (chatId: string) => {
    setLoading(true);
    try {
      const response = await botService.getMessageHistory(chatId);
      if (response.data && response.data.items) {
        setMessages(response.data.items);
        scrollToBottom();
      }
    } catch (error) {
      console.error('加载消息历史失败:', error);
      Toast.error('加载消息历史失败');
      // 使用模拟数据
      const mockMessages: Message[] = [
        {
          message_id: 'msg_001',
          chat_id: chatId,
          chat_type: ChatType.GROUP,
          message_type: MessageType.TEXT,
          content: JSON.stringify({ text: '你好，请问有什么可以帮助您的吗？' }),
          create_time: '2024-01-15T10:30:00Z',
          update_time: '2024-01-15T10:30:00Z',
          sender: {
            sender_id: 'user_001',
            sender_type: SenderType.USER,
            tenant_key: 'tenant_001'
          },
          mentions: []
        },
        {
          message_id: 'msg_002',
          chat_id: chatId,
          chat_type: ChatType.GROUP,
          message_type: MessageType.TEXT,
          content: JSON.stringify({ text: '您好！我是智能客服助手，很高兴为您服务。请问您需要了解什么产品信息呢？' }),
          create_time: '2024-01-15T10:30:30Z',
          update_time: '2024-01-15T10:30:30Z',
          sender: {
            sender_id: 'bot_001',
            sender_type: SenderType.APP,
            tenant_key: 'tenant_001'
          },
          mentions: []
        },
        {
          message_id: 'msg_003',
          chat_id: chatId,
          chat_type: ChatType.GROUP,
          message_type: MessageType.TEXT,
          content: JSON.stringify({ text: '我想了解一下你们的企业版功能' }),
          create_time: '2024-01-15T10:31:00Z',
          update_time: '2024-01-15T10:31:00Z',
          sender: {
            sender_id: 'user_001',
            sender_type: SenderType.USER,
            tenant_key: 'tenant_001'
          },
          mentions: []
        }
      ];
      setMessages(mockMessages);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRefresh = () => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingMessage(message);
    replyForm.reset();
    setReplyModalVisible(true);
  };

  const handleSendReply = async (values: any) => {
    if (!replyingMessage) return;
    
    try {
      await botService.replyMessage(
        replyingMessage.message_id,
        MessageType.TEXT,
        JSON.stringify({ text: values.content })
      );
      
      Toast.success('回复发送成功');
      setReplyModalVisible(false);
      
      // 刷新消息列表
      if (selectedChat) {
        loadMessages(selectedChat);
      }
    } catch (error) {
      console.error('发送回复失败:', error);
      Toast.error('发送回复失败');
    }
  };

  const handleCopyMessage = (message: Message) => {
    const content = extractTextContent(message.content);
    navigator.clipboard.writeText(content).then(() => {
      Toast.success('消息已复制到剪贴板');
    }).catch(() => {
      Toast.error('复制失败');
    });
  };

  const extractTextContent = (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      return parsed.text || content;
    } catch {
      return content;
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  const getMessageTypeTag = (type: MessageType) => {
    const typeMap = {
      [MessageType.TEXT]: { color: 'blue', text: '文本' },
      [MessageType.IMAGE]: { color: 'green', text: '图片' },
      [MessageType.FILE]: { color: 'orange', text: '文件' },
      [MessageType.AUDIO]: { color: 'purple', text: '音频' },
      [MessageType.VIDEO]: { color: 'red', text: '视频' },
      [MessageType.INTERACTIVE]: { color: 'cyan', text: '卡片' }
    };
    
    const config = typeMap[type] || { color: 'grey', text: '未知' };
    return <Tag color={config.color} size="small">{config.text}</Tag>;
  };

  const getSenderAvatar = (sender: Message['sender']) => {
    if (sender.sender_type === SenderType.APP) {
      return <Avatar color="blue" size="small"><IconRobot /></Avatar>;
    } else {
      return <Avatar color="green" size="small"><IconUser /></Avatar>;
    }
  };

  const getSenderName = (sender: Message['sender']) => {
    if (sender.sender_type === SenderType.APP) {
      return '智能助手';
    } else {
      return `用户 ${sender.sender_id.slice(-4)}`;
    }
  };

  const renderMessageContent = (message: Message) => {
    const content = extractTextContent(message.content);
    const isBot = message.sender.sender_type === SenderType.APP;
    
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: isBot ? 'flex-start' : 'flex-end',
          marginBottom: '16px'
        }}
      >
        <div
          style={{
            maxWidth: '70%',
            display: 'flex',
            flexDirection: isBot ? 'row' : 'row-reverse',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          {getSenderAvatar(message.sender)}
          
          <div>
            <div
              style={{
                backgroundColor: isBot ? '#f0f0f0' : '#1890ff',
                color: isBot ? '#000' : '#fff',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '4px'
              }}
            >
              <Text style={{ color: isBot ? '#000' : '#fff' }}>
                {content}
              </Text>
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#999',
                justifyContent: isBot ? 'flex-start' : 'flex-end'
              }}
            >
              <Text type="tertiary" size="small">
                {getSenderName(message.sender)}
              </Text>
              <Text type="tertiary" size="small">
                {formatTime(message.create_time)}
              </Text>
              {getMessageTypeTag(message.message_type)}
              
              <Space size={4}>
                <Tooltip content="回复">
                  <Button
                    theme="borderless"
                    type="tertiary"
                    icon={<IconReply />}
                    size="small"
                    onClick={() => handleReply(message)}
                  />
                </Tooltip>
                
                <Tooltip content="复制">
                  <Button
                    theme="borderless"
                    type="tertiary"
                    icon={<IconCopy />}
                    size="small"
                    onClick={() => handleCopyMessage(message)}
                  />
                </Tooltip>
              </Space>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Title heading={3} icon={<IconMessage />}>
        消息历史
      </Title>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* 左侧群聊列表 */}
        <Card
          title="群聊列表"
          style={{ width: '300px', display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, padding: 0 }}
        >
          <List
            dataSource={chats}
            renderItem={(chat) => (
              <List.Item
                onClick={() => setSelectedChat(chat.chat_id)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedChat === chat.chat_id ? '#f0f8ff' : 'transparent',
                  padding: '12px 16px'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar size="small" color={chat.chat_type === ChatType.GROUP ? 'blue' : 'green'}>
                      {chat.name.charAt(0)}
                    </Avatar>
                  }
                  title={chat.name}
                  description={
                    <Space>
                      <Tag size="small">
                        {chat.chat_type === ChatType.GROUP ? '群聊' : '单聊'}
                      </Tag>
                      <Text type="tertiary" size="small">
                        {chat.member_count} 人
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* 右侧消息区域 */}
        <Card
          title={
            <Space>
              <Text>消息记录</Text>
              {selectedChat && (
                <Text type="tertiary">
                  ({chats.find(c => c.chat_id === selectedChat)?.name})
                </Text>
              )}
            </Space>
          }
          headerExtraContent={
            <Space>
              <Button
                icon={<IconRefresh />}
                onClick={handleRefresh}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          }
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
        >
          {selectedChat ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* 消息列表 */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  backgroundColor: '#fafafa'
                }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                  </div>
                ) : messages.length > 0 ? (
                  <div>
                    {messages.map((message) => (
                      <div key={message.message_id}>
                        {renderMessageContent(message)}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <Empty
                    title="暂无消息"
                    description="该群聊还没有消息记录"
                  />
                )}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty
                title="请选择群聊"
                description="从左侧列表中选择一个群聊查看消息历史"
              />
            </div>
          )}
        </Card>
      </div>

      {/* 回复消息弹窗 */}
      <Modal
        title="回复消息"
        visible={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={null}
        width={600}
      >
        {replyingMessage && (
          <div>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <Text type="tertiary" size="small">回复消息:</Text>
              <div style={{ marginTop: '4px' }}>
                <Text>{extractTextContent(replyingMessage.content)}</Text>
              </div>
            </div>
            
            <Form
              form={replyForm}
              onSubmit={handleSendReply}
            >
              <Form.TextArea
                field="content"
                label="回复内容"
                placeholder="请输入回复内容"
                rows={4}
                rules={[{ required: true, message: '回复内容不能为空' }]}
              />
              
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setReplyModalVisible(false)}>
                    取消
                  </Button>
                  <Button htmlType="submit" type="primary" icon={<IconSend />}>
                    发送
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MessageHistory;