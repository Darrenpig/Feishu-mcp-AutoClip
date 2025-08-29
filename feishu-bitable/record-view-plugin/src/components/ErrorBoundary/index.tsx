// 现代化错误边界组件 - 参考AutoClip的错误处理设计
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, Button, Typography, Space, Empty, Tag } from '@douyinfe/semi-ui';
import { IconRefresh, IconBug, IconAlertTriangle, IconHome } from '@douyinfe/semi-icons';

const { Title, Text, Paragraph } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 生成错误ID用于追踪
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 调用外部错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发环境下打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // 可以在这里添加错误上报逻辑
    this.reportError(error, errorInfo);
  }

  // 错误上报方法
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 这里可以集成错误监控服务，如 Sentry、Bugsnag 等
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 模拟错误上报
    console.log('Error Report:', errorReport);
    
    // 实际项目中可以这样上报：
    // fetch('/api/error-report', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  };

  // 重置错误状态
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  // 刷新页面
  private handleRefresh = () => {
    window.location.reload();
  };

  // 返回首页
  private handleGoHome = () => {
    window.location.href = '/';
  };

  // 复制错误信息
  private handleCopyError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorText = `
错误ID: ${errorId}
错误信息: ${error?.message}
错误堆栈: ${error?.stack}
组件堆栈: ${errorInfo?.componentStack}
时间: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      // 可以添加复制成功的提示
      console.log('错误信息已复制到剪贴板');
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;
      const { showDetails = false } = this.props;

      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Card
            style={{
              maxWidth: '600px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <IconBug style={{ fontSize: '40px', color: 'white' }} />
              </div>
              
              <Title heading={2} style={{ marginBottom: '8px', color: '#ff6b6b' }}>
                哎呀，出现了一些问题
              </Title>
              
              <Text type="secondary" size="large">
                应用遇到了意外错误，我们已经记录了这个问题
              </Text>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                <div style={{ 
                  background: '#fff2f0', 
                  border: '1px solid #ffccc7',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <IconAlertTriangle style={{ color: '#ff4d4f', marginRight: '8px' }} />
                    <Text strong>错误详情</Text>
                  </div>
                  <Text code style={{ fontSize: '12px' }}>错误ID: {errorId}</Text>
                  <br />
                  <Text type="secondary" size="small">
                    {error?.message || '未知错误'}
                  </Text>
                </div>

                {showDetails && errorInfo && (
                  <details style={{ 
                    background: '#f6f6f6',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <summary style={{ cursor: 'pointer', marginBottom: '12px' }}>
                      <Text strong>技术详情 (点击展开)</Text>
                    </summary>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <Text strong>错误堆栈:</Text>
                        <pre style={{ 
                          background: '#f5f5f5',
                          padding: '8px',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '11px'
                        }}>
                          {error?.stack}
                        </pre>
                      </div>
                      <div>
                        <Text strong>组件堆栈:</Text>
                        <pre style={{ 
                          background: '#f5f5f5',
                          padding: '8px',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '11px'
                        }}>
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}
              </Space>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button 
                type="primary" 
                icon={<IconRefresh />}
                onClick={this.handleReset}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                重试
              </Button>
              
              <Button 
                icon={<IconRefresh />}
                onClick={this.handleRefresh}
              >
                刷新页面
              </Button>
              
              <Button 
                icon={<IconHome />}
                onClick={this.handleGoHome}
              >
                返回首页
              </Button>
              
              {showDetails && (
                <Button 
                  type="tertiary"
                  onClick={this.handleCopyError}
                  size="small"
                >
                  复制错误信息
                </Button>
              )}
            </div>

            <div style={{ 
              marginTop: '24px', 
              padding: '16px',
              background: '#f0f9ff',
              border: '1px solid #bae7ff',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Text size="small" type="secondary">
                如果问题持续存在，请联系技术支持团队
                <br />
                <Tag size="small" style={{ marginTop: '4px' }}>错误ID: {errorId}</Tag>
              </Text>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;