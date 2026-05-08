// Lightweight Google Books API client used by Basira.
// Docs: https://developers.google.com/books/docs/v1/using

export interface Book {
  id: string;
  title: string;
  authors: string[];
  coverImage: string | null;
  publishedDate?: string;
  description?: string;
  isbn?: string;
  infoLink?: string;
}

const API_BASE = 'https://www.googleapis.com/books/v1/volumes';

interface GoogleVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: { type: string; identifier: string }[];
    infoLink?: string;
  };
}

interface GoogleVolumesResponse {
  totalItems?: number;
  items?: GoogleVolume[];
}

function toHttps(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, 'https://');
}

function pickIsbn(ids?: { type: string; identifier: string }[]): string | undefined {
  if (!ids) return undefined;
  const isbn13 = ids.find((i) => i.type === 'ISBN_13');
  if (isbn13) return isbn13.identifier;
  const isbn10 = ids.find((i) => i.type === 'ISBN_10');
  return isbn10?.identifier;
}

function mapVolume(v: GoogleVolume): Book {
  const info = v.volumeInfo ?? {};
  const cover = toHttps(info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail);
  return {
    id: v.id,
    title: info.title ?? 'بدون عنوان',
    authors: info.authors ?? [],
    coverImage: cover,
    publishedDate: info.publishedDate,
    description: info.description,
    isbn: pickIsbn(info.industryIdentifiers),
    infoLink: info.infoLink,
  };
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<GoogleVolumesResponse> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Google Books request failed (${res.status})`);
  }
  return (await res.json()) as GoogleVolumesResponse;
}

export async function searchBooks(
  query: string,
  options: { maxResults?: number; signal?: AbortSignal } = {}
): Promise<Book[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const maxResults = options.maxResults ?? 20;
  const url = `${API_BASE}?q=${encodeURIComponent(trimmed)}&maxResults=${maxResults}&printType=books`;
  const data = await fetchJson(url, options.signal);
  return (data.items ?? []).map(mapVolume);
}

export async function searchByIsbn(
  isbn: string,
  options: { signal?: AbortSignal } = {}
): Promise<Book[]> {
  const cleaned = isbn.replace(/[^0-9Xx]/g, '');
  if (!cleaned) return [];
  const url = `${API_BASE}?q=isbn:${encodeURIComponent(cleaned)}`;
  const data = await fetchJson(url, options.signal);
  return (data.items ?? []).map(mapVolume);
}
