import OpenAI, { toFile } from "openai";
import { ModelId, ModelResult } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MIME_TO_EXT: Record<string, string> = {
  "audio/webm": "webm",
  "audio/webm;codecs=opus": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/flac": "flac",
  "audio/x-m4a": "m4a",
};

function getExtension(mimeType: string): string {
  const base = mimeType.split(";")[0].trim();
  return MIME_TO_EXT[base] ?? "webm";
}

export async function transcribeOneModel(
  modelId: ModelId,
  audioBuffer: Buffer,
  mimeType: string
): Promise<ModelResult> {
  const start = performance.now();
  try {
    const ext = getExtension(mimeType);
    const file = await toFile(audioBuffer, `audio.${ext}`, { type: mimeType });

    const response = await openai.audio.transcriptions.create({
      model: modelId,
      file,
      response_format: "text",
    });

    const latencyMs = Math.round(performance.now() - start);
    const transcript = typeof response === "string" ? response : (response as { text: string }).text;

    return { modelId, transcript, latencyMs, error: null };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const error = err instanceof Error ? err.message : String(err);
    return { modelId, transcript: null, latencyMs, error };
  }
}
