# Watch Room refinement

> Earlier design handoff. For the current interface and verification results, see the [minimal UI redesign](minimal-ui-redesign.md) and [feature audit](feature-audit.md).


The existing cinematic identity is retained: charcoal surfaces, champagne gold,
Avenir typography, rounded panels, and the original movie-night empty state.
Changes are limited to frontend hierarchy, layout, component states, and accessibility.

## Skills applied

- **frontend-design:** preserve the established visual direction and emphasize the screen.
- **design-system:** centralize semantic and component tokens and consistent control states.
- **ui-styling:** use Tailwind v4 layers, responsive utilities, and the existing React primitives.
- **ui-ux-pro-max:** review contrast, keyboard focus, target sizes, hierarchy, and overflow.
- **Browser:** attempt connected-browser visual QA; the runtime failed during setup.

No Skills, packages, fonts, icon libraries, or dependencies were installed.

## Design decisions

| Element | Convention |
| --- | --- |
| Surfaces | Base `#111318`, panel `#1B1E25`, canvas `#050608` |
| Text | Primary `#F5F5F5`, secondary `#A5AAB5` |
| Accent | Champagne `#DFCEA2`, with explicit hover and active tokens |
| Typography | Existing Avenir family; 14px message text, 12px metadata, 11px uppercase labels |
| Corners | 16px panels, 10px controls |
| Spacing | 4px base rhythm, 16px component gaps, 20px workspace gap |
| Controls | At least 44px targets, including range hit areas |
| Focus | 2px champagne outline; inset outline for the chat scroll region |

Panel borders stay subtle. Interactive borders and timeline tracks use stronger
tokens. Calculated secondary-text contrast is 7.16:1 on panels and 6.42:1 on
raised surfaces; gold on panels is 10.71:1. The timeline track is 3.97:1 on panels.

## Responsive behavior

At desktop widths of at least 1024px and heights of at least 640px, the room is a
viewport-height grid. Navigation and room context take their natural height;
the player, voice dock, chat, and footer receive the remaining space. This
replaces the former fixed 24rem allowance and width constraint.

Desktop main padding and vertical gaps are 12px. Playback controls, metadata,
and voice controls keep their intrinsic height. The 16:9 display fits within a
flexible black slot using container height units, preserving the image without
stretching or cropping. Empty-state decoration compacts when space is short;
text and 44px buttons retain their existing sizes.

| Target | Implementation and calculated layout budget |
| --- | --- |
| 1440 × 900 | Screen and 320px chat side by side; voice and chat composer end around 858px vertically |
| 1280 × 720 | Same layout with a shorter fitted screen; voice and chat composer end around 678px vertically |
| 768px width | Full-width screen; chat follows the voice dock; controls end around 641px vertically |

These figures are CSS estimates for the normal empty/local-video state,
**not browser measurements or visual verification**.
The chat composer remains outside its keyboard-scrollable history. Below desktop
widths, chat has a bounded 36rem height. Controls can wrap rather than overflow.
Very narrow screens hide the decorative film icon to protect the file-picker action.

Below 640px viewport height, normal page scrolling remains available. Exceptional
amounts of wrapped text or notices may also grow the page instead of clipping or
squashing controls. Theater view fits the player and voice dock into the first
desktop viewport, with chat and the footer flowing below it. The desktop room
owns that intentional overflow so its dark surface continues behind all content.
Fullscreen uses the same fitted-display behavior.

## Preserved behavior and accessibility

- Local file selection, drag-and-drop, object URL cleanup, media events, seeking,
  volume, playback speed, theater mode, and fullscreen remain in place.
- Chat retains Enter/Shift+Enter, IME handling, trimming, length limits, smile
  insertion, and chat-only scrolling. Initial history opens at the latest message.
- Toggle accessible names stay stable while `aria-pressed` communicates state.
- Native dialogs have bounded height, internal scrolling, unique heading IDs,
  Escape dismissal, and focus restoration. Switching previews also moves focus.
- Reduced motion is respected. Native range inputs retain keyboard interaction.
- Demo labels remain visible. No audio connection, upload, or synchronization is introduced.

## QA status

- Strict TypeScript validation and the production build pass.
- MeetHome, dependency manifests, and the lockfile are unchanged.
- Browser QA could not start: the installed browser service references a missing
  runtime module. No screenshots, actual media playback, keyboard walkthrough,
  zoom behavior, or rendered breakpoint layouts have been visually verified.
- Remaining validation: run those browser checks at the three requested sizes,
  including long messages, a local video, mute/unmute, fullscreen, and 200% zoom.

Preview with `cd frontend && npm run dev`, then open `/#watch-room` on the URL
printed by Vite. Home preview and Leave still return to the preserved home page.
