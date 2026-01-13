import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TestList from './pages/admin/TestList';
import TestForm from './pages/admin/TestForm';
import TestEdit from './pages/admin/TestEdit';
import TestResults from './pages/admin/TestResults';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import TestTaking from './pages/student/TestTaking';
import MyResults from './pages/student/MyResults';
import ResultDetail from './pages/student/ResultDetail';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Common Routes */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/tests"
            element={
              <ProtectedRoute adminOnly>
                <TestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/tests/new"
            element={
              <ProtectedRoute adminOnly>
                <TestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/tests/:id/edit"
            element={
              <ProtectedRoute adminOnly>
                <TestEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/tests/:id/results"
            element={
              <ProtectedRoute adminOnly>
                <TestResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute adminOnly>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route path="student" element={<StudentDashboard />} />
          <Route path="test/:id" element={<TestTaking />} />
          <Route path="results" element={<MyResults />} />
          <Route path="results/:id" element={<ResultDetail />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

const App = () => {
  return (
    <div className="App">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
};

export default App;
