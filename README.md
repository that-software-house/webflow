# TSH Chatbot Widget

Modern chat widget that powers the TSH AI assistant. The project ships a single embeddable script (`dist/widget.js`) and a Netlify Function backend.

## Prerequisites
- Node.js 18 or newer
- npm (comes with Node.js)
- Netlify CLI (`npm install -g netlify-cli`) for local function emulation and deployments

## Install dependencies
```bash
npm install
```

## Run locally
The project uses [Vite](https://vitejs.dev/) with the Netlify dev server so that the UI and functions run together.

```bash
npm run dev
```

This boots `netlify dev` and serves the widget at the URL shown in the terminal (typically `http://localhost:8888`). Any changes you make in `public/widget.js` will hot-reload.

## Production build check
```bash
npm run build
```

This compiles the widget into `dist/` so you can sanity-check the production bundle before deploying.

## Deploy to Netlify
1. Log in once if you have not already:
   ```bash
   netlify login
   ```
2. Link this directory to an existing site or create a new one:
   ```bash
   netlify link    # or: netlify init
   ```
3. Trigger a production build and upload the assets + functions:
   ```bash
   npm run build
   netlify deploy --prod
   ```

Netlify reads the build command and publish directory from `netlify.toml`, so no extra flags are required. After the deploy finishes, the widget is available at `https://<your-site>.netlify.app/widget.js` and the chat function at `https://<your-site>.netlify.app/.netlify/functions/chat`.
