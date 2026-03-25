import { HistoryEntry } from "@/types";

const KEY = "stt-compare-history";
const MAX_ENTRIES = 50;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): void {
  try {
    const existing = loadHistory();
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch (err) {
    // Quota exceeded — try saving without audio blob
    try {
      const existing = loadHistory();
      const slim = { ...entry, audioBlobB64: "" };
      const updated = [slim, ...existing].slice(0, MAX_ENTRIES);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch {
      console.warn("localStorage quota exceeded, history not saved", err);
    }
  }
}

export function deleteHistoryEntry(id: string): void {
  const updated = loadHistory().filter((e) => e.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
