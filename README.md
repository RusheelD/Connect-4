# Connect 4

A lightweight Connect 4 game with pass-and-play and AI modes, built for GitHub Pages.

## Run locally

Because this is a static site, you can open `index.html` directly or serve the folder with a simple local server.

```bash
# Option 1: open directly
open index.html

# Option 2: run a simple server (Node 18+)
node -e "require('node:http').createServer((req,res)=>{require('node:fs').createReadStream('index.html').pipe(res)}).listen(8080)"
```

Then visit `http://localhost:8080` if you used the server.

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. In **Settings → Pages**, set **Source** to the `main` branch and `/ (root)` directory.
3. Save, then wait for the build to finish.
4. Visit the provided GitHub Pages URL to play.

## Project structure

- `index.html` – main page
- `styles.css` – themes, layout, animations
- `script.js` – game engine exports (used by tests)
- `ui.js` – UI wiring and game loop
- `contracts.js` – shared constants and enums
- `tests/` – lightweight Node tests for core logic
