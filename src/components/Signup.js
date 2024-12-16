import { Form, Input, Button, Typography, Row, Col, InputNumber, Select } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { message } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await signup(values.email, values.password, {
        name: values.name,
        avgCigarettesPerDay: values.avgCigarettesPerDay,
        cigarettesPerPack: values.cigarettesPerPack,
        pricePerPack: values.pricePerPack,
        currency: values.currency,
      });
      message.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Failed to create account');
    }
  };

  return (
    <Row style={{ minHeight: '100vh' }}>
      {/* Left Section */}
      <Col xs={24} md={12} style={{ padding: '40px' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text type="secondary">Already have an account?</Text>{' '}
            <Link to="/login" style={{ fontWeight: 500 }}>Sign In</Link>
          </div>

          <Title level={1} style={{ fontSize: '42px', marginBottom: '24px' }}>
            Join QuitPuff
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '40px' }}>
            Start your journey to a smoke-free life today
          </Text>

          <Form
            name="signup"
            layout="vertical"
            onFinish={onFinish}
            size="large"
            initialValues={{ currency: 'INR' }}
          >
            <Form.Item
              name="name"
              style={{ marginBottom: '20px' }}
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Full Name"
                style={{ 
                  height: '50px',
                  borderRadius: '8px',
                  border: '1px solid #e6e6e6'
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              style={{ marginBottom: '20px' }}
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Email Address"
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
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Password (6+ characters)"
                style={{ 
                  height: '50px',
                  borderRadius: '8px',
                  border: '1px solid #e6e6e6'
                }}
              />
            </Form.Item>

            <Form.Item
              name="avgCigarettesPerDay"
              label="Average Cigarettes Per Day"
              rules={[{ required: true, message: 'Please enter average cigarettes per day' }]}
            >
              <InputNumber
                min={1}
                placeholder="10"
                style={{ width: '100%', height: '50px' }}
              />
            </Form.Item>

            <Form.Item
              name="cigarettesPerPack"
              label="Cigarettes Per Pack"
              rules={[{ required: true, message: 'Please enter cigarettes per pack' }]}
            >
              <InputNumber
                min={1}
                placeholder="20"
                style={{ width: '100%', height: '50px' }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="currency"
                  label="Currency"
                  rules={[{ required: true }]}
                >
                  <Select style={{ width: '100%', height: '50px' }}>
                    {currencies.map(currency => (
                      <Option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  name="pricePerPack"
                  label="Price Per Pack"
                  rules={[{ required: true, message: 'Please enter price per pack' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    style={{ width: '100%', height: '50px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

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
                  border: 'none',
                  marginTop: '12px'
                }}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>

      {/* Right Section */}
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
            Join thousands who have successfully quit smoking and saved money with QuitPuff.
          </Text>

          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '24px',
            borderRadius: '12px'
          }}>
            <Title level={4} style={{ color: 'white', marginBottom: '16px' }}>
              Start Your Journey Today:
            </Title>
            <ul style={{ 
              color: 'rgba(255,255,255,0.8)',
              paddingLeft: '20px',
              marginBottom: 0
            }}>
              <li>Track your daily smoking habits</li>
              <li>See your real-time savings</li>
              <li>Get insights into your patterns</li>
              <li>Set and achieve reduction goals</li>
            </ul>
          </div>
        </div>
      </Col>
    </Row>
  );
} 