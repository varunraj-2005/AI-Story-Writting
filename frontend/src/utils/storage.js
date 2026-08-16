const STORAGE_KEY = 'ai_stories';

export function getAllStories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getStory(id) {
  return getAllStories().find((s) => s.id === id) || null;
}

export function saveStory(story) {
  const stories = getAllStories();
  const idx = stories.findIndex((s) => s.id === story.id);
  const now = new Date().toISOString();
  const updated = { ...story, updated_at: now };
  if (idx >= 0) {
    stories[idx] = updated;
  } else {
    updated.created_at = now;
    stories.unshift(updated);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  return updated;
}

export function deleteStory(id) {
  const stories = getAllStories().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}
