import { NextRequest, NextResponse } from "next/server";
import { ModelId, TranscribeResponse } from "@/types";
import { MODEL_IDS } from "@/lib/models";
import { transcribeOneModel } from "@/lib/transcribe";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const modelsJson = formData.get("models") as string | null;

    if (!audioFile || !modelsJson) {
      return NextResponse.json({ error: "Missing audio or models" }, { status: 400 });
    }

    let models: ModelId[];
    try {
      models = JSON.parse(modelsJson);
    } catch {
      return NextResponse.json({ error: "Invalid models JSON" }, { status: 400 });
    }

    const validModels = models.filter((m) => MODEL_IDS.has(m));
    if (validModels.length === 0) {
      return NextResponse.json({ error: "No valid models selected" }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = audioFile.type || "audio/webm";

    const results = await Promise.all(
      validModels.map((modelId) => transcribeOneModel(modelId, buffer, mimeType))
    );

    const response: TranscribeResponse = {
      runId: crypto.randomUUID(),
      results,
      audioBlobB64: buffer.toString("base64"),
      audioMimeType: mimeType,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Transcribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
