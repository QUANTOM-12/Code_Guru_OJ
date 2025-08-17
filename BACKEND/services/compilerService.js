const axios = require('axios');  // Simple declaration - remove any other axios declarations

class CompilerService {
  constructor() {
    this.baseURL = process.env.COMPILER_URL || 'http://localhost:5001';
    this.client = axios.create({
      baseURL: `${this.baseURL}/api/compiler`,
      timeout: 35000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async executeCode(code, language, input = '') {
    try {
      console.log(`🔗 Calling compiler service: ${this.baseURL}/api/compiler/run`);
      const response = await this.client.post('/run', {
        code,
        language,
        input
      });
      return response.data;
    } catch (error) {
      console.error('❌ Compiler service error:', error.message);
      return {
        success: false,
        error: 'Compiler service unavailable',
        output: '',
        executionTime: 0
      };
    }
  }
  

  async getAIHint(code, language, problemStatement) {
    try {
      const response = await this.client.post('/hint', {
        code,
        language,
        problemStatement
      });
      return response.data;
    } catch (error) {
      console.error('❌ AI hint error:', error.message);
      return { success: false, hint: 'AI hint unavailable' };
    }
  }

  async getCompilerStatus() {
    try {
      const response = await this.client.get('/ai-status');
      return response.data;
    } catch (error) {
      return { success: false, aiEnabled: false };
    }
  }
}

module.exports = new CompilerService();