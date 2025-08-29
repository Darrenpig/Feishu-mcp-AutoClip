// 现代化通知系统组件 - 参考AutoClip的用户反馈设计
import React, { useState, useEffect, useCallback } from 'react';
import { Toast, Notification, Button, Space, Typography, Progress } from '@douyinfe/semi-ui';
import {
  IconCheckCircle,
  IconAlertTriangle,
  IconInfoCircle,
  IconClose,
  IconRefresh,
  IconDownload,
  IconUpload
} from '@douyinfe/semi-icons';

const { Text } = Typography;

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  content?: string;
  duration?: number;
  showClose?: boolean;
  progress?: number;
  actions?: Array<{
    text: string;
    onClick: () => void;
    type?: 'primary' | 'secondary' | 'tertiary';
  }>;
  onClose?: () => void;
}

interface NotificationSystemProps {
  maxCount?: number;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

class NotificationManager {
  private static instance: NotificationManager;
  private notifications: NotificationItem[] = [];
  private listeners: Array<(notifications: NotificationItem[]) => void> = [];

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  subscribe(listener: (notifications: NotificationItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  add(notification: Omit<NotificationItem, 'id'>): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationItem = {
      id,
      duration: 4000,
      showClose: true,
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.notify();

    // 自动移除通知
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  remove(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification?.onClose) {
      notification.onClose();
    }
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  update(id: string, updates: Partial<NotificationItem>) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index] = { ...this.notifications[index], ...updates };
      this.notify();
    }
  }

  clear() {
    this.notifications = [];
    this.notify();
  }

  // 便捷方法
  success(title: string, content?: string, options?: Partial<NotificationItem>) {
    return this.add({ type: 'success', title, content, ...options });
  }

  error(title: string, content?: string, options?: Partial<NotificationItem>) {
    return this.add({ type: 'error', title, content, duration: 6000, ...options });
  }

  warning(title: string, content?: string, options?: Partial<NotificationItem>) {
    return this.add({ type: 'warning', title, content, ...options });
  }

  info(title: string, content?: string, options?: Partial<NotificationItem>) {
    return this.add({ type: 'info', title, content, ...options });
  }

  loading(title: string, content?: string, options?: Partial<NotificationItem>) {
    return this.add({ type: 'loading', title, content, duration: 0, showClose: false, ...options });
  }

  progress(title: string, progress: number = 0, options?: Partial<NotificationItem>) {
    return this.add({ type: 'progress', title, progress, duration: 0, showClose: false, ...options });
  }
}

// 导出单例实例
export const notificationManager = NotificationManager.getInstance();

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  maxCount = 5,
  position = 'topRight'
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <IconCheckCircle style={{ color: '#52c41a' }} />;
      case 'error':
        return <IconAlertTriangle style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <IconAlertTriangle style={{ color: '#fa8c16' }} />;
      case 'info':
        return <IconInfoCircle style={{ color: '#1890ff' }} />;
      case 'loading':
        return <IconRefresh style={{ color: '#1890ff', animation: 'spin 1s linear infinite' }} />;
      case 'progress':
        return <IconDownload style={{ color: '#722ed1' }} />;
      default:
        return <IconInfoCircle />;
    }
  };

  const getThemeColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      case 'warning':
        return '#fa8c16';
      case 'info':
        return '#1890ff';
      case 'loading':
        return '#1890ff';
      case 'progress':
        return '#722ed1';
      default:
        return '#1890ff';
    }
  };

  const handleClose = useCallback((id: string) => {
    notificationManager.remove(id);
  }, []);

  const getPositionStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: '400px',
      width: '100%'
    };

    switch (position) {
      case 'topLeft':
        return { ...baseStyle, top: '20px', left: '20px' };
      case 'topRight':
        return { ...baseStyle, top: '20px', right: '20px' };
      case 'bottomLeft':
        return { ...baseStyle, bottom: '20px', left: '20px' };
      case 'bottomRight':
        return { ...baseStyle, bottom: '20px', right: '20px' };
      default:
        return { ...baseStyle, top: '20px', right: '20px' };
    }
  };

  const visibleNotifications = notifications.slice(0, maxCount);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div style={getPositionStyle()}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {visibleNotifications.map((notification, index) => {
          const themeColor = getThemeColor(notification.type);
          
          return (
            <div
              key={notification.id}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${themeColor}20`,
                borderLeft: `4px solid ${themeColor}`,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                transform: `translateY(${index * 4}px)`,
                transition: 'all 0.3s ease',
                animation: 'slideInRight 0.3s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  {getIcon(notification.type)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: notification.content ? '8px' : '0'
                  }}>
                    <Text strong style={{ color: '#262626', fontSize: '14px' }}>
                      {notification.title}
                    </Text>
                    
                    {notification.showClose && (
                      <Button
                        type="tertiary"
                        theme="borderless"
                        icon={<IconClose />}
                        size="small"
                        onClick={() => handleClose(notification.id)}
                        style={{ 
                          marginLeft: '8px',
                          color: '#8c8c8c',
                          minWidth: 'auto',
                          padding: '4px'
                        }}
                      />
                    )}
                  </div>
                  
                  {notification.content && (
                    <Text 
                      type="secondary" 
                      size="small"
                      style={{ 
                        display: 'block',
                        marginBottom: notification.type === 'progress' ? '12px' : '0',
                        lineHeight: '1.4'
                      }}
                    >
                      {notification.content}
                    </Text>
                  )}
                  
                  {notification.type === 'progress' && typeof notification.progress === 'number' && (
                    <div style={{ marginBottom: '12px' }}>
                      <Progress 
                        percent={notification.progress} 
                        stroke={themeColor}
                        size="small"
                        showInfo
                        style={{ marginBottom: '4px' }}
                      />
                      <Text size="small" type="secondary">
                        {notification.progress}% 完成
                      </Text>
                    </div>
                  )}
                  
                  {notification.actions && notification.actions.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <Space size={8}>
                        {notification.actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            type={action.type || 'tertiary'}
                            size="small"
                            onClick={action.onClick}
                            style={{
                              ...(action.type === 'primary' ? {
                                background: themeColor,
                                borderColor: themeColor
                              } : {})
                            }}
                          >
                            {action.text}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </Space>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;

// 便捷的全局通知方法
export const notify = {
  success: (title: string, content?: string, options?: Partial<NotificationItem>) => 
    notificationManager.success(title, content, options),
  error: (title: string, content?: string, options?: Partial<NotificationItem>) => 
    notificationManager.error(title, content, options),
  warning: (title: string, content?: string, options?: Partial<NotificationItem>) => 
    notificationManager.warning(title, content, options),
  info: (title: string, content?: string, options?: Partial<NotificationItem>) => 
    notificationManager.info(title, content, options),
  loading: (title: string, content?: string, options?: Partial<NotificationItem>) => 
    notificationManager.loading(title, content, options),
  progress: (title: string, progress?: number, options?: Partial<NotificationItem>) => 
    notificationManager.progress(title, progress, options),
  update: (id: string, updates: Partial<NotificationItem>) => 
    notificationManager.update(id, updates),
  remove: (id: string) => 
    notificationManager.remove(id),
  clear: () => 
    notificationManager.clear()
};