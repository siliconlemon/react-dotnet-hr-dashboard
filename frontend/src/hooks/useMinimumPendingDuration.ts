import { useEffect, useRef, useState } from 'react';

/**
 * Extends a pending/loading flag until at least `minMs` have elapsed from when it last became true,
 * so a spinner can finish a visible rotation before hiding.
 */
export function useMinimumPendingDuration(rawPending: boolean, minMs: number): boolean {
  const [extended, setExtended] = useState(rawPending);
  const loadStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (minMs <= 0) {
      queueMicrotask(() => {
        setExtended(rawPending);
        if (!rawPending) loadStartRef.current = null;
      });
      return;
    }

    if (rawPending) {
      loadStartRef.current = Date.now();
      queueMicrotask(() => setExtended(true));
      return;
    }

    const start = loadStartRef.current;
    if (start == null) {
      queueMicrotask(() => setExtended(false));
      return;
    }

    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minMs - elapsed);

    if (remaining === 0) {
      loadStartRef.current = null;
      queueMicrotask(() => setExtended(false));
      return;
    }

    const id = window.setTimeout(() => {
      loadStartRef.current = null;
      setExtended(false);
    }, remaining);

    return () => window.clearTimeout(id);
  }, [rawPending, minMs]);

  return extended;
}
