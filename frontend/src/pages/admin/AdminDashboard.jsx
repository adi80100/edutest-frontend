import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, testsResponse] = await Promise.all([
        apiService.getAnalytics(),
        apiService.getTests()
      ]);
      
      setStats(analyticsResponse.data);
      setRecentTests(testsResponse.data.slice(0, 5));
      setRecentSubmissions(analyticsResponse.data.recentSubmissions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the EduTest administration panel</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats?.overview?.totalTests || 0}</h3>
            <p>Total Tests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats?.overview?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats?.overview?.totalSubmissions || 0}</h3>
            <p>Total Submissions</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats?.overview?.averageScore || 0}%</h3>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/tests/new" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Create Test</h3>
            <p>Create a new test or quiz</p>
          </Link>
          
          <Link to="/admin/tests" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Manage Tests</h3>
            <p>View and edit existing tests</p>
          </Link>
          
          <Link to="/admin/users" className="action-card">
            <div className="action-icon">👥</div>
            <h3>Manage Users</h3>
            <p>Add or remove users</p>
          </Link>
          
          <Link to="/admin/analytics" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Analytics</h3>
            <p>View detailed analytics</p>
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Tests */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Tests</h2>
            <Link to="/admin/tests" className="view-all-link">View All</Link>
          </div>
          
          <div className="tests-list">
            {recentTests.map(test => (
              <div key={test._id} className="test-item">
                <div className="test-info">
                  <h3>{test.title}</h3>
                  <p>{test.description}</p>
                  <div className="test-meta">
                    <span>📚 {test.subject}</span>
                    <span>⏱️ {test.duration}min</span>
                    <span>📝 {test.questions?.length || 0} questions</span>
                    <span className={`status ${test.isPublished ? 'published' : 'draft'}`}>
                      {test.isPublished ? '🟢 Published' : '🟡 Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="test-actions">
                  <Link 
                    to={`/admin/tests/${test._id}/edit`} 
                    className="btn btn-secondary btn-small"
                  >
                    Edit
                  </Link>
                  <Link 
                    to={`/admin/tests/${test._id}/results`} 
                    className="btn btn-primary btn-small"
                  >
                    Results
                  </Link>
                </div>
              </div>
            ))}
            
            {recentTests.length === 0 && (
              <div className="empty-state">
                <p>No tests created yet.</p>
                <Link to="/admin/tests/new" className="btn btn-primary">
                  Create Your First Test
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.slice(0, 5).map((submission, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">📊</div>
                  <div className="activity-content">
                    <p><strong>{submission.user?.name}</strong> completed <strong>{submission.test?.title}</strong></p>
                    <small>{formatDate(submission.submittedAt)} • Score: {submission.percentage}%</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recent submissions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
