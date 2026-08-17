import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getStory, saveStory } from '../utils/storage';
import './Editor.css';

const STYLES = [
  { value: 'continue naturally', label: '✨ Continue Naturally' },
  { value: 'add a twist', label: '🌀 Add a Twist' },
  { value: 'add dialogue', label: '💬 Add Dialogue' },
  { value: 'build tension', label: '⚡ Build Tension' },
];

export default function Editor({ storyId, onHome }) {
  const [id] = useState(() => storyId || uuidv4());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [style, setStyle] = useState('continue naturally');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [canRegenerate, setCanRegenerate] = useState(false);
  const [contentBeforeGen, setContentBeforeGen] = useState('');

  const textareaRef = useRef(null);
  const autoSaveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  // Load existing story
  useEffect(() => {
    if (storyId) {
      const story = getStory(storyId);
      if (story) {
        setTitle(story.title || '');
        setContent(story.content || '');
        setStyle(story.style_preference || 'continue naturally');
      }
    }
    isFirstLoad.current = false;
  }, [storyId]);

  // Auto-save every 20 seconds
  const doSave = useCallback((currentContent, currentTitle, currentStyle, silent = false) => {
    try {
      saveStory({
        id,
        title: currentTitle,
        content: currentContent,
        style_preference: currentStyle,
      });
      if (!silent) {
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch {
      setSaveStatus('Save failed');
    }
  }, [id]);

  useEffect(() => {
    if (isFirstLoad.current) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      doSave(content, title, style, true);
    }, 20000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [content, title, style, doSave]);

  function handleManualSave() {
    doSave(content, title, style);
  }

  function wordCount(text) {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }

  async function continueStory(useContentBefore = false) {
    const storyText = useContentBefore ? contentBeforeGen : content;
    if (!storyText.trim()) {
      setError('Write some story content first before asking the AI to continue.');
      return;
    }

    setError('');
    setLoading(true);
    setCanRegenerate(false);

    const snapshot = content;
    setContentBeforeGen(snapshot);

    // If regenerating, restore to the pre-generation content first
    const baseContent = useContentBefore ? contentBeforeGen : content;

    try {
      const base = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${base}/api/continue-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyText: baseContent, styleChoice: style }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `Server error ${response.status}`);
      }

      // Read the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      setContent(baseContent); // reset to base before appending

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('event:')) {
            const eventType = line.slice(6).trim();
            const dataLine = lines[i + 1]?.trim();
            if (dataLine && dataLine.startsWith('data:')) {
              const data = dataLine.slice(5).trim();
              if (eventType === 'token') {
                try {
                  const { token } = JSON.parse(data);
                  accumulated += token;
                  setContent(baseContent + accumulated);
                  // Scroll to bottom
                  if (textareaRef.current) {
                    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
                  }
                } catch { /* skip */ }
              } else if (eventType === 'error') {
                try {
                  const { message } = JSON.parse(data);
                  throw new Error(message);
                } catch (e) {
                  if (e.message !== 'Unexpected end of JSON input') throw e;
                }
              } else if (eventType === 'done') {
                setCanRegenerate(true);
              }
              i++; // skip data line
            }
          }
        }
      }

      if (accumulated) {
        setCanRegenerate(true);
        // Auto-save after generation
        doSave(baseContent + accumulated, title, style, true);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <button className="btn-home" onClick={onHome}>← Stories</button>
        <input
          className="story-title-input"
          type="text"
          placeholder="Story title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="topbar-right">
          {saveStatus && <span className="save-status">{saveStatus}</span>}
          <button className="btn-save" onClick={handleManualSave}>Save</button>
        </div>
      </div>

      <div className="editor-main">
        <div className="word-count">{wordCount(content)} words</div>

        <textarea
          ref={textareaRef}
          className="story-textarea"
          placeholder="Begin your story here… let the words flow."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />

        {loading && (
          <div className="ai-indicator">
            <div className="spinner" />
            <span>AI is writing your story…</span>
          </div>
        )}

        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="controls-bar">
          <select
            className="style-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={loading}
          >
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button
            className="btn-continue"
            onClick={() => continueStory(false)}
            disabled={loading}
          >
            {loading ? 'Writing…' : '✨ Continue Story'}
          </button>

          {canRegenerate && !loading && (
            <button
              className="btn-regenerate"
              onClick={() => continueStory(true)}
              disabled={loading}
            >
              🔄 Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
