# 📖 AI Story Writing - Powered by Gemini AI

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19+-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Google Generative AI](https://img.shields.io/badge/Google%20Generative%20AI-Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Transform Your Imagination into Captivating Stories with AI-Powered Story Continuation**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [API Documentation](#api-documentation) • [Usage](#usage)

</div>

---

## 🚀 Overview

**AI Story Writing** is an innovative, real-time story continuation platform that leverages Google's powerful **Gemini AI** to generate creative and contextually relevant story continuations. Whether you're a novelist, student, or creative enthusiast, this application helps you overcome writer's block and explore unlimited narrative possibilities.

With multiple writing styles and streaming response technology, you get natural, engaging story continuations delivered in real-time—creating an immersive creative writing experience.

---

## ✨ Features

### 🎨 **Smart Story Continuation**
- Powered by **Google Gemini 3.5 Flash** for fast, intelligent responses
- Understands narrative context and maintains story consistency
- Generates unique, creative continuations tailored to your plot

### 🎭 **Multiple Writing Styles**
Choose how you want your story to continue:
- **Continue Naturally** - Smooth narrative flow matching existing tone
- **Add a Twist** - Introduce unexpected plot turns and surprises
- **Add Dialogue** - Character-driven scenes with meaningful conversations
- **Build Tension** - Create suspense and raise the narrative stakes

### ⚡ **Real-Time Streaming**
- **Server-Sent Events (SSE)** technology for instant token-by-token delivery
- See your story unfold in real-time as AI generates content
- Smooth, responsive user experience with no waiting for full responses

### 🔒 **Enterprise-Grade Security**
- Secure API key management using environment variables
- Client-side API key injection protection
- Input validation and error handling
- CORS configuration for controlled access

### 🌐 **RESTful API**
- Well-documented endpoint structure
- JSON request/response format
- Comprehensive error handling with meaningful messages

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | JavaScript runtime | 18+ |
| **Express.js** | Web framework | 4.19+ |
| **Google Generative AI** | AI model integration | Latest |
| **CORS** | Cross-origin resource sharing | 2.8.5 |
| **Dotenv** | Environment variable management | 16.4.5 |
| **Nodemon** | Development auto-reload | 3.1.4 |

### Key Technologies
- ✅ **Gemini 3.5 Flash** - State-of-the-art generative AI
- ✅ **Streaming SSE** - Real-time response delivery
- ✅ **RESTful Architecture** - Clean API design
- ✅ **Async/Await** - Modern JavaScript patterns

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Google Gemini API Key** - [Get Free API Key](https://ai.google.dev/)
- **Git** (for cloning the repository)

---

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone git@github.com:varunraj-2005/AI-Story-Writting.git
cd AI-Story-Writting
```

### 2. Navigate to Backend Directory
```bash
cd backend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

### 5. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

✅ Server running on: `http://localhost:3001`

---

## 📡 API Documentation

### Continue Story Endpoint

#### **POST** `/api/continue-story`

Generate the next part of your story using AI with your chosen style.

#### Request Body
```json
{
  "storyText": "The old man walked slowly through the misty forest...",
  "styleChoice": "add a twist"
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `storyText` | String | ✅ Yes | The current story to continue (must be non-empty) |
| `styleChoice` | String | ❌ No | Writing style (default: `continue naturally`) |

#### Valid Style Choices
- `continue naturally` - Natural story flow
- `add a twist` - Unexpected plot developments
- `add dialogue` - Character dialogue scenes
- `build tension` - Suspense and stakes

#### Response (Streaming SSE)
The server responds with Server-Sent Events for real-time streaming:

```
event: token
data: {"token":" Once"}

event: token
data: {"token":" he"}

event: done
data: {}
```

#### Example Request
```bash
curl -X POST http://localhost:3001/api/continue-story \
  -H "Content-Type: application/json" \
  -d '{
    "storyText": "Sarah discovered an ancient letter hidden in the attic...",
    "styleChoice": "add a twist"
  }'
```

#### Response Status Codes
| Code | Description |
|------|-------------|
| 200 | ✅ Success - Story streaming |
| 400 | ❌ Bad Request - Missing/invalid parameters |
| 500 | ❌ Server Error - AI service unavailable |

#### Error Response Example
```json
{
  "error": "storyText is required and must be a non-empty string."
}
```

---

## 💻 Usage Examples

### JavaScript/Fetch API
```javascript
async function continueStory(storyText, style = 'continue naturally') {
  const response = await fetch('http://localhost:3001/api/continue-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyText, styleChoice: style })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.token) {
          process.stdout.write(data.token);
        }
      }
    }
  }
}

// Usage
continueStory('The wizard raised his staff...', 'build tension');
```

### Python Example
```python
import requests
import json

def continue_story(story_text, style='continue naturally'):
    url = 'http://localhost:3001/api/continue-story'
    payload = {
        'storyText': story_text,
        'styleChoice': style
    }
    
    response = requests.post(url, json=payload, stream=True)
    
    for line in response.iter_lines():
        if line:
            if b'data: ' in line:
                data = json.loads(line.split(b': ', 1)[1])
                if 'token' in data:
                    print(data['token'], end='', flush=True)

# Usage
continue_story('The dragon approached the village...', 'add dialogue')
```

---

## 🏗️ Project Structure

```
AI-Story-Writting/
├── backend/
│   ├── src/
│   │   └── index.js              # Main Express app & endpoints
│   ├── package.json              # Dependencies & scripts
│   ├── .env.example              # Environment variables template
│   └── node_modules/             # Installed packages
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

---

## 🔐 Security Features

### 🛡️ API Key Protection
- API keys never exposed to client-side
- Environment variable validation at startup
- Request validation to block client API key injection

### 🚫 Input Validation
- Story text length validation
- Type checking for all parameters
- Sanitized error messages

### 🌐 CORS Security
- Restricted to `http://localhost:3000` (configurable)
- Prevents unauthorized cross-origin requests

---

## 🧪 Testing

### Manual API Testing with cURL
```bash
# Test the story continuation endpoint
curl -X POST http://localhost:3001/api/continue-story \
  -H "Content-Type: application/json" \
  -d '{
    "storyText": "In the beginning, there was darkness...",
    "styleChoice": "add a twist"
  }' \
  --max-time 30
```

### Using Postman
1. Create new POST request to `http://localhost:3001/api/continue-story`
2. Set header: `Content-Type: application/json`
3. Set body (raw JSON):
```json
{
  "storyText": "The detective entered the abandoned mansion...",
  "styleChoice": "build tension"
}
```
4. Click Send and watch the streaming response

---

## 🚀 Performance & Optimization

- **Streaming Responses** - Reduced latency with SSE
- **Efficient AI Model** - Gemini 3.5 Flash for speed & quality balance
- **Request Limiting** - 2MB payload limit prevents abuse
- **Error Recovery** - Graceful error handling and reporting

---

## 📝 Environment Variables

Create a `.env` file with these variables:

```env
# Required: Your Google Generative AI API Key
GEMINI_API_KEY=your_actual_api_key_here

# Optional: Port number (default: 3001)
PORT=3001
```

> ⚠️ **Never commit `.env` to version control!** Use `.env.example` as template.

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY environment variable is not set"
**Solution**: Create `.env` file with your API key
```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```

### "Cannot find module '@google/generative-ai'"
**Solution**: Install dependencies
```bash
npm install
```

### Port 3001 already in use
**Solution**: Change port in `.env`
```env
PORT=3002
```

### CORS Error
**Solution**: Ensure frontend runs on `http://localhost:3000` or update CORS origin in `src/index.js`

---

## 🔄 Future Enhancements

- [ ] Story history & persistence
- [ ] User authentication & profiles
- [ ] Multiple AI model support
- [ ] Story style pre-sets & customization
- [ ] Rate limiting & usage analytics
- [ ] WebSocket support for real-time collaboration
- [ ] Multi-language story generation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Varun Raj**
- GitHub: [@varunraj-2005](https://github.com/varunraj-2005)
- Repository: [AI-Story-Writting](https://github.com/varunraj-2005/AI-Story-Writting)

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📞 Support & Feedback

Have questions or suggestions? Open an [issue](https://github.com/varunraj-2005/AI-Story-Writting/issues) on GitHub!

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Google Generative AI Guide](https://ai.google.dev/docs)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

<div align="center">

### ⭐ If you found this project helpful, please star it on GitHub!

Made with ❤️ by Varun Raj

</div>
