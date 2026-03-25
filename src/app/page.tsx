"use client";

import { useState } from "react";
import AudioInput from "@/components/AudioInput";
import ModelSelector from "@/components/ModelSelector";
import ComparisonGrid from "@/components/ComparisonGrid";
import HistoryPanel from "@/components/HistoryPanel";
import { ModelId, ModelResult } from "@/types";
import { saveHistoryEntry } from "@/lib/history";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedModels, setSelectedModels] = useState<ModelId[]>(["gpt-4o-transcribe", "whisper-1"]);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [loadingModels, setLoadingModels] = useState<ModelId[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const [reuseFile, setReuseFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCompare() {
    if (!audioFile) return;
    if (selectedModels.length === 0) {
      setError("Please select at least one model.");
      return;
    }
    setError(null);
    setResults([]);
    setLoadingModels(selectedModels);

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("models", JSON.stringify(selectedModels));

    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Transcription failed");
        return;
      }
      setResults(data.results);
      saveHistoryEntry({
        id: data.runId,
        createdAt: new Date().toISOString(),
        models: selectedModels,
        results: data.results,
        audioBlobB64: data.audioBlobB64,
        audioMimeType: data.audioMimeType,
      });
      setHistoryKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoadingModels([]);
    }
  }

  function handleReuseAudio(file: File) {
    setReuseFile(file);
    setResults([]);
  }

  const isLoading = loadingModels.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            STT
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">STT Compare</h1>
            <p className="text-xs text-gray-400">Compare speech-to-text models side by side</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          {/* Left column: controls */}
          <div className="flex-1 min-w-0 space-y-4">
            <AudioInput onAudioReady={setAudioFile} externalFile={reuseFile} />
            <ModelSelector selected={selectedModels} onChange={setSelectedModels} />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleCompare}
              disabled={!audioFile || isLoading || selectedModels.length === 0}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Transcribing {selectedModels.length} model{selectedModels.length !== 1 ? "s" : ""}…
                </span>
              ) : (
                `Compare ${selectedModels.length} Model${selectedModels.length !== 1 ? "s" : ""}`
              )}
            </button>

            <ComparisonGrid results={results} loadingModels={loadingModels} />
          </div>

          {/* Right sidebar: history (desktop) */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <HistoryPanel refreshKey={historyKey} onReuseAudio={handleReuseAudio} />
          </div>
        </div>

        {/* Mobile history */}
        <div className="mt-6 lg:hidden">
          <HistoryPanel refreshKey={historyKey} onReuseAudio={handleReuseAudio} />
        </div>
      </main>
    </div>
  );
}
