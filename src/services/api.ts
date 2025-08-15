import axios, { AxiosInstance, AxiosResponse } from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

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
      (response: AxiosResponse) => response,
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
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getMe() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(profileData: any) {
    const response = await this.api.put('/auth/profile', profileData);
    return response.data;
  }

  async changePassword(passwordData: any) {
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

  async getTest(id: string) {
    const response = await this.api.get(`/tests/${id}`);
    return response.data;
  }

  async getTestForStudent(id: string) {
    const response = await this.api.get(`/tests/${id}/student`);
    return response.data;
  }

  async createTest(testData: any) {
    const response = await this.api.post('/tests', testData);
    return response.data;
  }

  async updateTest(id: string, testData: any) {
    const response = await this.api.put(`/tests/${id}`, testData);
    return response.data;
  }

  async deleteTest(id: string) {
    const response = await this.api.delete(`/tests/${id}`);
    return response.data;
  }

  async publishTest(id: string) {
    const response = await this.api.put(`/tests/${id}/publish`);
    return response.data;
  }

  async unpublishTest(id: string) {
    const response = await this.api.put(`/tests/${id}/unpublish`);
    return response.data;
  }

  async startTest(id: string) {
    const response = await this.api.post(`/tests/${id}/start`);
    return response.data;
  }

  async submitTest(id: string, answers: any[]) {
    const response = await this.api.post(`/tests/${id}/submit`, { answers });
    return response.data;
  }

  async saveAnswer(id: string, questionId: string, answer: any) {
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

  async getResults(params?: any) {
    const response = await this.api.get('/results', { params });
    return response.data;
  }

  async getResult(id: string) {
    const response = await this.api.get(`/results/${id}`);
    return response.data;
  }

  async getTestResults(testId: string, params?: any) {
    const response = await this.api.get(`/results/test/${testId}`, { params });
    return response.data;
  }

  async getAnalytics() {
    const response = await this.api.get('/results/analytics');
    return response.data;
  }

  async getTestAnalytics(testId: string) {
    const response = await this.api.get(`/results/test/${testId}/analytics`);
    return response.data;
  }

  async updateResult(id: string, resultData: any) {
    const response = await this.api.put(`/results/${id}`, resultData);
    return response.data;
  }

  async deleteResult(id: string) {
    const response = await this.api.delete(`/results/${id}`);
    return response.data;
  }

  async exportResults(testId: string) {
    const response = await this.api.get(`/results/export/${testId}`, {
      responseType: 'blob',
    });
    return response;
  }

  // User endpoints
  async getUsers(params?: any) {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: any) {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: any) {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string) {
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

export default new ApiService();
