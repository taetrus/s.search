import { useEffect, useState } from "react";

const DEBOUNCE_MS = 200;

// Debounced, cancellable lookup. `key` describes the request (null = no request);
// `fetcher` must be stable (defined outside the component) and is called as fetcher(key, signal).
// Results are kept with the key they answer and returned only while it is still the current key,
// so stale results never show, and nothing has to be cleared inside the effect.
export function useLookup<T>(key: string | null, fetcher: (key: string, signal: AbortSignal) => Promise<T[]>): T[] {
  const [result, setResult] = useState<{ key: string | null; items: T[] }>({ key: null, items: [] });

  useEffect(() => {
    if (key === null) return;
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      fetcher(key, ctrl.signal)
        .then((items) => setResult({ key, items }))
        .catch(() => {}); // aborted: a newer request replaced this one
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [key, fetcher]);

  return key !== null && result.key === key ? result.items : [];
}
