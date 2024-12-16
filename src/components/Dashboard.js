import { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Statistic, Table, Typography, Space, Popconfirm, Modal, Form, DatePicker, Divider, Input, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  FireOutlined,
  DollarOutlined,
  CalendarOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import moment from 'moment';
import { message } from 'antd';
import LoadingScreen from './LoadingScreen';

const { Text, Title } = Typography;

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    totalCost: 0
  });
  const [savings, setSavings] = useState({
    daily: { amount: 0, percentage: 0, improved: true },
    weekly: { amount: 0, percentage: 0, improved: true },
    monthly: { amount: 0, percentage: 0, improved: true },
    yearly: { amount: 0, percentage: 0, improved: true }
  });
  const [smokeRecords, setSmokeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isExiting, setIsExiting] = useState(true);

  const calculateSavings = (actualCount, expectedCount, timeFrame) => {
    const pricePerCigarette = currentUser.pricePerPack / currentUser.cigarettesPerPack;
    const actualCost = actualCount * pricePerCigarette;
    const expectedCost = expectedCount * pricePerCigarette;
    const savings = expectedCost - actualCost;
    const percentage = expectedCost > 0 ? ((expectedCost - actualCost) / expectedCost) * 100 : 0;
    
    return {
      amount: savings.toFixed(2),
      percentage: percentage.toFixed(1),
      improved: savings > 0
    };
  };

  const updateSavingsStats = (stats) => {
    // Daily savings
    const expectedDaily = currentUser.avgCigarettesPerDay;
    const dailySavings = calculateSavings(stats.today, expectedDaily, 'daily');

    // Weekly savings
    const expectedWeekly = currentUser.avgCigarettesPerDay * 7;
    const weeklySavings = calculateSavings(stats.week, expectedWeekly, 'weekly');

    // Monthly savings
    const expectedMonthly = currentUser.avgCigarettesPerDay * 30;
    const monthlySavings = calculateSavings(stats.month, expectedMonthly, 'monthly');

    // Yearly projection based on monthly trend
    const monthlyRate = stats.month / 30; // average cigarettes per day this month
    const projectedYearly = monthlyRate * 365;
    const expectedYearly = currentUser.avgCigarettesPerDay * 365;
    const yearlySavings = calculateSavings(projectedYearly, expectedYearly, 'yearly');

    setSavings({
      daily: dailySavings,
      weekly: weeklySavings,
      monthly: monthlySavings,
      yearly: yearlySavings
    });
  };

  const recordSmoke = async () => {
    try {
      await addDoc(collection(db, 'smokes'), {
        userId: currentUser.uid,
        timestamp: new Date().toISOString()
      });
      await fetchStats();
      await fetchSmokeRecords();
      message.success('Smoke recorded successfully');
    } catch (error) {
      console.error(error);
      message.error('Failed to record smoke');
    }
  };

  const fetchSmokeRecords = async () => {
    try {
      const smokesRef = collection(db, 'smokes');
      const q = query(
        smokesRef,
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSmokeRecords(records);
    } catch (error) {
      console.error('Error fetching smoke records:', error);
      message.error('Failed to fetch smoke records');
    }
  };

  const fetchStats = async () => {
    try {
      const smokesRef = collection(db, 'smokes');
      const monthAgo = moment().subtract(30, 'days');

      const q = query(
        smokesRef,
        where('userId', '==', currentUser.uid),
        where('timestamp', '>=', monthAgo.toISOString())
      );

      const querySnapshot = await getDocs(q);
      const today = moment().startOf('day');
      const weekAgo = moment().subtract(7, 'days');
      
      let todayCount = 0;
      let weekCount = 0;
      let monthCount = 0;

      querySnapshot.forEach((doc) => {
        const smokeDate = moment(doc.data().timestamp);
        monthCount++;
        
        if (smokeDate.isSameOrAfter(weekAgo)) {
          weekCount++;
          if (smokeDate.isSameOrAfter(today)) {
            todayCount++;
          }
        }
      });

      const pricePerCigarette = currentUser.pricePerPack / currentUser.cigarettesPerPack;
      const totalCost = monthCount * pricePerCigarette;

      setStats({
        today: todayCount,
        week: weekCount,
        month: monthCount,
        totalCost: totalCost.toFixed(2)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error('Failed to fetch statistics');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchStats();
        await fetchSmokeRecords();
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsExiting(false);
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (stats.today !== undefined) {
      updateSavingsStats(stats);
    }
  }, [stats]);

  const handleDelete = async (record) => {
    try {
      await deleteDoc(doc(db, 'smokes', record.id));
      message.success('Record deleted successfully');
      await Promise.all([fetchStats(), fetchSmokeRecords()]);
    } catch (error) {
      console.error('Error deleting record:', error);
      message.error('Failed to delete record');
    }
  };

  const showEditModal = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      date: moment(record.timestamp).format('DD-MM-YYYY'),
      time: moment(record.timestamp).format('HH:mm')
    });
    setIsEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      // Combine date and time
      const dateTime = moment(values.date + ' ' + values.time, 'DD-MM-YYYY HH:mm');
      
      if (!dateTime.isValid()) {
        message.error('Please enter a valid date and time');
        return;
      }
      
      if (dateTime.isAfter(moment())) {
        message.error('Cannot set date in the future');
        return;
      }
      
      const timestamp = dateTime.toISOString();

      await updateDoc(doc(db, 'smokes', editingRecord.id), {
        timestamp
      });
      message.success('Record updated successfully');
      setIsEditModalVisible(false);
      await Promise.all([fetchStats(), fetchSmokeRecords()]);
    } catch (error) {
      console.error('Error updating record:', error);
      message.error('Failed to update record');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'date',
      render: (text) => moment(text).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.timestamp).unix() - moment(b.timestamp).unix(),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'time',
      render: (text) => moment(text).format('hh:mm A'),
    },
    {
      title: 'Cost',
      key: 'cost',
      render: () => {
        const costPerCigarette = currentUser.pricePerPack / currentUser.cigarettesPerPack;
        return `${currentUser.currency === 'INR' ? '₹' : '$'} ${costPerCigarette.toFixed(2)}`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Delete Record"
            description="Are you sure you want to delete this record?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderSavingStatistic = (title, value, savings, target, icon) => (
    <Card 
      style={{ 
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space align="center">
          <div style={{
            backgroundColor: '#f0f5ff',
            padding: '8px',
            borderRadius: '8px',
            color: '#1890ff'
          }}>
            {icon}
          </div>
          <Text strong style={{ fontSize: '16px' }}>{title}</Text>
        </Space>

        <Statistic
          value={value}
          suffix={
            <Text type="secondary" style={{ fontSize: '14px' }}>
              / {target}
            </Text>
          }
          precision={0}
          valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
        />

        <Statistic
          value={savings.amount}
          precision={2}
          prefix={currentUser.currency === 'INR' ? '₹' : '$'}
          valueStyle={{ 
            color: savings.improved ? '#3f8600' : '#cf1322',
            fontSize: '20px'
          }}
          suffix={
            <Space size="small">
              <span style={{ fontSize: '14px' }}>
                {savings.improved ? 'saved' : 'excess'}
              </span>
              {savings.improved ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              <span style={{ fontSize: '14px' }}>
                ({savings.percentage}%)
              </span>
            </Space>
          }
        />
      </Space>
    </Card>
  );

  if (loading) {
    return (
      <div className={`loading-screen ${isExiting ? '' : 'fade-out'}`}>
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div 
      className="page-transition"
      style={{ 
        padding: '32px',
        maxWidth: '1400px', 
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        minHeight: '100%',
      }}
    >
      <Row gutter={[24, 24]} style={{ 
        marginBottom: 32,
        animation: 'slideUp 0.5s ease-out 0.2s both'
      }}>
        <Col xs={24} md={12} lg={6}>
          {renderSavingStatistic(
            "Today's Stats",
            stats.today,
            savings.daily,
            currentUser.avgCigarettesPerDay,
            <FireOutlined />
          )}
        </Col>
        <Col xs={24} md={12} lg={6}>
          {renderSavingStatistic(
            "Weekly Progress",
            stats.week,
            savings.weekly,
            currentUser.avgCigarettesPerDay * 7,
            <CalendarOutlined />
          )}
        </Col>
        <Col xs={24} md={12} lg={6}>
          {renderSavingStatistic(
            "Monthly Overview",
            stats.month,
            savings.monthly,
            currentUser.avgCigarettesPerDay * 30,
            <LineChartOutlined />
          )}
        </Col>
        <Col xs={24} md={12} lg={6}>
          {renderSavingStatistic(
            "Yearly Projection",
            Math.round(stats.month / 30 * 365),
            savings.yearly,
            currentUser.avgCigarettesPerDay * 365,
            <DollarOutlined />
          )}
        </Col>
      </Row>

      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>Smoking History</Title>
        }
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
        extra={
          <Button
            type="primary"
            size="large"
            style={{
              borderRadius: '8px',
              width: '45px',
              height: '45px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
              transform: 'rotate(0deg)',
              boxShadow: '0 2px 8px rgba(24,144,255,0.2)',
              '&:hover': {
                transform: 'rotate(180deg)',
                boxShadow: '0 4px 12px rgba(24,144,255,0.3)',
              }
            }}
            onClick={recordSmoke}
          > 
            <Tooltip title="Record Smoke">
              <PlusOutlined style={{ fontSize: '20px' }} />
            </Tooltip>
          </Button>
        }
      >
        <Table
          columns={columns.map(column => ({
            ...column,
            align: column.key === 'actions' ? 'right' : 'left',
            render: column.key === 'actions' 
              ? (_, record) => (
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => showEditModal(record)}
                      style={{ color: '#1890ff' }}
                    />
                    <Popconfirm
                      title="Delete Record"
                      description="Are you sure you want to delete this record?"
                      onConfirm={() => handleDelete(record)}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Space>
                )
              : column.render
          }))}
          dataSource={smokeRecords}
          loading={loading}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
            style: { marginTop: 16 }
          }}
          summary={(pageData) => {
            const totalCost = pageData.length * (currentUser.pricePerPack / currentUser.cigarettesPerPack);
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{
                  background: 'linear-gradient(to right, #f0f5ff, #e6f7ff)',
                  borderRadius: '0 0 12px 12px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  <Table.Summary.Cell index={0}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{pageData.length} cigarettes</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong type="danger">
                      {currentUser.currency === 'INR' ? '₹' : '$'} {totalCost.toFixed(2)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>

      <Modal
        title="Edit Record"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        className="fade-modal"
        transitionName="fade-modal"
        maskTransitionName="fade-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please enter the date' }]}
          >
            <Input 
              placeholder="DD-MM-YYYY"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: 'Please enter the time' }]}
          >
            <Input 
              placeholder="HH:mm (24-hour format)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Format: Date (DD-MM-YYYY), Time (HH:mm) in 24-hour format
          </Text>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update Record
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 