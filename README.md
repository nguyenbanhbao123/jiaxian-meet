# jiaxian-meet

A Google Meet-style home page built with React, TypeScript, Vite and Tailwind CSS.

## Project structure

```
jiaxian-meet/
├── backend/            # Backend service (setup not documented yet)
└── frontend/
    ├── components/
    │   └── MeetHome.tsx
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

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

## Backend

Setup instructions for the `backend` folder have not been added yet.