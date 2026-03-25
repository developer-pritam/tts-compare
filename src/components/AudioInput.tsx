"use client";

import { useRef, useState, useEffect } from "react";

interface Props {
  onAudioReady: (file: File) => void;
  externalFile?: File | null;
}

export default function AudioInput({ onAudioReady, externalFile }: Props) {
  const [tab, setTab] = useState<"record" | "upload">("record");
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (externalFile) {
      const url = URL.createObjectURL(externalFile);
      setAudioUrl(url);
      setFileName(externalFile.name);
      setTab("upload");
      onAudioReady(externalFile);
    }
  }, [externalFile]); // eslint-disable-line react-hooks/exhaustive-deps

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/mp4";
    const mr = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      const file = new File([blob], `recording.${mimeType.includes("mp4") ? "mp4" : "webm"}`, {
        type: mimeType,
      });
      onAudioReady(file);
    };
    mr.start(250);
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setFileName(file.name);
    onAudioReady(file);
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Audio Input</h2>
      <div className="flex gap-2 mb-4">
        {(["record", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "record" ? "🎙 Record" : "📁 Upload"}
          </button>
        ))}
      </div>

      {tab === "record" && (
        <div className="flex flex-col items-center gap-4 py-4">
          {recording && (
            <div className="flex items-center gap-2 text-red-500 font-mono text-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              {formatTime(seconds)}
            </div>
          )}
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-md ${
              recording
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {recording ? "⏹" : "🎙"}
          </button>
          <p className="text-xs text-gray-400">{recording ? "Click to stop" : "Click to start recording"}</p>
        </div>
      )}

      {tab === "upload" && (
        <div className="py-4">
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
            <span className="text-2xl mb-1">📂</span>
            <span className="text-sm text-gray-500">
              {fileName ?? "Click to choose an audio file"}
            </span>
            <span className="text-xs text-gray-400 mt-1">mp3, wav, webm, m4a, ogg, flac…</span>
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      )}

      {audioUrl && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-1">Preview</p>
          <audio controls src={audioUrl} className="w-full h-10" />
        </div>
      )}
    </div>
  );
}
