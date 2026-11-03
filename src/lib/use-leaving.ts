import { useState } from "react";
import { useApp } from "./app-state";

/** Slide a card out, then resolve the approval so counts everywhere update. */
export function useLeaving() {
  const { resolveApproval } = useApp();
  const [leaving, setLeaving] = useState<Set<string>>(() => new Set());
  const leave = (key: string) => {
    setLeaving((s) => new Set(s).add(key));
    setTimeout(() => resolveApproval(key), 320);
  };
  return { leaving, leave };
}
