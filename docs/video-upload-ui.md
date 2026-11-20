# Video-state UI handoff

> Earlier design handoff. For the current interface and verification results, see the [minimal UI redesign](minimal-ui-redesign.md) and [feature audit](feature-audit.md).


The Watch Room now has a **Video UI states** action. It opens an isolated native
dialog for inspecting five presentation states. The approved local `VideoPlayer`
implementation is unchanged: file selection still uses an object URL and reads
media only on this device. Selection is never presented as a server upload.

## Preview each state

Open `/#watch-room`, click **Video UI states**, and choose a **Preview state**.

| State | Preview behavior |
| --- | --- |
| Empty | No video is selected in this sample. Use sample video moves to Uploading with a mock filename. |
| Uploading | `movie-night-demo.mp4`, a native progress bar, visible percentage, and Cancel demo upload. A separate labeled slider controls mock progress. |
| Ready | Sample availability only. No actual playable file is attached. Return to local player dismisses the dialog. |
| Error | Explicitly mock failure text and Retry demo, which returns to the mock Uploading state. |
| Waiting for host | Guest-view preview with a sample host name. No role, participation, or connection changes. |

The filename, initial 42% progress, host name, and error are static fixtures.
Progress never advances on a timer. Moving it to 100% does not invent a completed
transfer; select Ready to inspect that view. Cancel and Retry change only preview
state, then focus the state selector. Closing resets preview data on the next open.

Actual local playback can continue while this dialog is open. The preview never
pauses, replaces, clears, plays, or synchronizes that video. Ready preview has no
fake Play action, and none of the sample states enables playback controls.

## Reusable components

- `VideoUploadState.tsx`: pure, typed presentation of a `VideoUploadStatus` union.
  It receives `status`, required `isDemoPreview`, and `onSelect`, `onCancel`,
  `onRetry`, `onReturn` callbacks. It owns no File, URL, request, timer, or navigation.
- `VideoStatePreviewDialog.tsx`: owns only sample state, mock progress, and
  explanatory live announcements. It always supplies `isDemoPreview={true}`.
- `video-upload-state.css`: token-based native progress styling, imported by
  the reusable state view itself.
- `RoomDialog`: gains optional `size="wide"`. Existing callers retain the default
  width, native focus containment, Escape dismissal, and focus restoration.

`VideoUploadStatus` has these discriminated variants:

```ts
type VideoUploadStatus =
  | { kind: "empty" }
  | { kind: "uploading"; fileName: string; progress: number }
  | { kind: "ready"; fileName: string }
  | { kind: "error"; fileName?: string; message: string }
  | { kind: "waiting-for-host"; hostName: string };
```

Only a future parent connected to genuine state data may set `isDemoPreview` to
false. That flag does not implement or prove any server operation. Keep local
file readiness, remote transfer completion, guest access, and synchronized
playback as separate facts when integrating.

## Accessibility and layout

The selector and range have explicit labels and visible focus. State changes
are announced politely; mock error text is an alert. Native progress is labeled
and clamps finite input to 0–100 (nonfinite input displays 0). Its percentage
also appears as text. Filename, error, and host strings can wrap on narrow screens.
Actions retain at least 44px targets. Preview cards use natural height rather
than forcing text into a mobile 16:9 frame; the dialog scrolls internally.

## Backend teammate integration

1. Map actual file-transfer state and metadata into the presentation union.
2. Supply true progress and wire transport cancellation/retry to the callbacks.
3. Supply actionable server/media errors, including size, format, permission,
   expiry, and retry eligibility where the agreed contract requires them.
4. Establish real readiness and authorized playable media before displaying a
   non-demo Ready state; 100% progress alone must not imply guest availability.
5. Supply authoritative host/guest roles and video availability for Waiting.
6. Connect actual playback, synchronization, and room lifecycle separately.

No networking, upload, file transfer, backend code, WebRTC, or synchronization
is implemented here. Existing Home, Create, Join, local playback, and chat stay
independent of these fixtures. No dependencies were installed.

## Validation

Strict TypeScript validation and `npm run build` pass. All five state views and
seven progress-boundary cases also passed server-side render checks; these do
not verify browser appearance or interaction. Run the project checks from
`frontend` as documented in the root README. Browser verification is still outstanding;
the installed browser runtime has been unavailable. No visual-test pass is claimed.
