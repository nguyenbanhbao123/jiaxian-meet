# jiaxian-meet

A private movie-night website built with React, TypeScript, Vite and Tailwind CSS v4. The current frontend includes room entry, a video-first local Watch Room, a Guide, and video-state UI previews.

**Frontend demo only:** real room management, server sessions, file sharing, playback synchronization, and voice communication are not implemented or connected in this frontend. Sample codes, participants, chat, and upload states do not represent real shared rooms or transfers. Backend development is handled separately; see [Backend](#backend).

## Project structure

```text
jiaxian-meet-git/
├── README.md
├── docs/
│   ├── feature-audit.md
│   ├── minimal-ui-redesign.md
│   ├── home-ui.md
│   ├── watch-room-refinement.md
│   └── video-upload-ui.md
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Guide.tsx            # Local feature guide
    │   │   ├── MeetHome.tsx         # Home and room-entry UI
    │   │   ├── WatchRoom.tsx        # Watch Room layout and actions
    │   │   ├── SignUp.tsx           # Original Login / Sign Up layout
    │   │   ├── home/                # Create/Join demos, illustration, scoped styles
    │   │   ├── watch-room/          # Local player, chat, voice, video-state previews
    │   │   └── auth/                # Authentication UI components (login/signup form and social buttons)
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── tests/                # Chromium regression suite and generated video fixture
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

Open <http://localhost:5173/#watch-room> for direct entry or <http://localhost:5173/#guide> for instructions. The question-mark button opens Guide from Home or the room. Back restores the originating screen. The logo and Leave return Home.

- Choose or drop a local file. Playback, seeking, volume, speed, fullscreen and theater view operate on the browser media element. Change video replaces the file.
- Chat opens beside the player on desktop and below it on smaller screens. Enter sends locally, Shift+Enter adds a line and the smile button appends ` :)`. The sample incoming message is labeled.
- The microphone switch previews on and off states. No audio connection is established.
- Visiting Guide pauses playback and preserves the file, position, chat history and draft. Leaving the room or reloading resets these.
- Home and Guide link to **Log In** (`#login`) and **Sign Up** (`#sign-up`). Each opens its matching original form. Switching modes updates the hash and supports refresh and browser history. Form submission stays local and creates no session. Google and Apple have no provider handlers. The original Forgot password link returns Home and sends no reset email.

## Preview video UI states

In the Watch Room, open **Room settings → Preview video UI states**, then use **Preview state** to inspect
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

## Design handoff documents

- [Current feature audit](docs/feature-audit.md) records baseline failures, delivered status, priority and dependencies.
- [Minimal UI redesign](docs/minimal-ui-redesign.md) covers the current interface, state boundaries and regression checks.
- Earlier handoffs cover [Home](docs/home-ui.md), [Watch Room](docs/watch-room-refinement.md) and [video state fixtures](docs/video-upload-ui.md). Use the current handoff for navigation and layout.

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload          |
| `npm run build`   | Create a production build in `frontend/dist`  |
| `npm run preview` | Serve the production build locally            |
| `npm test`        | Exercise the frontend in headless Chrome      |

## Troubleshooting

- **404 or blank page:** make sure you ran `npm run dev` inside `frontend`, not the repo root. `index.html` and `package.json` must be in the same folder.
- **Port 5173 already in use:** stop the old server (`Ctrl+C`), or use the new port Vite prints.
- **Page has no styling:** check that `src/index.css` contains `@import "tailwindcss";` and that `src/main.tsx` imports it.
- **Import casing error (`MeetHome` vs `meethome`):** the filename and the import must match exactly, including capital letters.

## Verification

Run these commands from `frontend`:

```bash
npm ci
npx tsc --noEmit
npm run build
npm test
```

The build writes to `frontend/dist`. Tests start and close a local test server and use installed Chrome through the development-only Playwright driver. Set `CHROME_PATH` to use a different Chromium executable.

## Backend

Setup instructions for the `backend` folder have not been added yet.

The `backend/` reference is preserved from the original project documentation.
This checkout does not include that directory or backend setup instructions.
The backend teammate remains responsible for room creation and invitations,
code verification and joining, file transfer/sharing, synchronization, and voice
communication. The frontend demos described above do not implement those services.
