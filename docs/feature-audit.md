# Jiaxian Meet feature audit

## Scope and baseline

Reviewed main at b3e8896 with a clean working tree before implementation. This checkout contains a React 19 / TypeScript frontend, Vite, Tailwind v4 and handoff notes. README references a separate backend. No server, API definitions, signaling implementation or network client was found in the tracked application. The existence or readiness of services elsewhere is unknown.

Pre-change Chromium checks at 1280 × 720 opened the invitation, rejected an invalid code and entered the room using a valid demo format. Sending a message, entering a draft, hiding and reopening chat lost both values. Activities and Host controls produced no change and had no handlers. At 390 × 844 the chat toggle was invisible. Empty registration submitted without feedback and password recovery navigated to the empty hash. The signup route also lacked its intended focus target. The footer used offsets and the room retained an empty sidebar track with chat closed.

The active chat was ChatSidebar.tsx. ChatPanel.tsx is an unmounted older prototype. HomeScene provided a second route to the same preview. The illustrated auth hero and home promotional copy had no independent application behavior. The npm test script was an unconditional failure placeholder.

## Classification before redesign

| Baseline status | Features and evidence |
| --- | --- |
| Implemented & Verified | The invitation opened, malformed input was rejected, and a valid-format join reached the room in Chromium. |
| Implemented, Not Verified | Clipboard and fallback, complete player transport, replacement/cleanup, drag/drop, theater/fullscreen, native dialog keyboard behavior, smile insertion, video-state controls and complete browser history were source-inspected before changes. Runtime coverage after redesign is recorded below. |
| UI Demo Only | Create/join and sample invitation, participant count/list, local send, incoming message fixtures, mic state, upload-state fixtures and auth mode switch. |
| Broken / Non-functional | Chat close/reopen discarded history and draft. The chat toggle disappeared at mobile widths. Activities and Host controls had no behavior. Auth submit and social buttons had no success/error path, recovery linked to an empty hash, and the signup navigation focus target was missing. |
| Not Implemented | Dedicated Guide, actual room settings, meaningful credential submission validation and functional activity/host tools. |
| Backend Dependent | Room lifecycle, verification of room existence, capacity, presence, roles, shared media, synchronized playback/seek, remote messaging/history, voice signaling and authentication all lack frontend/service integration in this checkout. |

## Findings by feature

Paths below are relative to `frontend/src/components/` unless prefixed with `src/`. Status describes the delivered behavior. “UI Demo Only” identifies an exercised simulation even when the local interaction passed. “Backend Dependent” identifies an absent end-to-end capability requiring another service and a frontend adapter. P1 affects core use or trust, P2 affects secondary workflows, and P3 is optional or deferred.

| Feature | Status | Location | Finding, priority and dependency |
| --- | --- | --- | --- |
| Create Room | UI Demo Only | home/CreateRoomDialog.tsx, MeetHome.tsx | P1. Static invitation opens and enters the local room. Real creation needs room allocation. |
| Join Room | UI Demo Only | home/JoinRoomForm.tsx | P1. Format-only, cancellable 900 ms delay. Every matching code opens the same demo. Real admission needs lookup and an authoritative result. |
| Room code format, clear, invalid feedback | Implemented & Verified | home/demoRoom.ts, home/JoinRoomForm.tsx | P1. Tabbing through the input stays neutral. Submitting empty or malformed values shows an inline error on Home. Lowercase and surrounding whitespace work. No existence check. |
| Copy invitation | Implemented & Verified | home/CreateRoomDialog.tsx | P2. Chromium clipboard readback matched the fixture. When clipboard access was unavailable, the field selected the full code for manual copy. |
| Enter, leave, Back and Forward | Implemented & Verified | src/App.tsx, AppHeader.tsx, WatchRoom.tsx | P1. Hash navigation, entry from the invitation and join form, direct links and leave were exercised. Leaving resets local room state. |
| Two-person capacity enforcement | Backend Dependent | WatchRoom.tsx | P1. The two seats are fixtures. Needs admission, capacity and disconnect rules. |
| Participant list / status | UI Demo Only | WatchRoom.tsx | P1. Dialog identifies the local persona and a sample guest. No connected/online assertion. |
| Choose file and drag/drop | Implemented & Verified | watch-room/VideoPlayer.tsx | P1. Selected a generated six-second VP8 WebM through the chooser and loaded a second copy through a browser DataTransfer. |
| Play / pause | Implemented & Verified | watch-room/VideoPlayer.tsx | P1. Observed real media time advancing and stopping. Disabled until ready. |
| Seek | Implemented & Verified | watch-room/VideoPlayer.tsx | P1. Keyboard timeline changes updated the media time. |
| Volume / mute | Implemented & Verified | watch-room/VideoPlayer.tsx | P1. Slider and toggle updated media volume and muted state, including recovery from zero. Volume is available on narrow screens. |
| Playback speed | Implemented & Verified | watch-room/VideoPlayer.tsx | P2. Cycling changed the media element to 1.25×. |
| Fullscreen | Implemented & Verified | watch-room/VideoPlayer.tsx, src/index.css | P2. Entered and exited the native Fullscreen API in desktop Chromium. Availability varies by browser. |
| Theater view | Implemented & Verified | WatchRoom.tsx, watch-room/VideoPlayer.tsx | P2. Expands the local player and hides chat. Opening chat exits theater. |
| File replacement and recovery | Implemented & Verified | watch-room/VideoPlayer.tsx | P1. Unsupported text preserves the current file. A corrupt WebM raises a player error. Dropping a playable file recovers. |
| Object URL cleanup | Implemented & Verified | watch-room/VideoPlayer.tsx | P1. Previous blob URL became unreadable after replacement, current URL after leaving. Guide retained the URL. |
| Video state gallery | UI Demo Only | watch-room/VideoStatePreviewDialog.tsx, watch-room/VideoUploadState.tsx | P3. Settings exposes all five fixtures. Mock progress, cancel and retry are local controls. |
| Upload / share video | Backend Dependent | watch-room/VideoUploadState.tsx, watch-room/VideoPlayer.tsx | P1. No transfer client or shared media source. Requires an agreed transport, authorization, progress and failure lifecycle. |
| Synchronized play/pause and seek | Backend Dependent | watch-room/VideoPlayer.tsx | P1. Local media events only. Requires authoritative timing, ordering and reconnect behavior. |
| Host and guest permissions | Backend Dependent | WatchRoom.tsx, watch-room/VideoStatePreviewDialog.tsx | P1. Sample roles confer no authority. Needs room membership and enforced permissions. |
| Room state synchronization | Backend Dependent | src/App.tsx, WatchRoom.tsx | P1. Component state is browser-local. Requires shared snapshot/update semantics. |
| Send message | UI Demo Only | watch-room/ChatSidebar.tsx | P1. Enter and Send append locally. Shift+Enter inserts a line, smile edits the draft, whitespace cannot send. No network delivery. |
| Receive messages and real presence | Backend Dependent | watch-room/ChatSidebar.tsx, WatchRoom.tsx | P1. One labeled incoming fixture. Needs realtime delivery and membership/presence events. |
| Chat history and draft within the room | Implemented & Verified | WatchRoom.tsx, watch-room/ChatSidebar.tsx | P1. Fixed message and draft loss on toggle. Both survive Guide. Cross-session history needs storage and identity. |
| Chat visibility and scroll | Implemented & Verified | WatchRoom.tsx, watch-room/ChatSidebar.tsx, src/index.css | P1. Mobile toggle and close work. Sending scrolls the history. Closing returns focus to the toggle. |
| Microphone controls | UI Demo Only | watch-room/VoicePanel.tsx | P1. Toggle updates icon, label and pressed state beside “No audio connection”. No capture request. |
| WebRTC voice | Backend Dependent | watch-room/VoicePanel.tsx | P1. Missing frontend capture/peer lifecycle, signaling and agreed connectivity configuration. |
| Login and registration | Backend Dependent | SignUp.tsx, auth/AuthForm.tsx | P1. Restored original forms have editable fields. Submit prevents default and sends no credentials or authenticated result. Needs identity and session integration. |
| Google / Apple authentication | Backend Dependent | auth/AuthForm.tsx | P2. Original provider buttons are visible and have no handlers. Provider flows and session configuration are pending. |
| Password recovery | Backend Dependent | auth/AuthForm.tsx | P2. The restored original link resolves to the empty hash and returns Home. No recovery request, email or callback exists. |
| Authentication submission validation | Not Implemented | auth/AuthForm.tsx | P2. The original email input retains native format checking for nonempty values. Fields are optional and no credential validation service is connected. |
| Account form navigation | Implemented & Verified | SignUp.tsx, auth/AuthForm.tsx | P2. Home and Guide link to #login and #sign-up. Top and footer switches, direct entry, reload, and Back/Forward select the expected form. The logo returns Home. |
| Activities | Not Implemented | WatchRoom.tsx (baseline footer) | P3. Confirmed inert and removed from the toolbar. Future activities need a defined product feature. |
| Host controls | Not Implemented | WatchRoom.tsx (baseline footer) | P2. Confirmed inert and removed. Moderation or host-only playback actions require an agreed role model. |
| Settings | Implemented & Verified | WatchRoom.tsx | P2. Local theater preference and entry to the existing video state gallery. No server settings. |
| Help / Guide | Implemented & Verified | Guide.tsx, AppHeader.tsx, src/App.tsx | P1. Accessible from Home and room. Direct entry falls back to Home. Returning from the room preserves media and draft. |
| Dialogs, keyboard and route focus | Implemented & Verified | watch-room/RoomUI.tsx, src/App.tsx | P1. Native modal, Tab containment, Escape, backdrop dismissal, visible focus and return to opener. Browser-tested paths are listed below. |
| Responsive layout | Implemented & Verified | src/index.css, home/home.css | P1. Home actions in view, chat access, control geometry and overflow checked across all five requested sizes. |

## Verification boundaries

The automated suite in `frontend/tests/room.test.mjs` exercises one real Chromium instance with isolated contexts and a generated media fixture. It checks browser and DOM state, clipboard contents, media properties, file errors and URL lifetime. The five viewport cases are 1440 × 900, 1280 × 720, 768 × 1024, 390 × 844 and 320 × 568. These are desktop browser viewport tests. Physical mobile keyboards, screen-reader announcements, platform-specific codecs, iOS native media behavior and other browser engines were not exercised. See [redesign handoff](minimal-ui-redesign.md) for reproduction and affected files.
