import { Layout, Menu, Button, Avatar, Typography, Dropdown, Modal, message } from 'antd';
import { UserOutlined, LogoutOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import moment from 'moment';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const { Header } = Layout;
const { Text, Title } = Typography;

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [progressText, setProgressText] = useState('Loading...');

  const showShareModal = () => {
    setIsShareModalVisible(true);
    generateProgressText();
  };

  const handleShareModalClose = () => {
    setIsShareModalVisible(false);
  };

  const generateProgressText = async () => {
    const daysSinceStart = moment().diff(moment(currentUser.createdAt), 'days');
    const pricePerCigarette = currentUser.pricePerPack / currentUser.cigarettesPerPack;
    
    // Calculate total expected cigarettes since start
    const expectedTotal = currentUser.avgCigarettesPerDay * daysSinceStart;
    
    // Get actual smokes from stats
    const smokesRef = collection(db, 'smokes');
    const q = query(
      smokesRef,
      where('userId', '==', currentUser.uid),
      where('timestamp', '>=', moment(currentUser.createdAt).toISOString())
    );
    
    const querySnapshot = await getDocs(q);
    const actualSmokes = querySnapshot.docs.length;
    
    // Calculate money saved from unsmoked cigarettes
    const unsmoked = expectedTotal - actualSmokes;
    const moneySaved = unsmoked * pricePerCigarette;
    
    // Calculate current daily average
    const currentDailyAvg = daysSinceStart > 0 ? (actualSmokes / daysSinceStart).toFixed(1) : 0;
    
    const text = `🎉 My Smoking Reduction Progress:

 📅 Days since starting: ${daysSinceStart}
 💰 Money saved: ${currentUser.currency} ${moneySaved.toFixed(2)}
 🎯 Earlier Daily Average: ${currentUser.avgCigarettesPerDay} cigarettes
 📉 Current Daily Average: ${currentDailyAvg} cigarettes
 
 Track your progress too! Join QuitPuff`;
    
    setProgressText(text);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(progressText);
      message.success('Progress copied to clipboard!');
    } catch (err) {
      message.error('Failed to copy text');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    {
      key: 'profile',
      label: 'View Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'share',
      label: 'Share Progress',
      icon: <ShareAltOutlined />,
      onClick: showShareModal
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  return (
    <>
      <Header 
        style={{ 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center'
        }}>
          <Link
            to="/dashboard"
            style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              marginRight: '24px',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            QuitPuff
          </Link>
        </div>

        {currentUser && (
          <Dropdown 
            menu={{ items: menuItems }} 
            placement="bottomRight" 
            arrow
          >
            <Button 
              type="text" 
              icon={
                <Avatar 
                  style={{ 
                    marginRight: 8,
                    backgroundColor: '#1890ff',
                    verticalAlign: 'middle'
                  }}
                >
                  {getInitials(currentUser.name)}
                </Avatar>
              }
            >
              {currentUser.name}
            </Button>
          </Dropdown>
        )}
      </Header>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShareAltOutlined />
            <span>Share Your Progress</span>
          </div>
        }
        open={isShareModalVisible}
        onCancel={handleShareModalClose}
        footer={[
          <Button key="copy" type="primary" onClick={handleCopyText} icon={<ShareAltOutlined />}>
            Copy to Clipboard
          </Button>
        ]}
      >
        <div style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px',
          marginTop: '16px',
          whiteSpace: 'pre-line' 
        }}>
          {progressText}
        </div>
      </Modal>
    </>
  );
} 