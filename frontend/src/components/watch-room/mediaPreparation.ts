// These are frontend states. The storage and upload contracts are still open.
export type VideoUploadStatus =
  | { kind: "empty" }
  | { kind: "uploading"; fileName: string; progress: number }
  | { kind: "ready"; fileName: string }
  | { kind: "error"; fileName?: string; message: string }
  | { kind: "waiting-for-host"; hostName: string }
  | { kind: "canceled"; fileName: string };

export function normalizeProgress(value: number) {
  return Number.isFinite(value) ? Math.round(Math.min(100, Math.max(0, value))) : 0;
}

// Capture the returned callbacks for one asynchronous preparation of one file.
export function createMediaPreparation(publish: (state: VideoUploadStatus) => void) {
  let active: { file: Pick<File, "name">; controller: AbortController } | null = null;

  function discard() {
    const previous = active;
    active = null;
    previous?.controller.abort();
  }

  function begin(file: Pick<File, "name">) {
    if (active?.file === file) return null;
    discard();
    const request = { file, controller: new AbortController() };
    active = request;
    const fileName = file.name;
    publish({ kind: "uploading", fileName, progress: 0 });

    function finish(result: VideoUploadStatus) {
      if (active !== request) return;
      active = null;
      publish(result);
    }

    return {
      signal: request.controller.signal,
      progress(value: number) {
        if (active === request) publish({ kind: "uploading", fileName, progress: normalizeProgress(value) });
      },
      ready() { finish({ kind: "ready", fileName }); },
      fail(message: string) { finish({ kind: "error", fileName, message }); },
    };
  }

  function cancel() {
    if (!active) return;
    const fileName = active.file.name;
    discard();
    publish({ kind: "canceled", fileName });
  }

  return { begin, cancel, discard };
}
