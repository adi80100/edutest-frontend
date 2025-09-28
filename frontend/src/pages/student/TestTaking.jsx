import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './TestTaking.css';

const TestTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Auto-save effect
  useEffect(() => {
    if (test && result && Object.keys(answers).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        autoSaveProgress();
      }, 5000); // Auto-save every 5 seconds
      return () => clearTimeout(autoSaveTimer);
    }
  }, [answers, test, result]);

  // Load test and start/resume attempt
  useEffect(() => {
    const loadTestAndStart = async () => {
      try {
        // Get test details
        const testResponse = await apiService.getTestForStudent(id);
        setTest(testResponse.data);

        // Start or resume test
        const resultResponse = await apiService.startTest(id);
        setResult(resultResponse.data);

        // Calculate time left
        const startTime = new Date(resultResponse.data.startedAt);
        const testDuration = testResponse.data.duration * 60; // Convert to seconds
        const elapsedTime = Math.floor((new Date() - startTime) / 1000);
        const remainingTime = Math.max(0, testDuration - elapsedTime);
        setTimeLeft(remainingTime);

        // Load existing answers if resuming
        if (resultResponse.data.answers && resultResponse.data.answers.length > 0) {
          const existingAnswers = {};
          resultResponse.data.answers.forEach(answer => {
            existingAnswers[answer.questionId] = answer.answer;
          });
          setAnswers(existingAnswers);
        }

      } catch (error) {
        console.error('Error loading test:', error);
        toast.error(error.response?.data?.error || 'Failed to load test');
        navigate('/student');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadTestAndStart();
    }
  }, [id, navigate]);

  const autoSaveProgress = useCallback(async () => {
    if (!test || !result) return;
    
    setAutoSaving(true);
    try {
      const currentQuestion = test.questions[currentQuestionIndex];
      const currentAnswer = answers[currentQuestion._id];
      
      if (currentAnswer !== undefined && currentAnswer !== '') {
        await apiService.saveAnswer(id, currentQuestion._id, currentAnswer);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [test, result, answers, currentQuestionIndex, id]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const formattedAnswers = test.questions.map(question => ({
        questionId: question._id,
        answer: answers[question._id] || '',
        timeSpent: 0 // Could track per-question time in future
      }));

      await apiService.submitTest(id, formattedAnswers);
      toast.success('Test submitted successfully!');
      navigate('/results');
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error(error.response?.data?.error || 'Failed to submit test');
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    toast.warning('Time is up! Submitting test automatically...');
    await handleSubmit();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[question._id] || '';

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="question-options">
            {question.options.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="radio"
                  name={`question_${question._id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="question-options">
            <label className="option-label">
              <input
                type="radio"
                name={`question_${question._id}`}
                value="true"
                checked={currentAnswer === 'true'}
                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              />
              <span className="option-text">True</span>
            </label>
            <label className="option-label">
              <input
                type="radio"
                name={`question_${question._id}`}
                value="false"
                checked={currentAnswer === 'false'}
                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              />
              <span className="option-text">False</span>
            </label>
          </div>
        );

      case 'short-answer':
        return (
          <input
            type="text"
            className="short-answer-input"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Type your answer here..."
          />
        );

      case 'essay':
        return (
          <textarea
            className="essay-textarea"
            rows={6}
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Write your essay here..."
          />
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="test-taking-container loading">
        <div className="loading-spinner"></div>
        <p>Loading test...</p>
      </div>
    );
  }

  if (!test || !result) {
    return (
      <div className="test-taking-container error">
        <h2>Test not found</h2>
        <button onClick={() => navigate('/student')} className="btn btn-primary">
          Back to Tests
        </button>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== '').length;

  return (
    <div className="test-taking-container">
      {/* Header */}
      <div className="test-header">
        <div className="test-info">
          <h1>{test.title}</h1>
          <div className="test-meta">
            <span>Question {currentQuestionIndex + 1} of {test.questions.length}</span>
            <span>•</span>
            <span>{test.totalPoints} points total</span>
            <span>•</span>
            <span>{answeredCount} of {test.questions.length} answered</span>
          </div>
        </div>
        
        <div className="test-timer">
          <div className={`timer ${timeLeft < 300 ? 'warning' : ''} ${timeLeft < 60 ? 'critical' : ''}`}>
            <span className="timer-label">Time Remaining:</span>
            <span className="timer-value">{formatTime(timeLeft)}</span>
          </div>
          {autoSaving && <div className="auto-save-indicator">Auto-saving...</div>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Main Content */}
      <div className="test-body">
        {/* Question Navigation */}
        <div className="question-navigation">
          <h3>Questions</h3>
          <div className="question-numbers">
            {test.questions.map((_, index) => (
              <button
                key={index}
                className={`question-number ${
                  index === currentQuestionIndex ? 'current' : ''
                } ${
                  answers[test.questions[index]._id] ? 'answered' : 'unanswered'
                }`}
                onClick={() => handleQuestionJump(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="question-content">
          <div className="question-header">
            <h2>Question {currentQuestionIndex + 1}</h2>
            <div className="question-points">{currentQuestion.points} points</div>
          </div>
          
          <div className="question-text">
            {currentQuestion.question}
          </div>
          
          <div className="question-answer">
            {renderQuestion(currentQuestion)}
          </div>
          
          {/* Navigation Buttons */}
          <div className="question-nav-buttons">
            <button
              className="btn btn-secondary"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            
            <div className="question-counter">
              {currentQuestionIndex + 1} / {test.questions.length}
            </div>
            
            <button
              className="btn btn-secondary"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === test.questions.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="test-footer">
        <button
          className="btn btn-success submit-btn"
          onClick={() => setShowConfirmSubmit(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Submit Test?</h3>
            <p>
              Are you sure you want to submit your test? You have answered{' '}
              {answeredCount} out of {test.questions.length} questions.
            </p>
            <p><strong>This action cannot be undone.</strong></p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmSubmit(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit();
                }}
              >
                Yes, Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTaking;
