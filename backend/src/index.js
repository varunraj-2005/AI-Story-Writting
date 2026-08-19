require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Validate required env vars at startup
if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL: GEMINI_API_KEY is not set.');
  process.exit(1);
}
if (!process.env.FRONTEND_URL) {
  console.warn('WARNING: FRONTEND_URL is not set — CORS will only allow localhost:3000');
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL, // e.g. https://your-app.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server / curl (no origin header) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
}));
app.use(express.json({ limit: '2mb' }));

// Reject any request that tries to pass an API key
app.use((req, res, next) => {
  if (req.body && req.body.apiKey) {
    return res.status(400).json({ error: 'API key must not be sent from the client.' });
  }
  next();
});

const STYLE_INSTRUCTIONS = {
  'continue naturally': 'Continue the story naturally, matching the existing tone, pacing, and voice.',
  'add a twist': 'Continue the story by introducing an unexpected twist or surprising turn of events.',
  'add dialogue': 'Continue the story with a dialogue-heavy scene that reveals character and advances the plot.',
  'build tension': 'Continue the story by building suspense and tension, raising the stakes.',
};

// Health check — open https://your-backend.onrender.com/health to verify it's alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: 'gemini-1.5-flash' });
});

// POST /api/continue-story — streaming SSE endpoint
app.post('/api/continue-story', async (req, res) => {
  const { storyText, styleChoice } = req.body;

  if (!storyText || typeof storyText !== 'string' || storyText.trim().length === 0) {
    return res.status(400).json({ error: 'storyText is required and must be a non-empty string.' });
  }

  const style = (styleChoice || 'continue naturally').toLowerCase();
  const styleInstruction = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS['continue naturally'];

  const prompt = `Continue this story naturally from where it left off. Match the tone, characters, and plot established so far. Do not repeat any of the existing text — only write what comes next.\n\nStyle instruction: ${styleInstruction}\n\nStory so far:\n${storyText.trim()}`;

  // Set up SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const token = chunk.text();
      if (token) {
        res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  } catch (err) {
    console.error('Gemini stream error:', err);
    res.write(`event: error\ndata: ${JSON.stringify({ message: err.message || 'Failed to connect to AI service.' })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`AI Story backend running on http://localhost:${PORT}`);
});
