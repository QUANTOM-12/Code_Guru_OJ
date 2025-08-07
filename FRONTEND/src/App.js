import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('homepage'); // 'homepage', 'problems', 'oj', 'leaderboard'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('// Write your code here\n#include<iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}');
  const [language, setLanguage] = useState('cpp');
  const [verdict, setVerdict] = useState('');
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard', 'submissions', 'discussion'

  // Sample data
  const problems = [
    { 
      id: 1, 
      name: "Two Sum", 
      difficulty: "Easy", 
      statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      editorial: "This problem can be solved using a hash map to store the complement of each number as we iterate through the array.",
      aiComment: "💡 AI Tip: Use a HashMap for O(n) time complexity instead of nested loops."
    },
    { 
      id: 2, 
      name: "Add Two Numbers", 
      difficulty: "Medium", 
      statement: "You are given two non-empty linked lists representing two non-negative integers stored in reverse order.",
      editorial: "Simulate addition by traversing both linked lists simultaneously and handling carry values.",
      aiComment: "🤖 AI Insight: Remember to handle different length lists and final carry digit."
    },
    { 
      id: 3, 
      name: "Longest Substring", 
      difficulty: "Hard", 
      statement: "Given a string s, find the length of the longest substring without repeating characters.",
      editorial: "Use sliding window technique with a set to track characters in current window.",
      aiComment: "⚡ AI Strategy: Sliding window + Set gives optimal O(n) solution."
    }
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('problems');
  };

  const handleSubmit = () => {
    setVerdict('Evaluating...');
    setTimeout(() => {
      setVerdict('Accepted');
    }, 2000);
  };

  // PAGE 1: Homepage
  const Homepage = () => (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Code Guru</h1>
          <div className="code-symbol">&lt;/&gt;</div>
          <p className="hero-subtitle">Master Your Coding Skills</p>
          <p className="hero-description">
            Welcome to Code Guru - the ultimate online judge platform where you can 
            practice coding problems, compete with others, and sharpen your programming skills.
          </p>
        </div>
      </div>
      
      <div className="auth-section">
        <h2>Join Code Guru Community</h2>
        <div className="auth-container">
          <div className="auth-form">
            <h3>Login</h3>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
          </div>
          <div className="divider">OR</div>
          <div className="auth-form">
            <h3>Sign Up</h3>
            <input type="text" placeholder="Full Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button className="signup-btn" onClick={handleLogin}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // PAGE 2: Problem List Page
  const ProblemsPage = () => (
    <div className="problems-page">
      <div className="header">
        <h1>Code Guru</h1>
        <div className="nav-buttons">
          <button onClick={() => setCurrentPage('leaderboard')}>Dashboard</button>
          <button onClick={() => { setIsLoggedIn(false); setCurrentPage('homepage'); }}>Logout</button>
        </div>
      </div>
      
      <div className="problems-container">
        <div className="problems-main">
          <h2>Practice Problems</h2>
          <div className="problems-grid">
            {problems.map(problem => (
              <div key={problem.id} className="problem-card" onClick={() => {
                setSelectedProblem(problem);
                setCurrentPage('oj');
              }}>
                <h3>{problem.name}</h3>
                <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
                <p>{problem.statement.substring(0, 100)}...</p>
                <div className="problem-stats">
                  <span>👥 1.2k solved</span>
                  <span>✅ 85% success</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Lateral Boxes */}
        <div className="sidebar">
          <div className="sidebar-box">
            <h3>🏆 Leaderboard</h3>
            <div className="mini-table">
              <div className="mini-row">
                <span>#1 CodeMaster</span>
                <span>950pts</span>
              </div>
              <div className="mini-row">
                <span>#2 AlgoExpert</span>
                <span>900pts</span>
              </div>
              <div className="mini-row">
                <span>#3 DevNinja</span>
                <span>850pts</span>
              </div>
            </div>
            <button className="more-btn" onClick={() => setCurrentPage('leaderboard')}>
              More →
            </button>
          </div>
          
          <div className="sidebar-box">
            <h3>📝 Recent Submissions</h3>
            <div className="mini-table">
              <div className="mini-row">
                <span>Two Sum</span>
                <span className="accepted">AC</span>
              </div>
              <div className="mini-row">
                <span>Valid Parentheses</span>
                <span className="accepted">AC</span>
              </div>
              <div className="mini-row">
                <span>Longest Substring</span>
                <span className="wrong">WA</span>
              </div>
            </div>
            <button className="more-btn" onClick={() => setCurrentPage('leaderboard')}>
              More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // PAGE 3: OJ Page (Code Editor + Problem + AI + Editorial)
  const OJPage = () => (
    <div className="oj-page">
      <div className="header">
        <button onClick={() => setCurrentPage('problems')}>← Back to Problems</button>
        <h1>Code Guru - {selectedProblem?.name}</h1>
      </div>
      
      <div className="oj-container">
        <div className="problem-panel">
          <div className="problem-tabs">
            <button className="tab-btn active">Problem</button>
            <button className="tab-btn">Editorial</button>
            <button className="tab-btn">AI Comments</button>
          </div>
          
          <div className="problem-content">
            <h2>{selectedProblem?.name}</h2>
            <span className={`difficulty ${selectedProblem?.difficulty.toLowerCase()}`}>
              {selectedProblem?.difficulty}
            </span>
            
            <div className="problem-statement">
              <h3>Problem Statement</h3>
              <p>{selectedProblem?.statement}</p>
            </div>
            
            <div className="ai-comment">
              <h3>🤖 AI Comment</h3>
              <p>{selectedProblem?.aiComment}</p>
            </div>
            
            <div className="editorial">
              <h3>📚 Editorial</h3>
              <p>{selectedProblem?.editorial}</p>
            </div>
          </div>
        </div>
        
        <div className="code-panel">
          <div className="code-header">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button onClick={handleSubmit} className="submit-btn">
              Submit
            </button>
          </div>
          
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={25}
          />
          
          {verdict && (
            <div className={`verdict ${verdict.toLowerCase()}`}>
              <strong>Verdict: {verdict}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // PAGE 4: Full Leaderboard & Recent Submissions & Discussion
  const LeaderboardPage = () => (
    <div className="leaderboard-page">
      <div className="header">
        <button onClick={() => setCurrentPage('problems')}>← Back to Problems</button>
        <h1>Code Guru - Dashboard</h1>
      </div>
      
      <div className="dashboard-container">
        <div className="tab-switcher">
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            🏆 Leaderboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            📝 Recent Submissions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            💬 Discussion
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'leaderboard' && (
            <div className="full-table">
              <h2>🏆 Top Performers</h2>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Problems Solved</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, username: "CodeMaster", solved: 45, score: 950, accuracy: "94%" },
                    { rank: 2, username: "AlgoExpert", solved: 42, score: 900, accuracy: "91%" },
                    { rank: 3, username: "DevNinja", solved: 38, score: 850, accuracy: "89%" },
                    { rank: 4, username: "ByteWarrior", solved: 35, score: 800, accuracy: "87%" },
                    { rank: 5, username: "CodeCrusher", solved: 32, score: 750, accuracy: "85%" }
                  ].map(user => (
                    <tr key={user.rank}>
                      <td>#{user.rank}</td>
                      <td>{user.username}</td>
                      <td>{user.solved}</td>
                      <td>{user.score}</td>
                      <td>{user.accuracy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'submissions' && (
            <div className="full-table">
              <h2>📝 Recent Submissions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>User</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { problem: "Two Sum", user: "CodeMaster", language: "C++", status: "Accepted", time: "2 min ago" },
                    { problem: "Valid Parentheses", user: "AlgoExpert", language: "Python", status: "Accepted", time: "5 min ago" },
                    { problem: "Longest Substring", user: "DevNinja", language: "Java", status: "Wrong Answer", time: "8 min ago" }
                  ].map((submission, index) => (
                    <tr key={index}>
                      <td>{submission.problem}</td>
                      <td>{submission.user}</td>
                      <td>{submission.language}</td>
                      <td className={`status ${submission.status.toLowerCase().replace(' ', '-')}`}>
                        {submission.status}
                      </td>
                      <td>{submission.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'discussion' && (
            <div className="discussion-panel">
              <h2>💬 Discussion Forum</h2>
              <div className="discussion-thread">
                <h3>Two Sum - Multiple Solutions Discussion</h3>
                <p><strong>CodeMaster:</strong> What's the best approach for this problem?</p>
                <p><strong>AlgoExpert:</strong> HashMap approach gives O(n) time complexity!</p>
                <p><strong>DevNinja:</strong> Here's my Python solution...</p>
              </div>
              <div className="discussion-thread">
                <h3>Longest Substring - Sliding Window Technique</h3>
                <p><strong>ByteWarrior:</strong> Can someone explain sliding window?</p>
                <p><strong>CodeCrusher:</strong> It's like a moving window over the string...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentPage === 'homepage' && <Homepage />}
      {currentPage === 'problems' && isLoggedIn && <ProblemsPage />}
      {currentPage === 'oj' && isLoggedIn && <OJPage />}
      {currentPage === 'leaderboard' && isLoggedIn && <LeaderboardPage />}
    </div>
  );
}

export default App;