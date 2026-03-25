"use client";

import { useEffect, useState } from "react";
import { HistoryEntry } from "@/types";
import { loadHistory, deleteHistoryEntry, clearHistory } from "@/lib/history";
import HistoryItem from "./HistoryItem";

interface Props {
  refreshKey: number;
  onReuseAudio: (file: File) => void;
}

export default function HistoryPanel({ refreshKey, onReuseAudio }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setHistory(loadHistory());
    setLoading(false);
  }, [refreshKey]);

  function deleteEntry(id: string) {
    deleteHistoryEntry(id);
    setHistory((h) => h.filter((e) => e.id !== id));
  }

  function clearAll() {
    if (!confirm("Clear all history?")) return;
    clearHistory();
    setHistory([]);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">History</h2>
          {history.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              {history.length}
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No history yet</p>
          ) : (
            <>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {history.map((entry) => (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    onReuseAudio={onReuseAudio}
                    onDelete={deleteEntry}
                  />
                ))}
              </div>
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg py-1.5 transition-colors"
              >
                Clear all history
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
