import { useEffect, useRef, useState } from 'react';
import { Book, searchBooks } from '../services/googleBooks';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseBookSearchResult {
  books: Book[];
  status: SearchStatus;
  error: string | null;
}

const DEBOUNCE_MS = 400;

export function useBookSearch(query: string): UseBookSearchResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      controllerRef.current?.abort();
      setBooks([]);
      setStatus('idle');
      setError(null);
      return;
    }

    setStatus('loading');
    setError(null);

    const handle = setTimeout(() => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      searchBooks(trimmed, { signal: controller.signal })
        .then((results) => {
          if (controller.signal.aborted) return;
          setBooks(results);
          setStatus('success');
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
          setError(message);
          setStatus('error');
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
    };
  }, [query]);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  return { books, status, error };
}
