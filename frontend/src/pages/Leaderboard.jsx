// Add this to your existing FRONTEND/src/pages/Leaderboard.jsx
import React, { useState } from 'react';
import TabNavigator from '../components/TabNavigator';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  
  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'recent', label: 'Recent Submissions' }
  ];

  return (
    <div>
      <TabNavigator 
        tabs={tabs} 
        initialTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {activeTab === 'leaderboard' && <div>Your Leaderboard Component Here</div>}
      {activeTab === 'recent' && <div>Recent Submissions Component Here</div>}
    </div>
  );
};

export default Leaderboard;