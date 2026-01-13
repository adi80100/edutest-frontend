import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (user?.role === 'admin') {
        // Load admin dashboard data
        const [analyticsResponse, testsResponse] = await Promise.all([
          apiService.getAnalytics(),
          apiService.getTests()
        ]);
        
        setStats(analyticsResponse.data);
        setRecentTests(testsResponse.data.slice(0, 5)); // Show recent 5 tests
      } else {
        // Load student dashboard data
        const [testsResponse, resultsResponse] = await Promise.all([
          apiService.getPublishedTests(),
          apiService.getMyResults()
        ]);
        
        setRecentTests(testsResponse.data.slice(0, 5));
        setRecentResults(resultsResponse.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (test) => {
    const now = new Date();
    const scheduled = test.scheduledAt ? new Date(test.scheduledAt) : null;
    const expires = test.expiresAt ? new Date(test.expiresAt) : null;
    
    if (!test.isPublished) {
      return <span className="badge badge-secondary">Draft</span>;
    }
    if (scheduled && scheduled > now) {
      return <span className="badge badge-warning">Scheduled</span>;
    }
    if (expires && expires < now) {
      return <span className="badge badge-danger">Expired</span>;
    }
    return <span className="badge badge-success">Active</span>;
  };

  const getGradeBadge = (percentage) => {
    if (percentage >= 90) return <span className="badge badge-success">A</span>;
    if (percentage >= 80) return <span className="badge badge-primary">B</span>;
    if (percentage >= 70) return <span className="badge badge-warning">C</span>;
    if (percentage >= 60) return <span className="badge badge-secondary">D</span>;
    return <span className="badge badge-danger">F</span>;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      {user?.role === 'admin' ? (
        // Admin Dashboard
        <div className="admin-dashboard">
          {/* Stats Overview */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.overview?.totalTests || 0}</div>
              <div className="stat-label">Total Tests</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.overview?.totalSubmissions || 0}</div>
              <div className="stat-label">Total Submissions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.overview?.averageScore || 0}%</div>
              <div className="stat-label">Average Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.overview?.recentSubmissions || 0}</div>
              <div className="stat-label">Recent Submissions</div>
              <div className="stat-change text-muted">Last 7 days</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/admin/tests/new')}
              >
                ➕ Create New Test
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/admin/tests')}
              >
                📝 Manage Tests
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/admin/analytics')}
              >
                📊 View Analytics
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/admin/users')}
              >
                👥 Manage Users
              </button>
            </div>
          </div>

          {/* Recent Tests */}
          <div className="recent-section">
            <div className="section-header">
              <h2>Recent Tests</h2>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/admin/tests')}
              >
                View All
              </button>
            </div>
            
            {recentTests.length > 0 ? (
              <div className="tests-grid">
                {recentTests.map(test => (
                  <div key={test._id} className="test-card">
                    <div className="test-header">
                      <h3>{test.title}</h3>
                      {getStatusBadge(test)}
                    </div>
                    <p className="test-subject">{test.subject}</p>
                    <div className="test-meta">
                      <span>{test.questions?.length || 0} questions</span>
                      <span>•</span>
                      <span>{test.totalPoints} points</span>
                      <span>•</span>
                      <span>{test.duration} min</span>
                    </div>
                    <div className="test-date">
                      Created: {formatDate(test.createdAt)}
                    </div>
                    <div className="test-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/admin/tests/${test._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/admin/tests/${test._id}/results`)}
                      >
                        Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No tests created yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/tests/new')}
                >
                  Create Your First Test
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Student Dashboard
        <div className="student-dashboard">
          {/* Student Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{recentTests.length}</div>
              <div className="stat-label">Available Tests</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{recentResults.length}</div>
              <div className="stat-label">Tests Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {recentResults.length > 0 
                  ? Math.round(recentResults.reduce((sum, r) => sum + r.percentage, 0) / recentResults.length)
                  : 0
                }%
              </div>
              <div className="stat-label">Average Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {recentResults.filter(r => r.percentage >= 80).length}
              </div>
              <div className="stat-label">Tests Passed</div>
              <div className="stat-change text-muted">≥80% score</div>
            </div>
          </div>

          {/* Available Tests */}
          <div className="recent-section">
            <div className="section-header">
              <h2>Available Tests</h2>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/student')}
              >
                View All
              </button>
            </div>
            
            {recentTests.length > 0 ? (
              <div className="tests-grid">
                {recentTests.map(test => {
                  const hasAttempted = recentResults.some(r => r.test._id === test._id);
                  return (
                    <div key={test._id} className="test-card">
                      <div className="test-header">
                        <h3>{test.title}</h3>
                        {hasAttempted ? (
                          <span className="badge badge-success">Completed</span>
                        ) : (
                          <span className="badge badge-primary">Available</span>
                        )}
                      </div>
                      <p className="test-subject">{test.subject}</p>
                      <div className="test-meta">
                        <span>{test.questions?.length || 0} questions</span>
                        <span>•</span>
                        <span>{test.totalPoints} points</span>
                        <span>•</span>
                        <span>{test.duration} min</span>
                      </div>
                      <div className="test-actions">
                        {hasAttempted ? (
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              const result = recentResults.find(r => r.test._id === test._id);
                              navigate(`/results/${result._id}`);
                            }}
                          >
                            View Result
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/test/${test._id}`)}
                          >
                            Start Test
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No tests available at the moment.</p>
              </div>
            )}
          </div>

          {/* Recent Results */}
          {recentResults.length > 0 && (
            <div className="recent-section">
              <div className="section-header">
                <h2>Recent Results</h2>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/results')}
                >
                  View All
                </button>
              </div>
              
              <div className="results-list">
                {recentResults.map(result => (
                  <div key={result._id} className="result-card">
                    <div className="result-header">
                      <h4>{result.test.title}</h4>
                      {getGradeBadge(result.percentage)}
                    </div>
                    <div className="result-details">
                      <div className="result-score">
                        {result.score} / {result.totalPoints} points ({result.percentage}%)
                      </div>
                      <div className="result-date">
                        Submitted: {formatDate(result.submittedAt)}
                      </div>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/results/${result._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
