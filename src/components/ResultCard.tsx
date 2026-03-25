"use client";

import { useState } from "react";
import { ModelResult } from "@/types";
import { getModelLabel } from "@/lib/models";

interface Props {
  result: ModelResult;
  loading?: boolean;
}

export default function ResultCard({ result, loading }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (result.transcript) {
      await navigator.clipboard.writeText(result.transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded w-4/5 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-3/5" />
      </div>
    );
  }

  const hasError = !!result.error;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 ${
        hasError ? "border-red-300" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{getModelLabel(result.modelId)}</p>
          <p className="text-xs text-gray-400 font-mono">{result.modelId}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {result.latencyMs != null && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                hasError ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
              }`}
            >
              {(result.latencyMs / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      {hasError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-medium text-red-600 mb-1">Error</p>
          <p className="text-sm text-red-700 break-words">{result.error}</p>
        </div>
      ) : (
        <div className="relative group flex-1">
          <div className="bg-gray-50 rounded-lg p-3 min-h-[80px] max-h-64 overflow-y-auto">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {result.transcript || <span className="text-gray-400 italic">No transcription</span>}
            </p>
          </div>
          {result.transcript && (
            <button
              onClick={copy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-500 hover:text-gray-700 shadow-sm"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
