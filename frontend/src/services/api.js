const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Problems
  async getProblems() {
    return this.request('/problems');
  }

  async getProblem(id) {
    return this.request(`/problems/${id}`);
  }

  // Submissions
  async submitSolution(problemId, code, language) {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify({ problemId, code, language })
    });
  }

  async getHint(problemId, code, language) {
    return this.request('/submissions/hint', {
      method: 'POST',
      body: JSON.stringify({ problemId, code, language })
    });
  }

  async getUserSubmissions(userId) {
    return this.request(`/submissions/user/${userId}`);
  }

  // Auth
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      this.token = response.token;
    }
    
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.token = null;
  }
}

export default new ApiService();
