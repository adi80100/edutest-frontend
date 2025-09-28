import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import './TestForm.css';

const TestForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: 60,
    instructions: '',
    scheduledAt: '',
    expiresAt: '',
    allowedAttempts: 1,
    randomizeQuestions: false,
    showResults: true,
    tags: ''
  });
  
  const [questions, setQuestions] = useState([
    {
      question: '',
      type: 'multiple-choice',
      options: ['', ''],
      correctAnswer: '',
      points: 1,
      explanation: ''
    }
  ]);

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    
    // Handle special cases for question types
    if (field === 'type') {
      if (value === 'multiple-choice') {
        updatedQuestions[index].options = ['', ''];
        updatedQuestions[index].correctAnswer = '';
      } else if (value === 'true-false') {
        updatedQuestions[index].options = ['True', 'False'];
        updatedQuestions[index].correctAnswer = '';
      } else if (value === 'short-answer' || value === 'essay') {
        updatedQuestions[index].options = [];
        updatedQuestions[index].correctAnswer = value === 'essay' ? '' : '';
      }
    }
    
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(updatedQuestions);
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: '',
        type: 'multiple-choice',
        options: ['', ''],
        correctAnswer: '',
        points: 1,
        explanation: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = { ...questions[index] };
    questionToDuplicate.options = [...questionToDuplicate.options];
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions.splice(index + 1, 0, questionToDuplicate);
      return newQuestions;
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Test title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Test description is required');
      return false;
    }
    if (!formData.subject.trim()) {
      toast.error('Subject is required');
      return false;
    }
    if (formData.duration < 1) {
      toast.error('Duration must be at least 1 minute');
      return false;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }
      if (question.points < 1) {
        toast.error(`Question ${i + 1} must have at least 1 point`);
        return false;
      }
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        if (!question.correctAnswer) {
          toast.error(`Question ${i + 1} must have a correct answer selected`);
          return false;
        }
        if (question.type === 'multiple-choice' && question.options.some(opt => !opt.trim())) {
          toast.error(`Question ${i + 1} must have all options filled`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const testData = {
        ...formData,
        questions: questions.map(q => ({
          ...q,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        }))
      };
      
      if (testData.scheduledAt) {
        testData.scheduledAt = new Date(testData.scheduledAt).toISOString();
      }
      if (testData.expiresAt) {
        testData.expiresAt = new Date(testData.expiresAt).toISOString();
      }
      
      await apiService.createTest(testData);
      toast.success('Test created successfully!');
      navigate('/admin/tests');
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error(error.response?.data?.error || 'Failed to create test');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionForm = (question, index) => {
    return (
      <div key={index} className="question-form">
        <div className="question-header">
          <h3>Question {index + 1}</h3>
          <div className="question-actions">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => duplicateQuestion(index)}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => removeQuestion(index)}
              disabled={questions.length === 1}
            >
              Remove
            </button>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Question Text *</label>
            <textarea
              rows={3}
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              placeholder="Enter your question here..."
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Question Type *</label>
            <select
              value={question.type}
              onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Points *</label>
            <input
              type="number"
              min="1"
              value={question.points}
              onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value) || 1)}
              required
            />
          </div>
        </div>
        
        {/* Options for multiple choice and true/false */}
        {(question.type === 'multiple-choice' || question.type === 'true-false') && (
          <div className="form-group">
            <label>Options *</label>
            <div className="options-container">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    disabled={question.type === 'true-false'}
                  />
                  <label className="correct-answer-radio">
                    <input
                      type="radio"
                      name={`correct_${index}`}
                      value={option}
                      checked={question.correctAnswer === option}
                      onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                    />
                    Correct
                  </label>
                  {question.type === 'multiple-choice' && question.options.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeOption(index, optionIndex)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {question.type === 'multiple-choice' && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary add-option-btn"
                  onClick={() => addOption(index)}
                >
                  + Add Option
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Correct answer for short answer */}
        {question.type === 'short-answer' && (
          <div className="form-group">
            <label>Correct Answer *</label>
            <input
              type="text"
              value={question.correctAnswer}
              onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
              placeholder="Enter the correct answer"
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Explanation (Optional)</label>
          <textarea
            rows={2}
            value={question.explanation}
            onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
            placeholder="Explain why this is the correct answer (shown after submission)"
          />
        </div>
      </div>
    );
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="test-form-container">
      <div className="test-form-header">
        <h1>Create New Test</h1>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/admin/tests')}
        >
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="test-form">
        {/* Basic Test Information */}
        <div className="form-section">
          <h2>Test Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Test Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter test title"
                required
              />
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g. Mathematics, Science"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the test"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Instructions</label>
            <textarea
              name="instructions"
              rows={4}
              value={formData.instructions}
              onChange={handleInputChange}
              placeholder="Special instructions for students taking this test"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                min="1"
                value={formData.duration}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Allowed Attempts</label>
              <input
                type="number"
                name="allowedAttempts"
                min="1"
                value={formData.allowedAttempts}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        {/* Test Settings */}
        <div className="form-section">
          <h2>Test Settings</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Scheduled Start Time</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Expiry Time</label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="randomizeQuestions"
                checked={formData.randomizeQuestions}
                onChange={handleInputChange}
              />
              Randomize question order
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="showResults"
                checked={formData.showResults}
                onChange={handleInputChange}
              />
              Show results to students after submission
            </label>
          </div>
        </div>
        
        {/* Questions Section */}
        <div className="form-section">
          <div className="questions-header">
            <h2>Questions ({questions.length})</h2>
            <div className="questions-stats">
              <span>Total Points: {totalPoints}</span>
            </div>
          </div>
          
          <div className="questions-container">
            {questions.map((question, index) => renderQuestionForm(question, index))}
          </div>
          
          <button
            type="button"
            className="btn btn-primary add-question-btn"
            onClick={addQuestion}
          >
            + Add Question
          </button>
        </div>
        
        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/tests')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Test...' : 'Create Test'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestForm;
