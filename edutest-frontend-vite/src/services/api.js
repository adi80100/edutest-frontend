import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getMe() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await this.api.put('/auth/profile', profileData);
    return response.data;
  }

  async changePassword(passwordData) {
    const response = await this.api.put('/auth/change-password', passwordData);
    return response.data;
  }

  // Test endpoints
  async getTests() {
    const response = await this.api.get('/tests');
    return response.data;
  }

  async getPublishedTests() {
    const response = await this.api.get('/tests/published');
    return response.data;
  }

  async getTest(id) {
    const response = await this.api.get(`/tests/${id}`);
    return response.data;
  }

  async getTestForStudent(id) {
    const response = await this.api.get(`/tests/${id}/student`);
    return response.data;
  }

  async createTest(testData) {
    const response = await this.api.post('/tests', testData);
    return response.data;
  }

  async updateTest(id, testData) {
    const response = await this.api.put(`/tests/${id}`, testData);
    return response.data;
  }

  async deleteTest(id) {
    const response = await this.api.delete(`/tests/${id}`);
    return response.data;
  }

  async publishTest(id) {
    const response = await this.api.put(`/tests/${id}/publish`);
    return response.data;
  }

  async unpublishTest(id) {
    const response = await this.api.put(`/tests/${id}/unpublish`);
    return response.data;
  }

  async startTest(id) {
    const response = await this.api.post(`/tests/${id}/start`);
    return response.data;
  }

  async submitTest(id, answers) {
    const response = await this.api.post(`/tests/${id}/submit`, { answers });
    return response.data;
  }

  async saveAnswer(id, questionId, answer) {
    const response = await this.api.post(`/tests/${id}/save-answer`, {
      questionId,
      answer,
    });
    return response.data;
  }

  // Result endpoints
  async getMyResults() {
    const response = await this.api.get('/results/my');
    return response.data;
  }

  async getResults(params) {
    const response = await this.api.get('/results', { params });
    return response.data;
  }

  async getResult(id) {
    const response = await this.api.get(`/results/${id}`);
    return response.data;
  }

  async getTestResults(testId, params) {
    const response = await this.api.get(`/results/test/${testId}`, { params });
    return response.data;
  }

  async getAnalytics() {
    const response = await this.api.get('/results/analytics');
    return response.data;
  }

  async getTestAnalytics(testId) {
    const response = await this.api.get(`/results/test/${testId}/analytics`);
    return response.data;
  }

  async updateResult(id, resultData) {
    const response = await this.api.put(`/results/${id}`, resultData);
    return response.data;
  }

  async deleteResult(id) {
    const response = await this.api.delete(`/results/${id}`);
    return response.data;
  }

  async exportResults(testId) {
    const response = await this.api.get(`/results/export/${testId}`, {
      responseType: 'blob',
    });
    return response;
  }

  // User endpoints
  async getUsers(params) {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData) {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id, userData) {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  async getStudents() {
    const response = await this.api.get('/users/students');
    return response.data;
  }

  async getAdmins() {
    const response = await this.api.get('/users/admins');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
