const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not configured. AI features disabled.');
      this.genAI = null;
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
      this.genAI = null;
    }
  }

  isEnabled() {
    return !!this.genAI;
  }

  async generateCodeExplanation(code, language, verdict) {
    if (!this.genAI) return null;

    try {
      const prompt = `
Analyze this ${language} code submission that received verdict: ${verdict}

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide a concise analysis with:
1. **Code Explanation**: Brief overview of what the code does
2. **Verdict Analysis**: Why it might have received "${verdict}"
3. **Improvements**: Specific suggestions for optimization
4. **Complexity**: Time and space complexity analysis

Keep response under 300 words and educational.
      `.trim();

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();

    } catch (error) {
      console.error('AI explanation error:', error.message);
      return null;
    }
  }

  async generateHint(problemStatement, userCode, language) {
    if (!this.genAI) return null;

    try {
      const prompt = `
Problem: ${problemStatement.substring(0, 800)}...

User's ${language} attempt:
\`\`\`${language}
${userCode.substring(0, 1000)}...
\`\`\`

Provide a helpful hint to guide the user toward the solution WITHOUT giving away the answer. Focus on:
- Algorithmic approach suggestions
- Common pitfalls to avoid  
- Edge cases to consider
- Better data structures if needed

Keep hint under 150 words.
      `.trim();

      const result = await this.model.generateContent(prompt);
      return result.response.text();

    } catch (error) {
      console.error('AI hint generation error:', error.message);
      return null;
    }
  }

  async debugCode(code, language, error) {
    if (!this.genAI) return null;

    try {
      const prompt = `
Debug this ${language} code that produced an error:

Code:
\`\`\`${language}
${code}
\`\`\`

Error: ${error}

Provide:
1. **Root Cause**: What's causing the error
2. **Fix**: Specific code changes needed
3. **Prevention**: How to avoid similar errors

Be concise and practical.
      `.trim();

      const result = await this.model.generateContent(prompt);
      return result.response.text();

    } catch (error) {
      console.error('AI debug error:', error.message);
      return null;
    }
  }

  async optimizeCode(code, language) {
    if (!this.genAI) return null;

    try {
      const prompt = `
Optimize this ${language} code for better performance:

\`\`\`${language}
${code}
\`\`\`

Suggest:
1. **Performance improvements** 
2. **Memory optimizations**
3. **Best practices** for ${language}
4. **Code style** improvements

Provide specific, actionable suggestions.
      `.trim();

      const result = await this.model.generateContent(prompt);
      return result.response.text();

    } catch (error) {
      console.error('AI optimization error:', error.message);
      return null;
    }
  }
}

module.exports = new AIService();