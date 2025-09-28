import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnalytics();
      setAnalyticsData(response.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (!analyticsData) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Analytics</h1>
        </div>
        <div className="error-message">
          <p>Unable to load analytics data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { overview, testStats, userStats, recentSubmissions } = analyticsData;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive insights into test performance and user activity</p>
      </div>

      {/* Overview Statistics */}
      <div className="analytics-section">
        <h2>Overview</h2>
        <div className="stats-grid">
          <div className="stat-card large">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{overview?.totalTests || 0}</h3>
              <p>Total Tests</p>
              <small>{overview?.publishedTests || 0} published</small>
            </div>
          </div>
          
          <div className="stat-card large">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{overview?.totalUsers || 0}</h3>
              <p>Total Users</p>
              <small>{overview?.activeUsers || 0} active</small>
            </div>
          </div>
          
          <div className="stat-card large">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{overview?.totalSubmissions || 0}</h3>
              <p>Total Submissions</p>
              <small>{overview?.recentSubmissions || 0} this week</small>
            </div>
          </div>
          
          <div className="stat-card large">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{overview?.averageScore || 0}%</h3>
              <p>Average Score</p>
              <small>Across all tests</small>
            </div>
          </div>
        </div>
      </div>

      {/* Test Performance */}
      <div className="analytics-section">
        <h2>Test Performance</h2>
        <div className="performance-grid">
          <div className="performance-card">
            <h3>Top Performing Tests</h3>
            {testStats?.topPerforming && testStats.topPerforming.length > 0 ? (
              <div className="test-list">
                {testStats.topPerforming.slice(0, 5).map((test, index) => (
                  <div key={test._id} className="test-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="test-info">
                      <h4>{test.title}</h4>
                      <p>{test.subject}</p>
                    </div>
                    <div className="test-score">
                      <span className="score">{test.averageScore}%</span>
                      <small>{test.submissionCount} submissions</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No test data available</p>
              </div>
            )}
          </div>
          
          <div className="performance-card">
            <h3>Most Popular Tests</h3>
            {testStats?.mostPopular && testStats.mostPopular.length > 0 ? (
              <div className="test-list">
                {testStats.mostPopular.slice(0, 5).map((test, index) => (
                  <div key={test._id} className="test-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="test-info">
                      <h4>{test.title}</h4>
                      <p>{test.subject}</p>
                    </div>
                    <div className="test-score">
                      <span className="score">{test.submissionCount}</span>
                      <small>attempts</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No popularity data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="analytics-section">
        <h2>User Activity</h2>
        <div className="user-stats-grid">
          <div className="user-stat-card">
            <h3>Top Performers</h3>
            {userStats?.topPerformers && userStats.topPerformers.length > 0 ? (
              <div className="user-list">
                {userStats.topPerformers.slice(0, 5).map((user, index) => (
                  <div key={user._id} className="user-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="user-score">
                      <span className="score">{user.averageScore}%</span>
                      <small>{user.testsCompleted} tests</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No user performance data available</p>
              </div>
            )}
          </div>
          
          <div className="user-stat-card">
            <h3>Most Active Users</h3>
            {userStats?.mostActive && userStats.mostActive.length > 0 ? (
              <div className="user-list">
                {userStats.mostActive.slice(0, 5).map((user, index) => (
                  <div key={user._id} className="user-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="user-score">
                      <span className="score">{user.testsCompleted}</span>
                      <small>tests completed</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No user activity data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="analytics-section">
        <h2>Recent Activity</h2>
        <div className="activity-section">
          {recentSubmissions && recentSubmissions.length > 0 ? (
            <div className="activity-list">
              {recentSubmissions.slice(0, 10).map((submission, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {submission.percentage >= 80 ? '✅' : '📝'}
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{submission.user?.name || 'Unknown User'}</strong> 
                      completed <strong>{submission.test?.title || 'Unknown Test'}</strong>
                    </p>
                    <div className="activity-details">
                      <span>Score: {submission.percentage}%</span>
                      <span>•</span>
                      <span>{formatDate(submission.submittedAt)}</span>
                      <span>•</span>
                      <span className={`status ${submission.percentage >= 80 ? 'passed' : 'failed'}`}>
                        {submission.percentage >= 80 ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No recent activity</h3>
              <p>Activity will appear here as students complete tests.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="analytics-section">
        <h2>Quick Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🔥</div>
            <div className="insight-content">
              <h3>Engagement Rate</h3>
              <div className="insight-value">85%</div>
              <p>Students are actively participating in tests</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h3>Pass Rate</h3>
              <div className="insight-value">72%</div>
              <p>Students scoring 80% or higher</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">⏱️</div>
            <div className="insight-content">
              <h3>Avg. Completion Time</h3>
              <div className="insight-value">24min</div>
              <p>Average time students spend on tests</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🎆</div>
            <div className="insight-content">
              <h3>Growth Trend</h3>
              <div className="insight-value">+15%</div>
              <p>Increase in test submissions this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
