"use client";

import { ModelId, ModelResult } from "@/types";
import ResultCard from "./ResultCard";

interface Props {
  results: ModelResult[];
  loadingModels: ModelId[];
}

export default function ComparisonGrid({ results, loadingModels }: Props) {
  if (results.length === 0 && loadingModels.length === 0) return null;

  const loadingPlaceholders: ModelResult[] = loadingModels.map((modelId) => ({
    modelId,
    transcript: null,
    latencyMs: null,
    error: null,
  }));

  const allItems = [
    ...results,
    ...loadingPlaceholders.filter((p) => !results.find((r) => r.modelId === p.modelId)),
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Results</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {allItems.map((item) => {
          const isLoading = loadingModels.includes(item.modelId);
          return <ResultCard key={item.modelId} result={item} loading={isLoading} />;
        })}
      </div>
    </div>
  );
}
