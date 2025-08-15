import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Redirect based on user role
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'student') {
    return <Navigate to="/student" replace />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to EduTest!</p>
    </div>
  );
};

export default Dashboard;
