# Home UI handoff

> Earlier design handoff. For the current interface and verification results, see the [minimal UI redesign](minimal-ui-redesign.md) and [feature audit](feature-audit.md).


The Home page replaces the meeting calendar with a cinematic welcome screen.
It reuses the Watch Room palette, typography, button/panel classes, icons,
avatars, and native dialog component. Watch Room source and global styles are
unchanged. No dependencies or external assets were added.

## Components and styles

- `MeetHome.tsx`: welcome content, Create/Join entry points, Create dialog state,
  and the shared demo navigation callback.
- `home/JoinRoomForm.tsx`: code input, inline validation, simulated joining,
  duplicate-submit protection, cancellation, and accessible feedback.
- `home/demoRoom.ts`: shared static sample, prototype-only validation, and delay.
- `home/CreateRoomDialog.tsx`: invitation preview, sample-code display, local
  clipboard feedback/fallback, and Close/Enter actions. Reuses `RoomDialog`.
- `home/HomeScene.tsx`: original decorative SVG landscape and a demo-preview
  action. The illustration does not simulate live video or connected users.
- `home/home.css`: Home-scoped composition, form states, responsive layout,
  and reduced-motion-aware entrance animation. Existing tokens are reused.
- `App.tsx`: passes `onPreviewWatchRoom` to Home and preserves hash navigation
  and focus handling. The old floating preview switch is replaced by Home actions.

The installed frontend-design, design-system, ui-styling, and ui-ux-pro-max
Skills informed hierarchy, token reuse, responsive composition, and accessibility.

## Demo behavior

- Create opens an invitation preview with the static `DEMO-2SEATS` sample code.
  No room, code, server session, or invitation link is generated. The sample is
  visibly labeled as invalid for real room access.
- Copy code writes only that sample string to the clipboard on explicit click.
  Success appears after the write completes. Pending copy disables the button;
  unavailable/denied clipboard access selects the read-only code and shows manual
  copy instructions. Late copy results are ignored after the dialog unmounts.
- Close, the header close button, and Escape dismiss the native modal and return
  focus to its trigger. Enter Watch Room invokes the existing demo navigation.
  Code/copy controls stack on small screens, all actions retain 44px targets,
  and the shared dialog scrolls internally when its content exceeds the viewport.
- Join starts empty with a visible label and demo-code instructions. Submit
  stays enabled before validation so click and Enter can expose an empty-code
  error. Errors appear after blur or submission and update as the user edits.
- The input accepts up to 64 characters. The **demo-only** format is `DEMO-`
  followed by exactly six ASCII letters or numbers. Case is ignored and outer
  whitespace is trimmed. Internal spaces, invitation URLs, punctuation, and
  other formats are rejected inline. The normalized value is uppercase.
- A matching format shows a check icon and "Valid demo format. No room has been
  verified." This is a local string-format check, not real room validity.
- Submitting a matching value shows **Joining demo…** for 900ms, then invokes
  `onJoinDemo` to open the same existing Watch Room. This delay is a UI simulation,
  not a request, lookup, connection, or server verification. Every matching demo
  value has the same result; there is no supported-room registry.
- Pending submission locks input editing and disables clear/submit controls.
  Cancel remains available and returns focus to the editable input. The timer
  is cleared on Cancel, Home unmount, or opening the Create dialog. Duplicate
  submissions cannot schedule multiple navigations.
- The existing Create dialog and Join form use the same static sample. Neither
  passes a real room identifier or invitation link to the Watch Room.
- Explore demo and Take a look navigate directly to `#watch-room`.
- How it works scrolls to the feature overview without altering the route hash.
- Home form and dialog state reset when Home unmounts or the page reloads.

## Backend teammate integration

Replace `handleCreateRoom` and the Join form's local simulation only after the
room-management contract is agreed. Keep the explicit preview path available
while integrating and distinguish it from real room entry.

`CreateRoomDialog` receives `sampleRoomCode`, `onClose`, and `onEnterWatchRoom`
props. The static fixture lives in `home/demoRoom.ts`, copy state stays in the dialog, and
navigation stays with the parent. No server operation is hidden inside the UI.
When connecting real data, replace the demo-only sample model/copy, add pending
and failure states, and wire entry to the real room route. The supplied fixture
does not define the eventual room-code format or backend schema.

`JoinRoomForm` receives `onJoinDemo` and an optional `disabled` flag. The parent
blocks/cancels Join while Create is open. Validation lives in the separate pure
`validateDemoRoomCode` function, so the prototype rule can be replaced once a
real contract exists. Add actual asynchronous outcomes and backend errors at
integration time; never treat a local format match as authorization or existence.

### Join demo checks

| Input/action | Expected local UI |
| --- | --- |
| Untouched empty field | Neutral field; demo instructions |
| Submit empty or whitespace-only input | Inline required-code error and input focus |
| `ROOM-123`, `DEMO-ABC12`, or a URL | Inline invalid-format error |
| `DEMO-2SEATS` or ` demo-2seats ` | Valid demo-format feedback |
| `DEMO-ABC123` | Same format-only demo result; no real room implied |
| Submit a matching value, including via Enter | Simulated joining, disabled submit, then existing Watch Room |
| Cancel during the simulation | No navigation; retained code and restored input focus |
| Open Create during the simulation | Pending Join canceled; approved Create dialog opens |

The teammate still needs to provide:

1. Room creation and invitation-code generation.
2. A code format and lookup/join contract, including case sensitivity and length.
3. Room capacity, participant identity, permissions, and expired/full/not-found states.
4. Real room routing plus pending, retry, success, and failure handling.
5. Real-time participation, synchronization, and voice communication separately.

This change implements no APIs, authentication, database, WebSocket, WebRTC,
server upload, or real room-management logic. No endpoint or room-data schema
is assumed by this frontend.

## Validation and preview

Run from `frontend`:

```bash
npm run dev
npm run build
npx tsc --noEmit --jsx react-jsx --target ES2022 --module ESNext --moduleResolution bundler --lib DOM,ES2022 --strict --skipLibCheck --types vite/client src/main.tsx
```

Home uses two columns from 1024px and a natural single-column flow below that.
Controls retain at least 44px targets, inputs use 16px text, and no fixed viewport
height hides content. Motion follows `prefers-reduced-motion`.

TypeScript and build validation pass. Browser visual testing could not start
because the installed browser service references a missing runtime module.
Rendered mobile/desktop layouts, native-dialog interactions, and keyboard flows
still need browser verification; no screenshots or visual-test pass are claimed.
