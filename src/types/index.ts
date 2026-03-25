export type ModelId =
  | "gpt-4o-mini-transcribe"
  | "gpt-4o-mini-transcribe-2025-03-20"
  | "gpt-4o-mini-transcribe-2025-12-15"
  | "gpt-4o-transcribe"
  | "gpt-4o-transcribe-diarize"
  | "whisper-1";

export interface ModelResult {
  modelId: ModelId;
  transcript: string | null;
  latencyMs: number | null;
  error: string | null;
}

export interface TranscribeResponse {
  runId: string;
  results: ModelResult[];
  audioBlobB64: string;
  audioMimeType: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  models: ModelId[];
  results: ModelResult[];
  audioBlobB64: string;
  audioMimeType: string;
}
