# Teyvat Field Guide

A React application for browsing Genshin Impact character builds and team suggestions, with an experimental Gemini assistant for character-specific questions.

[Open the demo](https://genshin-guide-henna.vercel.app)

## Features

- Search 53 included characters by name and filter by any of the seven elements.
- Browse weapon and artifact recommendations, main stats, substats, and suggested teams.
- Switch to a Meta Snapshot view that filters the included data to S and SS tiers.
- Open a character's Akasha Terminal for build questions and quick prompts about rotations, Energy Recharge, and artifacts.
- Browse the character guide without configuring the optional assistant.

## Built with

React 19, Vite 7, Tailwind CSS 3, and Lucide React icons. Character data and the application components are defined in `src/App.jsx`.

## Run locally

Install Node.js compatible with Vite 7 and npm, then run:

```bash
git clone https://github.com/DwytMCL/genshin-guide.git
cd genshin-guide
npm ci
npm run dev
```

Open the local URL printed by Vite.

### Optional Gemini setup

Create `.env.local` in the project root:

```dotenv
VITE_GEMINI_API_KEY=your_api_key_here
```

Restart the development server after changing the environment file.
`src/App.jsx` reads this variable through `import.meta.env.VITE_GEMINI_API_KEY`.

The client calls Google's `generateContent` endpoint with the configured model
`gemini-2.5-flash-preview-09-2025`. Access depends on the model's availability and your API account.

Vite includes `VITE_` values in the browser bundle. A public deployment should route Gemini requests through a server that keeps the API key private; this repository currently calls Gemini directly from the browser.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Generate a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run the configured ESLint checks |

## Key files

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Character data, filters, cards, build modal, and assistant |
| `package.json` | Dependencies and npm scripts |
| `vite.config.js` | Vite configuration |
| `tailwind.config.js` | Tailwind configuration |
| `postcss.config.cjs` | PostCSS configuration |
| `LICENSE` | MIT license |

## Current scope

- Character entries and tier labels are manually maintained; they are not a complete roster or live game data.
- Team suggestions are reference text. The app does not calculate damage or optimize a custom team.
- The assistant sends the current question and selected character context, without previous chat turns.
- Failed API calls are retried up to five attempts with increasing delays, then return a fallback message. There is no request timeout.
- Build advice and AI responses can be outdated or inaccurate and should be checked against current game information.

## License

[MIT](LICENSE). Genshin Impact is owned by HoYoverse; this is an independent fan project.
