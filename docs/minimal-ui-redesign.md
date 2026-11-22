# Minimal UI redesign

## Interface and state

| Screen | Primary interactions | State and navigation |
| --- | --- | --- |
| Home (`#home` or empty hash) | Create Room, room code, Join Room. The invitation includes copy with a manual fallback. | Creation and validated demo codes lead to the same local room. A compact ticket footer discloses the local demo. Guide preserves the code and cancels pending joins. |
| Watch room (`#watch-room`) | Choose Video, local transport controls, Chat, mic preview, participant samples, settings and Leave. | Desktop chat starts beside the player. Below 1024px it starts closed and opens in the document below the player. Closing chat leaves its history, draft and scroll container mounted. Theater expands the stage and hides chat. |
| Guide (`#guide`) | Seven concise topics, Back, direct watch-room entry and both account forms. | A Guide entry records its origin in browser history. A visit hides the originating screen, pauses local media and preserves its state. Back restores focus to Guide on the originating screen. Direct loading without an origin returns Home. |
| Accounts (`#login`, `#sign-up`) | Original Log In and Sign Up forms, top and footer mode switches, brand link to Home. | The hash selects the form on entry, reload and history traversal. Original credential, provider and recovery actions await backend integration. |

The original moon landscape occupies a shallow strip on the Home ticket. The promotional preview, extra entry buttons, feature cards and slogans have been removed from the primary flow. The screen uses the existing wordmark, system type stack, charcoal surfaces and champagne accent. Border, focus, hover, selection, disabled and reduced-motion treatment share existing semantic tokens. Standard room actions use a 44px target. The local player keeps native range and file inputs.

The room gives horizontal space back to the player when chat closes. Layout uses grid and flex wrapping. No fixed mobile overlay is needed to reach chat or its close button. Playback errors appear in the stage and file-selection errors appear in the player. The mic starts off and retains a visible audio-connection disclosure. The single incoming chat fixture is identified as a sample. Five video-state fixtures remain available in the development Watch Room at `/?diagnostics=1#watch-room`.

## Second-pass refinements

Home uses a 32rem card and a shorter landscape. Room code errors appear on submission and clear when corrected. The invitation groups copy with the sample code and shows a status line when needed. Playback controls group time, volume and view actions in two rows on narrow player surfaces. Chat retains its mounted history and draft, gives the open toggle a selected state, and expands the composer for multiline input.

The account page renders outside the room theme. Its historical desktop split layout, mobile form, branding and controls come from commit `97da9ce`. `HeroSection.tsx` is unchanged. In-place mode switches update the hash. The restored form prevents default submission. Provider buttons have no handlers, and the original password recovery link returns Home without sending email.

## Component changes

Paths in this table are relative to `frontend/`.

| Responsibility | Files | Change |
| --- | --- | --- |
| Routes, shared header and Guide | `src/App.tsx`, `src/components/AppHeader.tsx`, `src/components/Guide.tsx` | History-aware Guide, route focus, compact brand, accessible help, skip navigation. |
| Room entry | `src/components/MeetHome.tsx`, `home/HomeScene.tsx`, `home/JoinRoomForm.tsx`, `home/CreateRoomDialog.tsx`, `home/home.css` under `src/components/` | Compact invitation, existing validation and copy fallback, a single local disclosure. |
| Room and player | `src/components/WatchRoom.tsx`, `src/components/watch-room/VideoPlayer.tsx` | Video-first grid, contextual player messages, handset controls, Guide pause, playback settings and development access to video fixtures. |
| Communication | `ChatSidebar.tsx`, `VoicePanel.tsx` under `src/components/watch-room/` | Mounted collapsible chat, keyboard focus on open/close, compact mic preview. |
| Shared controls | `src/index.css`, `RoomIcon.tsx`, `RoomUI.tsx` under `src/components/watch-room/` for the two components | Shared styles, help and invitation icons, modal Tab containment and backdrop detection. |
| Account pages | `src/components/SignUp.tsx`, `src/components/auth/AuthForm.tsx`, original `auth/HeroSection.tsx` | Layout and forms restored from 97da9ce. Mode follows navigation. The original logo provides a return to Home. |
| Verification | `package.json`, `package-lock.json`, `tests/room.test.mjs`, `tests/fixtures/local-video.webm` | Replaced the failing test placeholder with Node's test runner and a dev-only Playwright driver. A 2 KB generated six-second solid-color VP8 clip makes tests repeatable offline. |

## Verification

Final checkout validation passed dependency installation, TypeScript checking, production bundling and all 13 Chromium regression cases.

From `frontend/`, run `npm ci`, `npx tsc --noEmit`, `npm run build` and `npm test`. Tests use installed Chrome or the executable selected by `CHROME_PATH`. They start a local Vite server on an available port. No application account, external movie asset or shared session is required.

- **Responsive and accessibility.** Five Chromium viewport cases cover 1440 × 900, 1280 × 720, 768 × 1024, 390 × 844 and 320 × 568. Checks include Home primary-action geometry, horizontal overflow, button size, icon naming, overlapping controls, mobile chat and focus after closing. Desktop and narrow-mobile screenshots were inspected.
- **Navigation and dialogs.** Tests exercise Guide from Home and room, browser Back/Forward, direct Guide fallback, invitation entry, Leave, keyboard submission, Escape, modal Tab containment, backdrop dismissal and opener focus restoration. The development diagnostics entry opens all five video fixtures.
- **Authentication.** Compared both modes with production builds of commit `97da9ce` and the restored frontend in the same headless Chrome. Screenshots matched at 1440 × 900, 390 × 844 and 320 × 568. Regression tests cover entry links, editable fields, both navigation controls, history, refresh, desktop/mobile panel geometry and unsupported actions.
- **Media.** Tests choose a real file, advance and seek playback, change volume and speed, enter and exit fullscreen, pause for Guide, replace a file, exercise invalid/corrupt media and recover by dropping a valid file. Blob URLs are checked after replacement and leaving.
- **Local communication.** Sending, draft editing, Shift+Enter, the smile button and closing/reopening chat are exercised. The mic pressed state and audio-connection disclosure are checked. No real voice or incoming connection is simulated.
- **Limits.** No physical-device, assistive-technology or cross-engine qualification was performed. Clipboard availability, fullscreen and supported codecs depend on browser and environment.

## Skills and integration handoff

The installed `frontend-design` skill informed the restrained ticket layout and reuse of local illustration. `design-system` guided semantic tokens and control states. `ui-styling` informed mobile-first layout, labels and keyboard controls. The `ui-ux-pro-max` design and UX searches informed contrast, focus visibility and touch targets. The installed Browser skill's setup was attempted; its service version could not load. Real interaction checks used Playwright with an isolated local headless Chrome. No standalone React or accessibility skill was present in the available catalog.

The checkout contains no agreed backend interface. Room creation, admission and capacity, participant presence, identity and recovery, shared video transport, authoritative playback/seek events, chat delivery/history and WebRTC signaling remain integration work. The existing video-state union describes local display states. It does not define a wire protocol. The [feature audit](feature-audit.md) maps each integration gap to the affected UI.
