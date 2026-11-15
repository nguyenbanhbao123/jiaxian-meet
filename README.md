# jiaxian-meet

A private movie-night website built with React, TypeScript, Vite and Tailwind CSS v4. The current frontend includes a cinematic Home page, Create Room and Join Room demos, a local Watch Room, and video-state UI previews.

**Frontend demo only:** real room management, server sessions, file sharing, playback synchronization, and voice communication are not implemented or connected in this frontend. Sample codes, participants, chat, and upload states do not represent real shared rooms or transfers. Backend development is handled separately; see [Backend](#backend).

## Project structure

```text
jiaxian-meet-git/
├── README.md
├── docs/
│   ├── home-ui.md
│   ├── watch-room-refinement.md
│   └── video-upload-ui.md
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── MeetHome.tsx         # Home and room-entry UI
    │   │   ├── WatchRoom.tsx        # Watch Room layout and actions
    │   │   ├── SignUp.tsx           # Main Sign-Up / Log-In page layout wrapper
    │   │   ├── home/                # Create/Join demos, illustration, scoped styles
    │   │   ├── watch-room/          # Local player, chat, voice, video-state previews
    │   │   └── auth/                # Authentication UI components (login/signup form and social buttons)
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── vite-env.d.ts
    └── vite.config.ts
```

The existing backend service reference, `backend/` (setup not documented yet),
is retained. That directory is not present in this checkout, so it is not shown
as an existing directory above. See [Backend](#backend).

## Requirements

- [Node.js](https://nodejs.org/) 20 or newer
- npm (included with Node.js)

Check your versions:

```bash
node -v
npm -v
```

## Run the frontend

All npm commands must be run from the `frontend` folder.

```bash
git clone https://github.com/nguyenbanhbao123/jiaxian-meet.git
cd jiaxian-meet/frontend
npm install
npm run dev
```

Then open the address printed in the terminal, usually <http://localhost:5173/>.

## Preview Home and the Watch Room

Open <http://localhost:5173/> for Home. **Create Room** opens an invitation preview
with the static sample code `DEMO-2SEATS`, **Copy code**, **Close**, and
**Enter Watch Room**. The sample is not a valid invitation. Copying uses the local
clipboard; if automatic copying is unavailable, the selected code can be copied manually.

For Join, enter **DEMO-2SEATS** and click **Join Room** or press Enter. The form
checks only the demo format (`DEMO-` plus six ASCII letters or numbers), accepts
lowercase and surrounding whitespace, and shows inline empty/invalid/valid states.
Matching input starts a **900ms simulated joining state**, then opens the existing
local Watch Room. Use **Cancel demo join** to stop it. All matching demo codes open
the same sample view; no room is looked up, verified, created, or joined.
**Explore demo** and **Take a look** still open the Watch Room directly.

You can also open <http://localhost:5173/#watch-room> directly. Use **Home preview**,
the Jiaxian Meet logo, or **Leave room** to return Home. Browser back/forward also
switches views. Home uses the same cinematic dark theme and champagne-gold accents
as the Watch Room, with responsive layouts and accessible form/dialog controls.

- **Video:** choose or drop a local video file. Play/pause, timeline seeking,
  mute, volume, playback speed, fullscreen, and theater view operate locally.
  Playback and seeking are disabled until a playable video is ready. Container
  and codec support depend on your browser; MP4/H.264 and WebM are good starting
  points. File errors appear in the player. Object URLs are revoked when a video
  is replaced or the room is closed.
- **Chat:** initial messages and participants are mock data. Send adds a local
  message; Enter sends, Shift+Enter adds a line, and the smile button appends `:)`.
  There are no simulated replies.
- **Voice:** the microphone toggle changes demo UI state only. No microphone is
  accessed and no audio connection is established.
- **Room actions:** participant details and prototype information open in
  keyboard-accessible dialogs. Theater view expands the player above the chat.

## Preview video UI states

In the Watch Room, click **Video UI states**, then use **Preview state** to inspect
Empty, Uploading, Ready, Error, and Waiting for host. All five are explicitly
labeled UI-only previews and use static sample metadata.

- **Empty:** Use sample video shows the mock Uploading view without opening a file.
- **Uploading:** adjust Mock progress control; Cancel demo upload returns to Empty.
- **Ready:** shows sample availability with no playable video attached; Return to
  local player closes the preview.
- **Error:** shows a mock message; Retry demo returns to mock Uploading.
- **Waiting for host:** shows a guest-view sample without changing your role or
  connecting to anyone.

Closing the preview preserves the actual local player, selected video, controls,
and chat. There are no upload requests, progress timers, or simulated guest
connections. These previews do not change actual local video playback.

The frontend does not perform real uploads, file sharing, room management,
synchronization, or voice communication. Selecting a local file is **local
playback, not a server upload**: videos remain on your device, and chat exists
only in the current room preview. Returning home or refreshing resets selected
media, messages, and demo controls. These UI demos do not establish backend or
WebRTC connections.

The refinement keeps the same cinematic palette while using a shorter room
header, a 16:9 player sized for desktop viewport height, a compact voice dock,
and independently scrollable chat. At tablet widths, chat follows the player.

## Design handoff documents

- [Home, Create Room, and Join Room UI handoff](docs/home-ui.md): demo behavior,
  component boundaries, validation, and room-management integration points.
- [Watch Room design and QA notes](docs/watch-room-refinement.md): visual tokens,
  responsive player layout, accessibility, and verification limits.
- [Video Upload UI states handoff](docs/video-upload-ui.md): the five UI-only
  states, preview controls, reusable component API, and file-transfer integration points.

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload          |
| `npm run build`   | Create a production build in `frontend/dist`  |
| `npm run preview` | Serve the production build locally            |

## Troubleshooting

- **404 or blank page:** make sure you ran `npm run dev` inside `frontend`, not the repo root. `index.html` and `package.json` must be in the same folder.
- **Port 5173 already in use:** stop the old server (`Ctrl+C`), or use the new port Vite prints.
- **Page has no styling:** check that `src/index.css` contains `@import "tailwindcss";` and that `src/main.tsx` imports it.
- **Import casing error (`MeetHome` vs `meethome`):** the filename and the import must match exactly, including capital letters.

## Verification

Run these commands from `frontend`:

```bash
npx tsc --noEmit
npm run build
```

TypeScript uses the existing `frontend/tsconfig.json`; the production build is
written to `frontend/dist`. Browser visual and interaction verification is
separate from these checks; see the handoff documents for current QA limits.

## Backend

Setup instructions for the `backend` folder have not been added yet.

The `backend/` reference is preserved from the original project documentation.
This checkout does not include that directory or backend setup instructions.
The backend teammate remains responsible for room creation and invitations,
code verification and joining, file transfer/sharing, synchronization, and voice
communication. The frontend demos described above do not implement those services.
