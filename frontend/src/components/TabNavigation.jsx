import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TabNavigation = ({ tabs, activeTab, onTabChange, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(initialTab || tabs[0].id);

  useEffect(() => {
    if (location.pathname) {
      const tab = tabs.find(t => t.path === location.pathname);
      if (tab) setActive(tab.id);
    }
  }, [location.pathname, tabs]);

  const handleClick = tab => {
    setActive(tab.id);
    onTabChange?.(tab.id);
    if (tab.path) navigate(tab.path);
  };

  return (
    <div style={{ borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab)}
          disabled={tab.disabled}
          style={{
            marginRight: '1rem',
            padding: '0.5rem 1rem',
            borderBottom: active === tab.id ? '2px solid #007bff' : '2px solid transparent',
            color: active === tab.id ? '#007bff' : '#555',
            cursor: tab.disabled ? 'not-allowed' : 'pointer',
            background: 'none',
            border: 'none'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Usage example for Leaderboard and Recent Submissions
const LeaderboardTabs = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: '🏆',
      path: '/leaderboard'
    },
    {
      id: 'recent',
      label: 'Recent Submissions',
      icon: '📝',
      path: '/submissions/recent'
    }
  ];

  return (
    <div className="w-full">
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />
      
      {/* Content based on active tab */}
      <div className="mt-4">
        {activeTab === 'leaderboard' && <LeaderboardContent />}
        {activeTab === 'recent' && <RecentSubmissionsContent />}
      </div>
    </div>
  );
};

// Usage example for Compiler page (AI Comments, Editorial)
const CompilerTabs = () => {
  const [activeTab, setActiveTab] = useState('code');

  const tabs = [
    {
      id: 'code',
      label: 'Code Editor',
      icon: '💻'
    },
    {
      id: 'ai-comments',
      label: 'AI Hints',
      icon: '🤖'
    },
    {
      id: 'editorial',
      label: 'Editorial',
      icon: '📖'
    },
    {
      id: 'submissions',
      label: 'My Submissions',
      icon: '📋'
    }
  ];

  return (
    <div className="w-full">
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-4"
      />
      
      <div className="mt-4">
        {activeTab === 'code' && <CodeEditorContent />}
        {activeTab === 'ai-comments' && <AICommentsContent />}
        {activeTab === 'editorial' && <EditorialContent />}
        {activeTab === 'submissions' && <MySubmissionsContent />}
      </div>
    </div>
  );
};

// Tab content components
const LeaderboardContent = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Global Leaderboard</h3>
      {/* Leaderboard table here */}
    </div>
  </div>
);

const RecentSubmissionsContent = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Submissions</h3>
      {/* Recent submissions list here */}
    </div>
  </div>
);

const CodeEditorContent = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="p-4">
      {/* Code editor component here */}
    </div>
  </div>
);

const AICommentsContent = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">AI Hints</h3>
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-sm text-blue-700">
            💡 Try using a hash map to store previously calculated values.
          </p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <p className="text-sm text-green-700">
            🎯 Consider the time complexity of your current approach.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const EditorialContent = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Editorial</h3>
      <div className="prose max-w-none">
        <p>This is where the editorial content would be displayed...</p>
      </div>
    </div>
  </div>
);

const MySubmissionsContent = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">My Submissions</h3>
      {/* User's submissions for this problem */}
    </div>
  </div>
);

export { TabNavigation, LeaderboardTabs, CompilerTabs };