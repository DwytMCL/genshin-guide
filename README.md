Here’s a clean **README.md** you can paste directly into your repo.
Short, direct, and formatted for GitHub.

---

# Genshin Impact Character Builder & Team Guide (React)

A **React-based Genshin Impact guide app** that provides **character builds, artifact recommendations, team comps, and weapon options**.
Features an integrated **Gemini AI assistant** that answers questions using your custom system prompts.

---

## Features

### Character Database

- Complete data for **Pyro, Hydro, Dendro, Electro**, and more.
- Each character includes:

  - Weapon recommendations
  - Artifact sets
  - Main stats & substats
  - Team compositions
  - Tier ranking & role

### Gemini AI Integration

- Uses **Google Gemini 2.5 Flash** via API.
- Built-in:

  - Error handling
  - Timeout fallback
  - Exponential backoff (429 Too Many Requests)

### Modern UI

- Built with **React + Vite**
- Uses **lucide-react icons**
- Fast search + filtering
- Team builder layout (depending on your UI code)

---

## Tech Stack

| Technology           | Purpose              |
| -------------------- | -------------------- |
| **React**            | Main UI framework    |
| **Vite**             | Dev server & bundler |
| **Gemini API**       | AI responses         |
| **lucide-react**     | Icons                |
| **Custom JSON Data** | Character database   |

---

## Setup & Installation

### Clone the repo

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### Install dependencies

```bash
npm install
```

### Add your Gemini API key

Create `.env`:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### Run the dev server

```bash
npm run dev
```

---

## Environment Variables

| Variable              | Description                |
| --------------------- | -------------------------- |
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key |

---

## Gemini API Handling

This project includes:

- Automatic retries
- Exponential backoff
- Graceful error messages
- Safe parsing of AI responses

Code located inside:

```js
callGemini(userPrompt, systemPrompt);
```

---

## Project Structure

```
src/
│ App.jsx
│ components/
│ data/
│ styles/
.env
vite.config.js
package.json
```

_(Adjust based on your actual repo layout)_

---

## 📘 Character Data Format

Each character entry contains:

```js
{
  id: 'arlecchino',
  name: 'Arlecchino',
  rarity: 5,
  element: 'Pyro',
  role: 'Main DPS',
  tier: 'SS',
  weaponType: 'Polearm',
  bestWeapons: [...],
  artifacts: [...],
  mainStats: {...},
  subStats: [...],
  teams: [...]
}
```

---

## License

MIT License — free to use and modify.

---
