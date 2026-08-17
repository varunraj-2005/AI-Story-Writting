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

  function getTitle(story) {
    if (story.title && story.title.trim()) return story.title;
    return story.content ? story.content.slice(0, 40) + (story.content.length > 40 ? '…' : '') : 'Untitled Story';
  }

  function getSnippet(story) {
    return story.content
      ? story.content.slice(0, 110) + (story.content.length > 110 ? '…' : '')
      : 'No content yet.';
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function wordCount(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }

  return (
    <div className="dashboard">
      {/* ── Nav ── */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <div className="nav-logo">
            <img src="/story-logo.jpg" alt="AIStory logo" className="nav-logo-img" />
          </div>
          <span className="nav-brand-name">
            AI<span>Story</span>
          </span>
        </div>
        <button className="btn-primary" onClick={onNew}>
          + New Story
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="dashboard-hero">
        <div className="hero-eyebrow">AI-Powered Writing</div>
        <h1 className="dashboard-title">
          <span className="title-with-img">
            <img src="/story-logo.jpg" alt="" className="title-logo-img" />
            Your stories,
          </span>
          <br />
          <span className="accent">continued by AI</span>
        </h1>
        <p className="dashboard-subtitle">
          Start writing, then let AI carry the narrative forward — with your style, your voice, your story.
        </p>
        <button className="btn-primary btn-large" onClick={onNew}>
          + New Story
        </button>
      </section>

      {/* ── Section divider ── */}
      <div className="dashboard-divider">
        <div className="divider-inner">
          <span className="section-label">Your Stories</span>
          {stories.length > 0 && (
            <span className="story-count-badge">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="dashboard-main">
        {stories.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">📖</div>
            <p className="empty-title">No stories yet</p>
            <p className="empty-text">
              Hit "New Story" above to start writing. Your saved stories will appear here.
            </p>
            <button className="btn-primary" onClick={onNew}>
              Start your first story
            </button>
          </div>
        ) : (
          <div className="story-grid">
            {stories.map((story) => (
              <div
                key={story.id}
                className="story-card"
                onClick={() => onOpen(story.id)}
              >
                <div className="story-card-accent" />

                <h2 className="story-card-title">{getTitle(story)}</h2>

                <div className="story-card-meta">
                  <span>Last edited {formatDate(story.updated_at)}</span>
                  {story.content && (
                    <>
                      <span className="meta-dot" />
                      <span>{wordCount(story.content)} words</span>
                    </>
                  )}
                </div>

                <p className="story-card-snippet">{getSnippet(story)}</p>

                <div className="story-card-footer">
                  <span className="story-card-open">Open →</span>
                  <button
                    className="story-card-delete"
                    onClick={(e) => handleDelete(e, story.id)}
                    title="Delete story"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
