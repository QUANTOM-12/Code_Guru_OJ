import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('intro'); // 'intro' or 'learners'
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [verdict, setVerdict] = useState('');
  const [learnersTab, setLearnersTab] = useState('leaderboard'); // 'leaderboard' or 'submissions'

  // Sample data
  const problems = [
    { id: 1, name: "Two Sum", difficulty: "Easy", statement: "Given an array of integers, return indices of two numbers that add up to a target." },
    { id: 2, name: "Add Two Numbers", difficulty: "Medium", statement: "Add two numbers represented as linked lists." },
    { id: 3, name: "Longest Substring", difficulty: "Hard", statement: "Find the length of the longest substring without repeating characters." },
    { id: 4, name: "Valid Parentheses", difficulty: "Easy", statement: "Determine if the input string has valid parentheses." },
    { id: 5, name: "Merge Sort", difficulty: "Medium", statement: "Implement merge sort algorithm." }
  ];

  const handleSubmit = () => {
    setVerdict('Evaluating...');
    setTimeout(() => {
      setVerdict('Accepted');
    }, 2000);
  };

  // Scroll to problems section
  const scrollToProblems = () => {
    document.getElementById('problems-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  // Scroll to login section
  const scrollToLogin = () => {
    document.getElementById('login-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  // PAGE 1: Intro/Landing Page with Scroll
  const IntroPage = () => (
    <div className="intro-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Code Guru</h1>
          <div className="code-symbol">&lt;/&gt;</div>
          <p className="hero-subtitle">Master Your Coding Skills</p>
          <p className="hero-description">
            Welcome to Code Guru - the ultimate online judge platform where you can 
            practice coding problems, compete with others, and sharpen your programming skills.
          </p>
          <button className="scroll-btn" onClick={scrollToLogin}>
            Get Started ↓
          </button>
        </div>
      </div>
      
      {/* Login/Signup Section */}
      <div id="login-section" className="login-section">
        <h2>Join Code Guru Community</h2>
        <div className="auth-container">
          <div className="auth-buttons">
            <button className="login-btn" onClick={scrollToProblems}>
              Login
            </button>
            <button className="signup-btn" onClick={scrollToProblems}>
              Sign Up
            </button>
          </div>
          <p className="auth-description">
            Already have an account? Login to continue your coding journey.<br/>
            New here? Sign up to start solving problems and climb the leaderboard!
          </p>
        </div>
      </div>

      {/* Problems Section */}
      <div id="problems-section" className="problems-section">
        <div className="section-header">
          <h2>Practice Problems</h2>
          <button className="learners-btn" onClick={() => setCurrentPage('learners')}>
            Go to Learners Page →
          </button>
        </div>
        
        <div className="problems-grid">
          {problems.map(problem => (
            <div key={problem.id} className="problem-card" onClick={() => {
              setSelectedProblem(problem);
              // Show problem modal or navigate to problem detail
              alert(`Selected: ${problem.name}\n${problem.statement}`);
            }}>
              <h3>{problem.name}</h3>
              <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
              <p>{problem.statement.substring(0, 80)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // PAGE 2: Learners Page with Switchable Tables
  const LearnersPage = () => (
    <div className="learners-page">
      <div className="learners-header">
        <button onClick={() => setCurrentPage('intro')} className="back-btn">
          ← Back to Home
        </button>
        <h1>Code Guru - Learners Dashboard</h1>
      </div>
      
      <div className="tables-container">
        {/* Slide Button Switch */}
        <div className="table-switcher">
          <div className="switch-container">
            <button 
              className={`switch-btn ${learnersTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setLearnersTab('leaderboard')}
            >
              Leaderboard
            </button>
            <button 
              className={`switch-btn ${learnersTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setLearnersTab('submissions')}
            >
              Recent Submissions
            </button>
            <div className={`slider ${learnersTab === 'submissions' ? 'slide-right' : ''}`}></div>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="table-content">
          {learnersTab === 'leaderboard' ? (
            <div className="leaderboard-table">
              <h3>🏆 Top Performers</h3>
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
          ) : (
            <div className="submissions-table">
              <h3>📝 Recent Submissions</h3>
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
                    { problem: "Longest Substring", user: "DevNinja", language: "Java", status: "Wrong Answer", time: "8 min ago" },
                    { problem: "Add Two Numbers", user: "ByteWarrior", language: "C++", status: "Accepted", time: "12 min ago" },
                    { problem: "Merge Sort", user: "CodeCrusher", language: "Python", status: "Time Limit Exceeded", time: "15 min ago" },
                    { problem: "Two Sum", user: "NewCoder", language: "JavaScript", status: "Compilation Error", time: "18 min ago" },
                    { problem: "Valid Parentheses", user: "ProSolver", language: "C++", status: "Accepted", time: "22 min ago" },
                    { problem: "Longest Substring", user: "QuickCoder", language: "Python", status: "Accepted", time: "25 min ago" }
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentPage === 'intro' && <IntroPage />}
      {currentPage === 'learners' && <LearnersPage />}
    </div>
  );
}

export default App;