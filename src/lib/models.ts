import { ModelId } from "@/types";

export const MODELS: { id: ModelId; label: string }[] = [
  { id: "gpt-4o-mini-transcribe", label: "GPT-4o Mini Transcribe" },
  { id: "gpt-4o-mini-transcribe-2025-03-20", label: "GPT-4o Mini (2025-03-20)" },
  { id: "gpt-4o-mini-transcribe-2025-12-15", label: "GPT-4o Mini (2025-12-15)" },
  { id: "gpt-4o-transcribe", label: "GPT-4o Transcribe" },
  { id: "gpt-4o-transcribe-diarize", label: "GPT-4o Transcribe Diarize" },
  { id: "whisper-1", label: "Whisper-1" },
];

export const MODEL_IDS = new Set(MODELS.map((m) => m.id));

export function getModelLabel(id: ModelId): string {
  return MODELS.find((m) => m.id === id)?.label ?? id;
}
