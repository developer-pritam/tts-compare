"use client";

import { useState, useEffect } from "react";
import { HistoryEntry, ModelId } from "@/types";
import { getModelLabel } from "@/lib/models";

interface Props {
  entry: HistoryEntry;
  onReuseAudio: (file: File) => void;
  onDelete: (id: string) => void;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function b64ToObjectUrl(b64: string, mime: string): string {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

export default function HistoryItem({ entry, onReuseAudio, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (expanded && !audioUrl) {
      setAudioUrl(b64ToObjectUrl(entry.audioBlobB64, entry.audioMimeType));
    }
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  function reuseAudio() {
    const bytes = Uint8Array.from(atob(entry.audioBlobB64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: entry.audioMimeType });
    const ext = entry.audioMimeType.includes("mp4") ? "mp4" : "webm";
    const file = new File([blob], `reused-audio.${ext}`, { type: entry.audioMimeType });
    onReuseAudio(file);
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start justify-between gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700 truncate">
            {entry.models.length} model{entry.models.length !== 1 ? "s" : ""} compared
          </p>
          <p className="text-xs text-gray-400">{relativeTime(entry.createdAt)}</p>
        </div>
        <span className="text-gray-400 text-xs mt-0.5">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 bg-gray-50 space-y-3">
          <div className="flex flex-wrap gap-1 pt-2">
            {entry.models.map((m) => (
              <span
                key={m}
                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium"
              >
                {getModelLabel(m as ModelId)}
              </span>
            ))}
          </div>

          {audioUrl && (
            <audio controls src={audioUrl} className="w-full h-8" />
          )}

          <div className="space-y-2">
            {entry.results.map((r) => (
              <div key={r.modelId} className="bg-white rounded p-2 border border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-1">{getModelLabel(r.modelId as ModelId)}</p>
                {r.error ? (
                  <p className="text-xs text-red-500">{r.error}</p>
                ) : (
                  <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed">{r.transcript}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={reuseAudio}
              className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              ↩ Reuse Audio
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
