import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
    upcomingTests: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [testsResponse, resultsResponse] = await Promise.all([
        apiService.getPublishedTests(),
        apiService.getMyResults()
      ]);
      
      const testsData = testsResponse.data || [];
      const resultsData = resultsResponse.data || [];
      
      setTests(testsData);
      setResults(resultsData);
      
      // Calculate statistics
      const now = new Date();
      const upcomingTests = testsData.filter(test => {
        const scheduled = new Date(test.scheduledAt);
        const expires = new Date(test.expiresAt);
        return scheduled <= now && expires >= now;
      });
      
      const completedResults = resultsData.filter(result => result.status === 'completed');
      const averageScore = completedResults.length > 0 
        ? completedResults.reduce((sum, result) => sum + result.percentage, 0) / completedResults.length
        : 0;
      
      setStats({
        totalTests: testsData.length,
        completedTests: completedResults.length,
        averageScore: Math.round(averageScore),
        upcomingTests: upcomingTests.length
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTestStatus = (test) => {
    const now = new Date();
    const scheduled = new Date(test.scheduledAt);
    const expires = new Date(test.expiresAt);
    
    if (scheduled > now) return 'upcoming';
    if (expires < now) return 'expired';
    
    // Check if student has completed the test
    const testResult = results.find(result => result.test._id === test._id);
    if (testResult && testResult.status === 'completed') return 'completed';
    
    return 'available';
  };

  const getAvailableTests = () => {
    return tests.filter(test => {
      const status = getTestStatus(test);
      return status === 'available' || status === 'upcoming';
    }).slice(0, 5);
  };

  const getRecentResults = () => {
    return results
      .filter(result => result.status === 'completed')
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p className="subtitle">Here's your learning progress overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalTests}</h3>
            <p>Available Tests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedTests}</h3>
            <p>Completed Tests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.averageScore}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>{stats.upcomingTests}</h3>
            <p>Upcoming Tests</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Available Tests */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Available Tests</h2>
            <Link to="/tests" className="view-all-link">View All</Link>
          </div>
          
          <div className="tests-list">
            {getAvailableTests().map(test => {
              const status = getTestStatus(test);
              return (
                <div key={test._id} className={`test-item ${status}`}>
                  <div className="test-info">
                    <h3>{test.title}</h3>
                    <p>{test.description}</p>
                    <div className="test-details">
                      <span className="detail">📚 {test.subject}</span>
                      <span className="detail">⏱️ {test.duration}min</span>
                      <span className="detail">📝 {test.questions?.length || 0} questions</span>
                      <span className="detail">🎯 {test.totalPoints} points</span>
                    </div>
                    {test.scheduledAt && (
                      <div className="schedule-info">
                        <span>📅 Scheduled: {formatDate(test.scheduledAt)}</span>
                        {test.expiresAt && (
                          <span>🔚 Expires: {formatDate(test.expiresAt)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="test-actions">
                    <span className={`status-badge ${status}`}>
                      {status === 'available' && '🟢 Available'}
                      {status === 'upcoming' && '🔵 Upcoming'}
                      {status === 'completed' && '✅ Completed'}
                      {status === 'expired' && '🔴 Expired'}
                    </span>
                    
                    {status === 'available' && (
                      <Link 
                        to={`/test/${test._id}`} 
                        className="btn btn-primary btn-small"
                      >
                        Start Test
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            
            {getAvailableTests().length === 0 && (
              <div className="empty-state">
                <p>No tests available at the moment.</p>
                <p>Check back later for new assignments!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Results</h2>
            <Link to="/results" className="view-all-link">View All</Link>
          </div>
          
          <div className="results-list">
            {getRecentResults().map(result => (
              <div key={result._id} className="result-item">
                <div className="result-info">
                  <h3>{result.test?.title || 'Unknown Test'}</h3>
                  <div className="result-details">
                    <span>📅 {formatDate(result.submittedAt)}</span>
                    <span>⏱️ {Math.round(result.timeSpent / 60)}min spent</span>
                  </div>
                </div>
                
                <div className="result-score">
                  <div className={`score-circle ${getPerformanceColor(result.percentage)}`}>
                    <span className="score-value">{result.percentage}%</span>
                  </div>
                  <div className="score-details">
                    <span>{result.score}/{result.totalPoints}</span>
                    <small>points</small>
                  </div>
                </div>
                
                <Link 
                  to={`/results/${result._id}`} 
                  className="btn btn-secondary btn-small"
                >
                  View Details
                </Link>
              </div>
            ))}
            
            {getRecentResults().length === 0 && (
              <div className="empty-state">
                <p>No results yet.</p>
                <p>Complete some tests to see your performance!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/tests" className="action-card">
              <div className="action-icon">📝</div>
              <h3>Browse Tests</h3>
              <p>View all available tests</p>
            </Link>
            
            <Link to="/results" className="action-card">
              <div className="action-icon">📊</div>
              <h3>My Results</h3>
              <p>Review your performance</p>
            </Link>
            
            <Link to="/profile" className="action-card">
              <div className="action-icon">👤</div>
              <h3>Profile</h3>
              <p>Manage your account</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
