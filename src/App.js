import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import { useAuth } from './context/AuthContext';
import { Layout, message } from 'antd';

const { Content } = Layout;

// Configure message globally
message.config({
  top: 60,
  duration: 3,
  maxCount: 3,
});

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? (
    <Layout>
      <Navbar />
      <Content style={{ minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </Content>
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 