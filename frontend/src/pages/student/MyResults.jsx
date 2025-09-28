import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyResults();
      setResults(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch results');
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeInfo = (percentage) => {
    if (percentage >= 90) return { grade: 'A', color: 'excellent', emoji: '🏆' };
    if (percentage >= 80) return { grade: 'B', color: 'good', emoji: '⭐' };
    if (percentage >= 70) return { grade: 'C', color: 'average', emoji: '👍' };
    if (percentage >= 60) return { grade: 'D', color: 'below-average', emoji: '📝' };
    return { grade: 'F', color: 'poor', emoji: '📚' };
  };

  const getFilteredAndSortedResults = () => {
    let filtered = results.filter(result => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'completed') return result.status === 'completed';
      if (filterStatus === 'passed') return result.percentage >= 80;
      if (filterStatus === 'failed') return result.percentage < 80;
      return true;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'submittedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const calculateStats = () => {
    const completedResults = results.filter(r => r.status === 'completed');
    const totalTests = completedResults.length;
    const passedTests = completedResults.filter(r => r.percentage >= 80).length;
    const averageScore = totalTests > 0 
      ? Math.round(completedResults.reduce((sum, r) => sum + r.percentage, 0) / totalTests)
      : 0;
    const bestScore = totalTests > 0 
      ? Math.max(...completedResults.map(r => r.percentage))
      : 0;

    return { totalTests, passedTests, averageScore, bestScore };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const stats = calculateStats();
  const filteredResults = getFilteredAndSortedResults();

  if (loading) {
    return <LoadingSpinner message="Loading your results..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Test Results</h1>
        <p>Track your progress and performance across all tests</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.totalTests}</h3>
            <p>Tests Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>{stats.passedTests}</h3>
            <p>Tests Passed</p>
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
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.bestScore}%</h3>
            <p>Best Score</p>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="results-controls">
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Results</option>
            <option value="completed">Completed</option>
            <option value="passed">Passed (≥80%)</option>
            <option value="failed">Failed (&lt;80%)</option>
          </select>
          
          <select 
            value={`${sortBy}-${sortOrder}`} 
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="sort-select"
          >
            <option value="submittedAt-desc">Newest First</option>
            <option value="submittedAt-asc">Oldest First</option>
            <option value="percentage-desc">Highest Score First</option>
            <option value="percentage-asc">Lowest Score First</option>
          </select>
        </div>
        
        <div className="results-count">
          Showing {filteredResults.length} of {results.length} results
        </div>
      </div>

      {/* Results List */}
      <div className="results-container">
        {filteredResults.length > 0 ? (
          <div className="results-grid">
            {filteredResults.map(result => {
              const gradeInfo = getGradeInfo(result.percentage);
              return (
                <div key={result._id} className={`result-card ${gradeInfo.color}`}>
                  <div className="result-header">
                    <div className="test-info">
                      <h3>{result.test?.title || 'Unknown Test'}</h3>
                      <p className="test-subject">{result.test?.subject}</p>
                    </div>
                    <div className="grade-badge">
                      <span className="grade">{gradeInfo.grade}</span>
                      <span className="emoji">{gradeInfo.emoji}</span>
                    </div>
                  </div>
                  
                  <div className="result-details">
                    <div className="score-section">
                      <div className="main-score">
                        <span className="percentage">{result.percentage}%</span>
                        <span className="points">{result.score}/{result.totalPoints} points</span>
                      </div>
                      
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="result-meta">
                      <div className="meta-item">
                        <span className="label">📅 Submitted:</span>
                        <span className="value">{formatDate(result.submittedAt)}</span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="label">⏱️ Time Taken:</span>
                        <span className="value">{formatDuration(result.timeSpent)}</span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="label">📝 Questions:</span>
                        <span className="value">{result.test?.questions?.length || 0}</span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="label">🎯 Attempt:</span>
                        <span className="value">{result.attemptNumber || 1}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="result-actions">
                    <Link 
                      to={`/results/${result._id}`} 
                      className="btn btn-primary btn-small"
                    >
                      View Details
                    </Link>
                    
                    {result.test && (
                      <Link 
                        to={`/test/${result.test._id}`} 
                        className="btn btn-secondary btn-small"
                      >
                        Retake Test
                      </Link>
                    )}
                  </div>
                  
                  {result.percentage >= 80 && (
                    <div className="achievement-badge">
                      ✅ Passed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-content">
              <div className="no-results-icon">📊</div>
              <h3>No results found</h3>
              <p>
                {filterStatus === 'all' 
                  ? "You haven't completed any tests yet."
                  : `No results match the selected filter: ${filterStatus}.`
                }
              </p>
              <Link to="/student" className="btn btn-primary">
                Browse Available Tests
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResults;
