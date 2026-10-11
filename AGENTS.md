# AGENTS.md

Notes for AI coding agents working on Zingy. Keep this file current when you change something it describes.

## Project

Zingy is a chat app with 1:1 WebRTC video calls, screen sharing, and DOOM you can play during a call.

pnpm monorepo (`pnpm-workspace.yaml`):

- `client/`: React 19 + TypeScript + Vite + Tailwind v4 + Redux Toolkit. Deployed to Azure Static Web Apps.
- `server/`: Express + Socket.IO + Sequelize (MySQL). Run with `pnpm dev` (nodemon).
- `shared-types/`: Socket.IO event types shared by client and server (`shared-types/socket.ts`).

## Commands

Run from the repo root unless noted:

- `pnpm run check-types`: type-check every package
- `pnpm run lint`: lint every package
- `pnpm run install-shared`: build `shared-types`

Gotcha: the server type-checks against the *built* `shared-types` (TS project references). After editing `shared-types/socket.ts`, run `npx tsc --build` in `shared-types/` (or `pnpm run install-shared`). Otherwise the server reports the new events as missing.

## CI

`.github/workflows/` runs only on push to `main` (that is, when a PR is merged) and on manual `workflow_dispatch`. PRs do not trigger CI, so run type-check and lint locally before pushing.

## Git conventions

- Feature branches: `features/<name>`, PRs into `main`.
- Commit or push only when the user asks.
- Never commit `.DS_Store`, `client/src-tauri/target/`, `client/public/js-dos/`, `.env`, or `.secrets` (all are gitignored).

## Video calls

All call logic lives in `client/src/pages/dashboard/ConversationContainer.tsx`. The server only relays signaling (`server/app.ts`).

- Flow: `video-call-ring` → `call-accepted` → `video-call` (offer) → `video-answer` → `new-ice-candidate` → `video-hangup`.
- STUN/TURN come from `client/src/helpers/ice-servers.ts`: metered.ca STUN + TURN (`VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL`), plus two Google STUN servers as backup. Keep the list short, because each extra URL slows candidate gathering (Firefox warns at 5+).
- Layout follows Microsoft Teams: remote video fills the main area, local video sits in a resizable right sidebar (200–480px), and controls sit in a bottom bar. The `min-h-0` / `shrink-0` classes on the main column keep the control bar on screen. Don't remove them.
- Screen sharing uses `RTCRtpSender.replaceTrack()` to swap camera ↔ screen with no renegotiation. The camera track stays alive in `localStreamRef`, so the local preview keeps working. `screen-share-state` tells the peer, which switches remote video to `object-contain`.

To add a new call event: add the type to both event maps in `shared-types/socket.ts`, add a relay in `server/app.ts` that copies the `screen-share-state` handler (emit to `payload.peerId`, replacing `peerId` with the sender's id), then register the handler with `socket.on` / `socket.off` in `ConversationContainer.tsx`.

## DOOM (js-dos)

Files: `client/public/doom.html`, `client/public/doom/*.jsdos`, `client/src/pages/dashboard/DoomGame.tsx`.

- **Always run js-dos inside the iframe (`/doom.html`).** `js-dos.css` ships a global Tailwind v3 reset plus daisyUI classes (`.flex`, `.hidden`, `.btn`, ...). Loading it in the main app breaks the whole dashboard layout. Never add js-dos tags to `client/index.html`.
- `client/public/js-dos/` is copied from `node_modules/js-dos/dist` by the client `postinstall` script and is gitignored.
- **Bundles are self-hosted.** `cdn.dos.zone` blocks cross-origin fetches (CORS), and its DOOM bundle contains the commercial `DOOM.WAD`. Only the freely redistributable shareware `DOOM1.WAD` (v1.9) belongs in this repo.
  - `doom-shareware.jsdos`: single player (autoexec `DOOM.EXE`).
  - `doom-shareware-net.jsdos`: same files with a different `.jsdos/dosbox.conf`: `memsize=16`, `[dos] xms/ems/umb=true`, `[ipx] ipx=true`, autoexec `IPXSETUP -nodes 2`. The memory settings are required: under the `dosboxX` backend DOOM otherwise fails with "Insufficient memory! You need at least 3.7 megabytes".
  - To change a bundle, rewrite `.jsdos/dosbox.conf` inside the zip with Python's `zipfile`, then **bump the `?v=` query** on its URL in `doom.html`. js-dos caches bundles in the browser (OPFS) by URL.
- `doom.html` modes: no query string = single player, `?mode=host`, `?mode=join&peer=<netPeerId>`. Multiplayer uses `backend: 'dosboxX'`.

### Multiplayer (2-player co-op over IPX)

1. In a call, the gamepad button opens `DoomGame` as host (`startIpxServer: true`).
2. `doom.html` polls `window.net.peerId` and posts `{type: 'doom-host-ready', peerId}` to the parent.
3. The parent emits `doom-invite {peerId: <call peer user id>, netPeerId}`. The server relays it.
4. The receiver opens `DoomGame` as join (`connectIpxAddress: netPeerId`).

- Signaling uses js-dos's default public server `https://net.dos.zone` (token `"js-dos"`). Fine for testing; for production consider self-hosting js-dos's WebRTC-NET `peer-server` and setting `net.peerServer`.
- ICE servers: `doom.html` posts `doom-request-ice-servers`, and `DoomGame` replies with `doom-ice-servers` (same TURN as calls). If there's no parent or no reply within 3s, it falls back to Google STUN.
- All iframe ↔ parent `postMessage` handlers check both `event.source` and `event.origin`.
- Inside an iframe js-dos logs `Keyboard.lock ... must be called from a primary top-level browsing context`. This is harmless.
- Known limits: co-op only (deathmatch would need another bundle with `-deathmatch`); the invitee's game opens without asking; if both players click at once, both host and they never connect; tested only on two tabs on one machine, not on two devices.
- To test without a call: open `/doom.html?mode=host`, read `window.net.peerId` in its console, then open `/doom.html?mode=join&peer=<id>` in another tab.
