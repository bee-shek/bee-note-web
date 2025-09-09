# Bee Note Web Template (Next.js + React Native Web)

This is a minimal template that lets you run React Native-style components on the web using Next.js and react-native-web.
Perfect for moving an Expo/React Native Snack to a website and deploying on Netlify.

## Scripts
- `npm run dev`    → start locally (Node 18+)
- `npm run build`  → production build (used by Netlify)
- `npm start`      → run production server

## Netlify
- Build command: `npm run build`
- Publish directory: `.next`
- Add the Next.js Netlify plugin (already included via `netlify.toml`).

## Where to paste your Snack App.js
- Open `pages/index.js` and replace the sample component with your own `App.js` code.
- Replace any `findNodeHandle` / `UIManager.measureLayout` with web-safe logic (e.g., `element.scrollIntoView({ behavior: 'smooth' })`).

## Notes
- `react-native` is aliased to `react-native-web` in `next.config.js`.
- Some native-only APIs may not exist on web; swap them for web equivalents.
