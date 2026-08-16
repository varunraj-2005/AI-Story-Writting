import React, { useState, useEffect } from 'react';
import { getAllStories, deleteStory } from '../utils/storage';
import './Dashboard.css';

export default function Dashboard({ onOpen, onNew }) {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    setStories(getAllStories());
  }, []);

  function handleDelete(e, id) {
    e.stopPropagation();
    if (window.confirm('Delete this story? This cannot be undone.')) {
      deleteStory(id);
      setStories(getAllStories());
    }
  }

  function getPreview(story) {
    if (story.title && story.title.trim()) return story.title;
    return story.content ? story.content.slice(0, 40) + (story.content.length > 40 ? '…' : '') : 'Untitled Story';
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">✍️ AI Story Continuation</h1>
        <p className="dashboard-subtitle">Your personal AI-powered writing companion</p>
        <button className="btn-primary btn-large" onClick={onNew}>+ New Story</button>
      </header>

      <main className="dashboard-main">
        {stories.length === 0 ? (
          <div className="dashboard-empty">
            <p>No stories yet.</p>
            <button className="btn-primary" onClick={onNew}>Start your first story</button>
          </div>
        ) : (
          <div className="story-grid">
            {stories.map((story) => (
              <div key={story.id} className="story-card" onClick={() => onOpen(story.id)}>
                <div className="story-card-body">
                  <h2 className="story-card-title">{getPreview(story)}</h2>
                  <p className="story-card-meta">Last edited {formatDate(story.updated_at)}</p>
                  <p className="story-card-snippet">
                    {story.content ? story.content.slice(0, 100) + (story.content.length > 100 ? '…' : '') : 'Empty story'}
                  </p>
                </div>
                <button
                  className="story-card-delete"
                  onClick={(e) => handleDelete(e, story.id)}
                  title="Delete story"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
