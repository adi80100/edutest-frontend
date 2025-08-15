export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  studentId?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Question {
  _id?: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer?: any;
  points: number;
  explanation?: string;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  subject: string;
  duration: number;
  totalPoints: number;
  questions: Question[];
  instructions?: string;
  createdBy: string | User;
  isPublished: boolean;
  scheduledAt?: Date;
  expiresAt?: Date;
  allowedAttempts: number;
  randomizeQuestions: boolean;
  showResults: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  questionId: string;
  answer: any;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent?: number;
}

export interface Result {
  _id: string;
  student: string | User;
  test: string | Test;
  answers: Answer[];
  score: number;
  totalPoints: number;
  percentage: number;
  status: 'in-progress' | 'completed' | 'submitted' | 'auto-submitted';
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number;
  attemptNumber: number;
  ipAddress?: string;
  userAgent?: string;
  flaggedForReview: boolean;
  reviewNotes?: string;
  graded: boolean;
  gradedBy?: string | User;
  gradedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  pagination?: {
    prev?: { page: number; limit: number };
    next?: { page: number; limit: number };
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: User;
}

export interface Analytics {
  overview: {
    totalTests: number;
    totalSubmissions: number;
    averageScore: number;
    recentSubmissions: number;
  };
  gradeDistribution: Record<string, number>;
  testPerformance: Array<{
    testId: string;
    title: string;
    submissions: number;
    averageScore: number;
  }>;
}

export interface TestAnalytics {
  testInfo: {
    title: string;
    totalQuestions: number;
    totalSubmissions: number;
    averageScore: number;
  };
  questionAnalysis: Array<{
    questionId: string;
    question: string;
    type: string;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: string;
    averageTimeSpent: number;
  }>;
}

export interface TestFormData {
  title: string;
  description: string;
  subject: string;
  duration: number;
  questions: Question[];
  instructions?: string;
  scheduledAt?: string;
  expiresAt?: string;
  allowedAttempts: number;
  randomizeQuestions: boolean;
  showResults: boolean;
  tags?: string[];
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  studentId?: string;
  isActive?: boolean;
}
