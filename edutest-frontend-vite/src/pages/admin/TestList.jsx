import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './TestList.css';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTests();
      setTests(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch tests');
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await apiService.deleteTest(testId);
        toast.success('Test deleted successfully');
        fetchTests();
      } catch (error) {
        toast.error('Failed to delete test');
      }
    }
  };

  const handlePublishToggle = async (testId, currentStatus) => {
    try {
      if (currentStatus) {
        await apiService.unpublishTest(testId);
        toast.success('Test unpublished successfully');
      } else {
        await apiService.publishTest(testId);
        toast.success('Test published successfully');
      }
      fetchTests();
    } catch (error) {
      toast.error('Failed to update test status');
    }
  };

  const getUniqueSubjects = () => {
    const subjects = tests.map(test => test.subject).filter(Boolean);
    return [...new Set(subjects)];
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'published' && test.isPublished) ||
                         (filterStatus === 'draft' && !test.isPublished);
    
    const matchesSubject = filterSubject === 'all' || test.subject === filterSubject;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading tests..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Test Management</h1>
        <Link to="/admin/tests/new" className="btn btn-primary">
          Create New Test
        </Link>
      </div>

      <div className="test-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select 
            value={filterSubject} 
            onChange={(e) => setFilterSubject(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Subjects</option>
            {getUniqueSubjects().map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="test-stats">
        <div className="stat-card">
          <h3>{tests.length}</h3>
          <p>Total Tests</p>
        </div>
        <div className="stat-card">
          <h3>{tests.filter(t => t.isPublished).length}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h3>{tests.filter(t => !t.isPublished).length}</h3>
          <p>Drafts</p>
        </div>
        <div className="stat-card">
          <h3>{getUniqueSubjects().length}</h3>
          <p>Subjects</p>
        </div>
      </div>

      <div className="tests-grid">
        {filteredTests.map(test => (
          <div key={test._id} className="test-card">
            <div className="test-header">
              <h3>{test.title}</h3>
              <div className="test-status">
                <span className={`status-badge ${test.isPublished ? 'published' : 'draft'}`}>
                  {test.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            
            <div className="test-info">
              <p className="test-description">{test.description}</p>
              <div className="test-details">
                <div className="detail-item">
                  <span className="label">Subject:</span>
                  <span className="value">{test.subject}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Duration:</span>
                  <span className="value">{test.duration} minutes</span>
                </div>
                <div className="detail-item">
                  <span className="label">Questions:</span>
                  <span className="value">{test.questions?.length || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Points:</span>
                  <span className="value">{test.totalPoints}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Attempts:</span>
                  <span className="value">{test.allowedAttempts}</span>
                </div>
              </div>

              {test.scheduledAt && (
                <div className="schedule-info">
                  <span className="label">Scheduled:</span>
                  <span className="value">{formatDateTime(test.scheduledAt)}</span>
                </div>
              )}

              {test.expiresAt && (
                <div className="schedule-info">
                  <span className="label">Expires:</span>
                  <span className="value">{formatDateTime(test.expiresAt)}</span>
                </div>
              )}

              {test.tags && test.tags.length > 0 && (
                <div className="test-tags">
                  {test.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="test-actions">
              <Link 
                to={`/admin/tests/${test._id}/edit`} 
                className="btn btn-small btn-secondary"
              >
                Edit
              </Link>
              <Link 
                to={`/admin/tests/${test._id}/results`} 
                className="btn btn-small btn-info"
              >
                Results
              </Link>
              <button 
                className={`btn btn-small ${test.isPublished ? 'btn-warning' : 'btn-success'}`}
                onClick={() => handlePublishToggle(test._id, test.isPublished)}
              >
                {test.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button 
                className="btn btn-small btn-danger"
                onClick={() => handleDelete(test._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="no-data">
          <div className="no-data-content">
            <h3>No tests found</h3>
            <p>Create your first test to get started.</p>
            <Link to="/admin/tests/new" className="btn btn-primary">
              Create Test
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestList;
