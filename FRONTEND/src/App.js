import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [verdict, setVerdict] = useState('');

  // Sample problems data
  const problems = [
    { id: 1, name: "Two Sum", difficulty: "Easy", statement: "Given an array of integers, return indices of two numbers that add up to a target." },
    { id: 2, name: "Add Two Numbers", difficulty: "Medium", statement: "Add two numbers represented as linked lists." },
    { id: 3, name: "Longest Substring", difficulty: "Hard", statement: "Find the length of the longest substring without repeating characters." }
  ];

  const handleSubmit = () => {
    // Simulate code submission
    setVerdict('Evaluating...');
    setTimeout(() => {
      setVerdict('Accepted'); // Mock result
    }, 2000);
  };

  // Home Screen Component
  const HomeScreen = () => (
    <div className="home-screen">
      <h1>Online Judge Platform</h1>
      <div className="auth-buttons">
        <button>Login</button>
        <button>Sign Up</button>
      </div>
      <div className="problem-list">
        <h2>Problems</h2>
        {problems.map(problem => (
          <div key={problem.id} className="problem-item" onClick={() => {
            setSelectedProblem(problem);
            setCurrentScreen('problem');
          }}>
            <h3>{problem.name}</h3>
            <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>
        ))}
      </div>
      <button onClick={() => setCurrentScreen('leaderboard')}>
        View Leaderboard
      </button>
    </div>
  );

  // Problem Detail Screen Component
  const ProblemScreen = () => (
    <div className="problem-screen">
      <button onClick={() => setCurrentScreen('home')}>← Back to Home</button>
      <h1>{selectedProblem?.name}</h1>
      <div className="problem-statement">
        <h3>Problem Statement</h3>
        <p>{selectedProblem?.statement}</p>
      </div>
      
      <div className="code-section">
        <div className="language-selector">
          <label>Language: </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
        
        <textarea
          className="code-editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your code here..."
          rows={15}
        />
        
        <button onClick={handleSubmit} className="submit-btn">
          Submit Solution
        </button>
        
        {verdict && (
          <div className={`verdict ${verdict.toLowerCase()}`}>
            <strong>Verdict: {verdict}</strong>
          </div>
        )}
      </div>
    </div>
  );

  // Leaderboard Screen Component
  const LeaderboardScreen = () => (
    <div className="leaderboard-screen">
      <button onClick={() => setCurrentScreen('home')}>← Back to Home</button>
      <h1>Leaderboard</h1>
      <div className="submissions">
        <h3>Recent Submissions</h3>
        {/* Mock submission data */}
        {[1,2,3,4,5].map(i => (
          <div key={i} className="submission-item">
            <span>Problem {i}</span>
            <span className="accepted">Accepted</span>
            <span>2 minutes ago</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'problem' && <ProblemScreen />}
      {currentScreen === 'leaderboard' && <LeaderboardScreen />}
    </div>
  );
}

export default App;