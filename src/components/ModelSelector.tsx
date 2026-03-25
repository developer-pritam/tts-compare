"use client";

import { MODELS } from "@/lib/models";
import { ModelId } from "@/types";

interface Props {
  selected: ModelId[];
  onChange: (selected: ModelId[]) => void;
}

export default function ModelSelector({ selected, onChange }: Props) {
  const allSelected = selected.length === MODELS.length;

  function toggle(id: ModelId) {
    if (selected.includes(id)) {
      onChange(selected.filter((m) => m !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Models</h2>
        <button
          onClick={() => onChange(allSelected ? [] : MODELS.map((m) => m.id))}
          className="text-xs text-indigo-600 hover:underline"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {MODELS.map((model) => {
          const checked = selected.includes(model.id);
          return (
            <label
              key={model.id}
              className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(model.id)}
                className="w-4 h-4 accent-indigo-600"
              />
              <span className="text-sm text-gray-700 font-medium">{model.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
