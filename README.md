# Swarm Rebuild Plus — Android PWA 0.2.0

A browser-independent installable web app for Android, intended to run in both Chrome and Samsung Internet.

## What this build does
- Runs as a PWA when hosted on HTTPS (or localhost).
- Works offline after its first successful load, using a service worker.
- Includes a built-in sample scene and local screenshot import.
- Animates a tiled visual reveal with multiple colored swarm cursors.
- Includes speed, agent-count, trail, sound, replay, pause, and tour controls.
- Does not upload imported images or make analytics/network calls.

## Important platform limitation
A PWA cannot inspect or draw over a different browser tab. Android Chrome does not support ordinary desktop Chrome extensions. Samsung Internet's add-on support is a separate ecosystem and does not guarantee compatibility with arbitrary Manifest V3 packages. This PWA is the practical shared build for both browsers; it is not a current-tab extension.

## Run locally for development
Serve this folder from `localhost` with any static HTTP server. Service workers and PWA install require HTTPS or localhost. Opening `index.html` directly as a `file://` URL is suitable only for a basic visual preview; offline installation will not work.

## Install on Android
1. Host this folder on an HTTPS static host.
2. Open its HTTPS address in Chrome or Samsung Internet.
3. Chrome: menu → Install app / Add to Home screen (wording depends on version).
4. Samsung Internet: menu → Add page to → Home screen (wording depends on version).
5. Launch from the new home-screen icon. Open once online so the offline cache is created.

## Test
Open the app, tap Start sample, then Play. Use Import screenshot to choose a local image. Imported content stays in the browser's local memory; it is not sent to a server.

## Files
- `index.html` — app UI
- `styles.css` — responsive touch-first design
- `app.js` — canvas renderer and controls
- `manifest.webmanifest` — PWA metadata
- `sw.js` — offline asset cache
- `icon.svg` — app icon

## Status
Prototype 0.2.0. It has not been tested on physical Samsung hardware or submitted to either browser's store.
