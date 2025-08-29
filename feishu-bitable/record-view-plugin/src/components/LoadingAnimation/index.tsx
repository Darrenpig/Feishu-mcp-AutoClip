// 现代化加载动画组件 - 参考AutoClip的设计风格
import React from 'react';
import { Spin, Typography } from '@douyinfe/semi-ui';
import './styles.css';

const { Text } = Typography;

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  type?: 'default' | 'gradient' | 'pulse' | 'wave';
  fullScreen?: boolean;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'medium',
  text = '加载中...',
  type = 'gradient',
  fullScreen = false
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { spinSize: 'small' as const, fontSize: '14px', spacing: '8px' };
      case 'large':
        return { spinSize: 'large' as const, fontSize: '18px', spacing: '16px' };
      default:
        return { spinSize: 'default' as const, fontSize: '16px', spacing: '12px' };
    }
  };

  const { spinSize, fontSize, spacing } = getSizeConfig();

  const renderLoadingContent = () => {
    switch (type) {
      case 'gradient':
        return (
          <div className="loading-gradient">
            <div className="gradient-spinner">
              <div className="gradient-circle"></div>
            </div>
            {text && (
              <Text 
                style={{ 
                  fontSize, 
                  marginTop: spacing,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 500
                }}
              >
                {text}
              </Text>
            )}
          </div>
        );
      
      case 'pulse':
        return (
          <div className="loading-pulse">
            <div className="pulse-container">
              <div className="pulse-dot pulse-dot-1"></div>
              <div className="pulse-dot pulse-dot-2"></div>
              <div className="pulse-dot pulse-dot-3"></div>
            </div>
            {text && (
              <Text style={{ fontSize, marginTop: spacing, color: '#1890ff' }}>
                {text}
              </Text>
            )}
          </div>
        );
      
      case 'wave':
        return (
          <div className="loading-wave">
            <div className="wave-container">
              <div className="wave-bar wave-bar-1"></div>
              <div className="wave-bar wave-bar-2"></div>
              <div className="wave-bar wave-bar-3"></div>
              <div className="wave-bar wave-bar-4"></div>
              <div className="wave-bar wave-bar-5"></div>
            </div>
            {text && (
              <Text style={{ fontSize, marginTop: spacing, color: '#52c41a' }}>
                {text}
              </Text>
            )}
          </div>
        );
      
      default:
        return (
          <div className="loading-default">
            <Spin size={spinSize} />
            {text && (
              <Text style={{ fontSize, marginTop: spacing, color: '#666' }}>
                {text}
              </Text>
            )}
          </div>
        );
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen ? {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999
    } : {
      padding: '40px 20px'
    })
  };

  return (
    <div style={containerStyle}>
      {renderLoadingContent()}
    </div>
  );
};

export default LoadingAnimation;