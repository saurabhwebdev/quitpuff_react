import { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Button, Modal, Form, Input, InputNumber, Select, message, Space, Tag, Tooltip, DatePicker, Progress, Row, Col, Statistic } from 'antd';
import { EditOutlined, InfoCircleOutlined, DollarOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import moment from 'moment';
import { collection, query, where, getDocs } from 'firebase/firestore';

const { Title, Text } = Typography;
const { Option } = Select;

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export default function Profile() {
  const { currentUser } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [savingsStats, setSavingsStats] = useState({
    totalSaved: 0,
    yearlyTarget: 0,
    progressPercentage: 0
  });

  useEffect(() => {
    const calculateSavings = async () => {
      try {
        const smokesRef = collection(db, 'smokes');
        const accountCreationDate = moment(currentUser.createdAt);
        
        const q = query(
          smokesRef,
          where('userId', '==', currentUser.uid),
          where('timestamp', '>=', accountCreationDate.toISOString())
        );
        
        const querySnapshot = await getDocs(q);
        const actualSmokes = querySnapshot.docs.length;
        
        // Calculate expected smokes since account creation
        const daysSinceCreation = moment().diff(accountCreationDate, 'days');
        const expectedSmokes = daysSinceCreation * currentUser.avgCigarettesPerDay;
        
        // Calculate costs
        const pricePerCigarette = currentUser.pricePerPack / currentUser.cigarettesPerPack;
        const actualCost = actualSmokes * pricePerCigarette;
        const expectedCost = expectedSmokes * pricePerCigarette;
        
        // Calculate yearly target (full year from account creation)
        const daysInOneYear = 365;
        const yearlyTarget = (currentUser.avgCigarettesPerDay * daysInOneYear * pricePerCigarette);
        const totalSaved = expectedCost - actualCost;
        // Adjust progress percentage based on days since creation
        const adjustedYearlyTarget = (yearlyTarget / daysInOneYear) * daysSinceCreation;
        const progressPercentage = Math.min(100, (totalSaved / adjustedYearlyTarget) * 100);
        
        setSavingsStats({
          totalSaved: totalSaved.toFixed(2),
          yearlyTarget: yearlyTarget.toFixed(2),
          progressPercentage: progressPercentage.toFixed(1)
        });
      } catch (error) {
        console.error('Error calculating savings:', error);
      }
    };
    
    calculateSavings();
  }, [currentUser]);

  const canEditCreationDate = () => {
    if (!currentUser?.createdAt) return false;
    const creationDate = moment(currentUser.createdAt);
    const threeDaysAfterCreation = moment(creationDate).add(3, 'days');
    return moment().isBetween(creationDate, threeDaysAfterCreation, null, '[]');
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...values,
        updatedAt: new Date().toISOString()
      };

      if (values.createdAt && canEditCreationDate()) {
        updateData.createdAt = values.createdAt.toISOString();
      }

      await updateDoc(userRef, updateData);
      message.success('Profile updated successfully');
      setIsEditModalVisible(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = () => {
    form.setFieldsValue({
      name: currentUser.name,
      avgCigarettesPerDay: currentUser.avgCigarettesPerDay,
      cigarettesPerPack: currentUser.cigarettesPerPack,
      pricePerPack: currentUser.pricePerPack,
      currency: currentUser.currency,
      createdAt: moment(currentUser.createdAt)
    });
    setIsEditModalVisible(true);
  };

  const getCurrencySymbol = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };

  const getRemainingDays = () => {
    const creationDate = moment(currentUser.createdAt);
    const daysLeft = 3 - moment().diff(creationDate, 'days');
    return daysLeft > 0 ? daysLeft : 0;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card
        style={{ marginBottom: '24px' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TrophyOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#faad14' }} />
            <Title level={3} style={{ margin: 0 }}>Savings Progress</Title>
          </div>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Statistic
              title="Total Saved Since Account Creation"
              value={savingsStats.totalSaved}
              prefix={currentUser.currency === 'INR' ? '₹' : '$'}
              valueStyle={{ color: '#52c41a' }}
            />
            <Statistic
              title="First Year Savings Target"
              value={savingsStats.yearlyTarget}
              prefix={currentUser.currency === 'INR' ? '₹' : '$'}
              style={{ marginTop: '20px' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="dashboard"
                percent={Number(savingsStats.progressPercentage)}
                format={percent => `${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#52c41a',
                }}
              />
              <Text style={{ display: 'block', marginTop: '12px' }}>
                Progress to Yearly Target
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>Profile Details</Title>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={showEditModal}
            >
              Edit Profile
            </Button>
          </div>
        }
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Name">{currentUser.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{currentUser.email}</Descriptions.Item>
          <Descriptions.Item label="Average Cigarettes Per Day">
            {currentUser.avgCigarettesPerDay}
          </Descriptions.Item>
          <Descriptions.Item label="Cigarettes Per Pack">
            {currentUser.cigarettesPerPack}
          </Descriptions.Item>
          <Descriptions.Item label="Price Per Pack">
            {getCurrencySymbol(currentUser.currency)} {currentUser.pricePerPack}
          </Descriptions.Item>
          <Descriptions.Item label="Currency">
            {currentUser.currency}
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <Space>
                Account Created
                {canEditCreationDate() && (
                  <Tag color="green">Editable for {getRemainingDays()} more days</Tag>
                )}
              </Space>
            }
          >
            {moment(currentUser.createdAt).format('MMMM D, YYYY')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Edit Profile"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            currency: currentUser.currency
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="avgCigarettesPerDay"
            label="Average Cigarettes Per Day"
            rules={[{ required: true, message: 'Please enter average cigarettes per day' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="cigarettesPerPack"
            label="Cigarettes Per Pack"
            rules={[{ required: true, message: 'Please enter cigarettes per pack' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: 'Please select currency' }]}
          >
            <Select>
              {currencies.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="pricePerPack"
            label="Price Per Pack"
            rules={[{ required: true, message: 'Please enter price per pack' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {canEditCreationDate() && (
            <Form.Item
              name="createdAt"
              label={
                <Space>
                  Account Creation Date
                  <Tooltip title="You can edit this only within 3 days of creating your account">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[{ required: true, message: 'Please select account creation date' }]}
            >
              <DatePicker 
                showTime 
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 