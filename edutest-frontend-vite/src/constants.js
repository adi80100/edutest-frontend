// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin'
};

// Question types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  SHORT_ANSWER: 'short-answer',
  ESSAY: 'essay'
};

// Test status
export const TEST_STATUS = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  SUBMITTED: 'submitted',
  AUTO_SUBMITTED: 'auto-submitted'
};

// API endpoints base URL
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
