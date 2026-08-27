"use client";

import { useCallback, useRef, useState } from "react";
import { Microphone, Stop, Spinner, Warning } from "@phosphor-icons/react";

/**
 * The mic.
 *
 * Deliberately one button. A person who has just lost money does not want a
 * language picker, a settings panel or a choice about codecs. They want to say
 * what happened. The model works out which language that was.
 */

export interface Heard {
  transcript: string;
  language: string;
  amount: number | null;
  route: "upi" | "card" | "netbanking" | "wallet" | "cash" | null;
  minutesAgo: number | null;
  consent: "unauthorised" | "deceived" | "unsure" | null;
  frozenAccount: boolean;
}

export function VoiceIntake({
  onHeard,
  prompt = "Tell me what happened, in your own words",
  hint = "Speak in any Indian language. Hindi, Kannada, Tamil, Bangla, Marathi, or English.",
}: {
  onHeard: (h: Heard) => void;
  prompt?: string;
  hint?: string;
}) {
  const [state, setState] = useState<"idle" | "recording" | "working" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTicking = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  };

  const send = useCallback(
    async (blob: Blob) => {
      setState("working");
      const form = new FormData();
      // The extension has to match the container or the API rejects it.
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      form.append("audio", new File([blob], `speech.${ext}`, { type: blob.type }));
      try {
        const res = await fetch("/api/listen", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          setMessage(data.error ?? "That did not work. Type it instead.");
          setState("error");
          return;
        }
        setState("idle");
        setMessage(null);
        onHeard(data as Heard);
      } catch {
        setMessage("Could not reach the server. Type it instead.");
        setState("error");
      }
    },
    [onHeard],
  );

  const start = useCallback(async () => {
    setMessage(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMessage("This browser will not give us the microphone. Type it instead.");
      setState("error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size > 0) void send(blob);
        else {
          setMessage("Nothing was recorded.");
          setState("error");
        }
      };
      rec.start();
      recorderRef.current = rec;
      setSeconds(0);
      setState("recording");
      tickRef.current = setInterval(() => {
        setSeconds((s) => {
          // Hard stop at 60s. Past that it is a monologue, not a report.
          if (s >= 59) {
            recorderRef.current?.stop();
            stopTicking();
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setMessage("Microphone permission was refused. Type it instead.");
      setState("error");
    }
  }, [send]);

  const stop = useCallback(() => {
    stopTicking();
    recorderRef.current?.stop();
  }, []);

  return (
    <div className="voice-intake">
      <p className="text-[14.5px] font-medium leading-snug">{prompt}</p>
      <p className="mt-1 text-[12.5px] leading-5" style={{ color: "var(--ink-3)" }}>
        {hint}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {state === "recording" ? (
          <button type="button" onClick={stop} className="btn btn-emergency px-4 py-2.5 text-sm">
            <Stop size={16} weight="fill" />
            Stop ({60 - seconds}s)
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={state === "working"}
            className="btn btn-primary px-4 py-2.5 text-sm"
          >
            {state === "working" ? (
              <>
                <Spinner size={16} className="animate-spin" />
                Listening to it
              </>
            ) : (
              <>
                <Microphone size={16} weight="fill" />
                Speak instead of typing
              </>
            )}
          </button>
        )}

        {state === "recording" && (
          <span className="flex items-center gap-2 text-[13px]" style={{ color: "var(--crit)" }}>
            <span className="voice-dot" aria-hidden />
            Recording
          </span>
        )}
      </div>

      {message && (
        <p
          className="mt-2.5 flex items-start gap-1.5 text-[13px] leading-5"
          style={{ color: "var(--warn)" }}
          role="status"
        >
          <Warning size={14} className="mt-0.5 shrink-0" weight="fill" />
          {message}
        </p>
      )}

      <p className="mt-2.5 text-[11.5px] leading-5" style={{ color: "var(--ink-4)" }}>
        The recording goes to an OpenAI model to be turned into text, and is not stored.
        Advice comes back in English or Hindi, which are the versions a person has
        checked.
      </p>
    </div>
  );
}
