import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const CodeEditor = ({ problem }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiHint, setAiHint] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await apiService.submitSolution(problem.id, code, language);
      if (result.success) {
        setOutput(`✅ ${result.submission.verdict}
Passed: ${result.submission.passedTestCases}/${result.submission.totalTestCases}

${result.submission.aiExplanation ? '🤖 AI Analysis:\n' + result.submission.aiExplanation : ''}`);
      } else {
        setOutput(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setOutput(`❌ Network Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleGetHint = async () => {
    if (!code.trim()) {
      setAiHint('Please write some code first to get a hint!');
      return;
    }

    try {
      const result = await apiService.getHint(problem.id, code, language);
      if (result.success) {
        setAiHint(`💡 AI Hint:\n${result.hint}`);
      } else {
        setAiHint('❌ Unable to generate hint. Please try again.');
      }
    } catch (error) {
      setAiHint('❌ Network error getting hint.');
    }
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <h3>Code Submission</h3>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="language-selector"
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Write your ${language} solution here...`}
        rows={20}
        cols={80}
        className="code-textarea"
      />

      <div className="editor-actions">
        <button 
          onClick={handleSubmit} 
          disabled={loading || !code.trim()}
          className="submit-btn"
        >
          {loading ? '⏳ Submitting...' : '🚀 Submit Solution'}
        </button>
        
        <button 
          onClick={handleGetHint}
          disabled={loading || !code.trim()}
          className="hint-btn"
        >
          💡 Get AI Hint
        </button>
      </div>

      {output && (
        <div className="output-section">
          <h4>Result:</h4>
          <pre className="output-text">{output}</pre>
        </div>
      )}

      {aiHint && (
        <div className="hint-section">
          <h4>AI Hint:</h4>
          <pre className="hint-text">{aiHint}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
