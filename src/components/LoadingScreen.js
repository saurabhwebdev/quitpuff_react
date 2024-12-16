import { Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function LoadingScreen() {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <LoadingOutlined 
        style={{ 
          fontSize: 64, 
          color: '#4318FF',
          marginBottom: '24px',
          animation: 'spin 1s linear infinite'
        }} 
        spin 
      />
      <Title level={3} style={{ 
        margin: 0, 
        marginBottom: '8px',
        animation: 'slideUp 0.5s ease-out 0.2s both',
        opacity: 0,
        animationFillMode: 'forwards'
      }}>
        Loading Your Dashboard
      </Title>
      <Text type="secondary" style={{
        animation: 'slideUp 0.5s ease-out 0.3s both',
        opacity: 0,
        animationFillMode: 'forwards'
      }}>
        Preparing your progress tracking data...
      </Text>
    </div>
  );
} 