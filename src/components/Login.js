import { Form, Input, Button, Typography, Row, Col } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import LoadingScreen from './LoadingScreen';

const { Title, Text } = Typography;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setIsLoading(true);
      await login(values.email, values.password);
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Row style={{ minHeight: '100vh' }}>
      {/* Left Section */}
      <Col xs={24} md={12} style={{ padding: '40px' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text type="secondary">Don't have an account?</Text>{' '}
            <Link to="/signup" style={{ fontWeight: 500 }}>Sign Up</Link>
          </div>

          <Title level={1} style={{ fontSize: '42px', marginBottom: '24px' }}>
            Welcome to QuitPuff
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '40px' }}>
            Sign in to continue your journey towards a healthier lifestyle
          </Text>

          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="email"
              style={{ marginBottom: '20px' }}
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="example@email.com"
                style={{ 
                  height: '50px',
                  borderRadius: '8px',
                  border: '1px solid #e6e6e6'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              style={{ marginBottom: '24px' }}
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="6+ strong character"
                style={{ 
                  height: '50px',
                  borderRadius: '8px',
                  border: '1px solid #e6e6e6'
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                style={{
                  height: '50px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: '#4318FF',
                  border: 'none'
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>

      {/* Right Section - Updated Content */}
      <Col 
        xs={0} 
        md={12} 
        style={{ 
          background: '#4318FF',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ color: 'white', maxWidth: '400px' }}>
          <Title 
            level={1} 
            style={{ 
              color: 'white', 
              fontSize: '64px',
              marginBottom: '24px',
              lineHeight: 1.1
            }}
          >
            Transform Your Life
          </Title>
          <Text style={{ 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: '16px',
            display: 'block',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            "QuitPuff helped me save over $2,000 in just 6 months. But more than money, 
            it helped me understand my habits and gradually reduce my smoking. The daily tracking 
            and progress visualization kept me motivated. Now, I'm smoke-free and healthier than ever!"
          </Text>

          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '40px'
          }}>
            <Title level={4} style={{ color: 'white', marginBottom: '16px' }}>
              Why QuitPuff Works:
            </Title>
            <ul style={{ 
              color: 'rgba(255,255,255,0.8)',
              paddingLeft: '20px',
              marginBottom: 0
            }}>
              <li>Visual progress tracking keeps you motivated</li>
              <li>Real-time money savings calculations</li>
              <li>Data-driven insights about your smoking habits</li>
              <li>Gradual reduction approach for sustainable results</li>
            </ul>
          </div>
        </div>
      </Col>
    </Row>
  );
} 