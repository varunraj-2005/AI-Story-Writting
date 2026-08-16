import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'editor'
  const [activeStoryId, setActiveStoryId] = useState(null);

  function openStory(id) {
    setActiveStoryId(id);
    setView('editor');
  }

  function newStory() {
    setActiveStoryId(null);
    setView('editor');
  }

  function goHome() {
    setActiveStoryId(null);
    setView('dashboard');
  }

  return (
    <div>
      {view === 'dashboard' && (
        <Dashboard onOpen={openStory} onNew={newStory} />
      )}
      {view === 'editor' && (
        <Editor storyId={activeStoryId} onHome={goHome} />
      )}
    </div>
  );
}
