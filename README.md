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

See [Backend](#backend).

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

- Choose or drop a local video. The player provides play/pause, seeking, volume, theater view and fullscreen.
- Once the file is ready, open the gear between Theater and Fullscreen. Use the arrow keys on the speed slider (0.5×–2× in 0.25× steps) or brightness slider (50%–150% in 5% steps). Loop repeats the current file. Escape closes settings and returns focus to the gear.
- **Reset to defaults** restores 1× speed, 100% brightness and Loop Off while preserving the file, position and volume. Choosing another video starts with those defaults. Brightness affects only the displayed video on this device.
- Chat opens beside the player on desktop and below it on smaller screens. Enter sends locally, Shift+Enter adds a line and the emoji button opens a searchable native picker. Choosing an emoji inserts it at the caret or replaces the selected text. The sample incoming message is labeled.
- The microphone switch previews on and off states. No audio connection is established.
- Visiting Guide pauses playback and preserves the file, position, chat history and draft. Leaving the room or reloading resets these.
- Home and Guide link to **Log In** (`#login`) and **Sign Up** (`#sign-up`). Each opens its matching original form. Switching modes updates the hash and supports refresh and browser history. Form submission stays local and creates no session. Google and Apple have no provider handlers. The original Forgot password link returns Home and sends no reset email.

## Preview video UI states

With the Vite development server running, open [Watch Room diagnostics](http://localhost:5173/?diagnostics=1#watch-room). Select **Preview video UI states** below the player, then use **Preview state** to inspect
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

The backend service is built with **C++20 (Drogon)** and **PostgreSQL 16 (`libpqxx`)**, orchestrated via Docker Compose.

### Architecture & Directory Layout

```text
jiaxian-meet/
├── docker-compose.yml        # Orchestrates postgres and backend services
├── migrations/
│   ├── 001_init.sql          # Initial schema (users, user_sessions, rooms, room_participants, chat_messages)
│   └── 002_seed.sql          # Optional development seed data with hashed credentials
└── backend/
    ├── Dockerfile            # Multi-stage C++20 / Drogon build
    ├── include/              # Public headers (.h): class and function declarations, no logic
    └── src/                  # Implementations (.cpp): business logic, DB access, routing, main.cpp
```

### Configuration

| Area | Details |
| --- | --- |
| **Listener** | Drogon binds to `0.0.0.0:8080` inside the container. Port `8080:8080` is published so the Vite frontend (`http://localhost:5173`) can reach the API. |
| **Database host** | Inside Docker, the backend connects to PostgreSQL via the service hostname `postgres`, not `localhost`. |
| **Healthcheck** | `postgres` runs `pg_isready` every 5 seconds. `backend` waits on `condition: service_healthy` before starting, which prevents connection-refused errors at boot. |
| **Upload staging** | Multipart uploads are spooled to `/app/uploads`, which is owned by the non-root `appuser`, avoiding `EACCES` errors. |

### Getting Started

From the repository root (where `docker-compose.yml` lives), build and start the stack in detached mode:

```bash
docker compose up --build -d
```

Once running:

- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432` (or `postgres:5432` on the internal Docker network)

Check service health and logs:

```bash
docker compose ps
docker compose logs -f backend postgres
```

### Database Migrations & Seeding

PostgreSQL runs every `.sql` file mounted in `/docker-entrypoint-initdb.d/` in alphabetical order (`001_init.sql`, then `002_seed.sql`), **only when initializing a fresh database volume**.

> **Note:** Make sure `./migrations/001_init.sql` exists as a regular file before running `docker compose up`. Otherwise Docker creates an empty directory at that path.

If you change `001_init.sql` or `002_seed.sql`, wipe the persistent `pgdata` volume and rebuild so initialization runs again:

```bash
docker compose down -v --rmi local --remove-orphans
docker compose up --build -d
```

### Backend Troubleshooting

- **`Error 13: Permission denied` on upload:** make sure `/app/uploads` exists and is owned by `appuser` in the Dockerfile (`mkdir -p /app/uploads && chown -R appuser:appuser /app`). If you mount a volume there, recreate it with `docker compose down -v`, since old volumes keep their previous ownership.
- **`invalid compose project: undefined volume pgdata`:** declare `pgdata:` under a top-level `volumes:` key at column 0, aligned with `services:`.
- **`dependency failed to start: container ... has no healthcheck configured`:** every service used with `condition: service_healthy` needs a `healthcheck:` block.
- **Frontend can't reach the API:** confirm the `8080:8080` port mapping, that Drogon listens on `0.0.0.0`, and that CORS allows `http://localhost:5173` (or add a Vite `/api` proxy).