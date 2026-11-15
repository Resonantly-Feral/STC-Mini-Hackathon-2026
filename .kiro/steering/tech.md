Plain HTML, CSS, and JavaScript. No Node, no npm, no build step,
no frameworks, no external libraries or CDNs.
The app must run by double-clicking index.html (file:// protocol):
- Use ordinary <script src> tags. Do NOT use ES modules
  (no type="module", no import/export).
- Files: index.html, style.css, scoring.js (pure functions only),
  cards.js, app.js.
- Tests: tests.html loads scoring.js and tests.js and runs plain
  assertions in the browser, printing PASS or FAIL for each case.
Deploy as a static site (GitHub Pages).
- Offline: sw.js is a service worker that caches the static files so a
  refresh works offline. app.js registers it only over https, never on
  file://. No manifest, no install prompt. Bump CACHE_VERSION in sw.js
  on every deploy so new files replace old ones.
