import { useLayoutEffect, useRef, useState } from "react";

type OperationState<T> =
  | { status: "idle" | "pending" | "error" | "canceled" }
  | { status: "success"; value: T };

export function useRoomOperation<T>(enabled: boolean) {
  const [state, setState] = useState<OperationState<T>>({ status: "idle" });
  const request = useRef<AbortController | null>(null);

  useLayoutEffect(() => {
    if (!enabled) setState({ status: "idle" });
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [enabled]);

  function reset(status: "idle" | "canceled" = "idle") {
    request.current?.abort();
    request.current = null;
    setState({ status });
  }

  async function run(operation: (signal: AbortSignal) => Promise<T>, onSuccess?: () => void) {
    if (!enabled || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setState({ status: "pending" });
    try {
      const value = await operation(controller.signal);
      // Even an adapter that completes after cancellation must not update the screen.
      if (controller.signal.aborted) return;
      setState({ status: "success", value });
    } catch {
      if (!controller.signal.aborted) setState({ status: "error" });
      return;
    } finally {
      if (request.current === controller) request.current = null;
    }
    onSuccess?.();
  }

  return { state, run, reset };
}
