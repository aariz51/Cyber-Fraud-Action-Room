import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * VOICE INTAKE
 * ------------
 * A person in the first hour after losing money is shaking. Typing a two hundred
 * character description into a form is the wrong input method for that moment,
 * and the story that comes out is code-mixed Hinglish, or Kannada, or Bhojpuri.
 * A keyword matcher cannot survive that. Speech can.
 *
 * Two model calls, each with exactly one job:
 *
 *   1. gpt-4o-transcribe  hears the audio in whatever language it was spoken and
 *                         returns the words plus the language it detected.
 *   2. gpt-4.1-mini       reads those words and extracts only the facts the case
 *                         needs, into a fixed schema, or returns null for
 *                         anything it did not actually hear.
 *
 * Neither is allowed to decide anything. The recovery clock, the action order and
 * every legal test stay deterministic. The model turns speech into fields; the
 * rules engine still does the thinking.
 *
 * What we do NOT claim: that the advice comes back in Kannada. Understanding a
 * language and being safe to give legal guidance in it are different bars, and
 * the second one needs a human who reads it. Input is open to every language the
 * model hears. Output stays English and Hindi, and the UI says so.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

/** The only fields voice is allowed to fill. Everything else stays user-chosen. */
interface Heard {
  transcript: string;
  language: string;
  amount: number | null;
  route: "upi" | "card" | "netbanking" | "wallet" | "cash" | null;
  minutesAgo: number | null;
  consent: "unauthorised" | "deceived" | "unsure" | null;
  frozenAccount: boolean;
}

const EXTRACT = `You convert a cyber-fraud victim's spoken account into fields.

Return ONLY a JSON object with these keys:
  amount        number of rupees lost, or null if not stated
  route         one of upi, card, netbanking, wallet, cash, or null
  minutesAgo    how long ago it happened in minutes, or null
  consent       "unauthorised" if money left without them approving anything,
                "deceived" if they were tricked into approving it,
                "unsure" if genuinely unclear, or null if not discussed
  frozenAccount true only if they say their OWN account has been frozen or
                blocked, false otherwise

Rules you must follow:
- Never invent a number. If they did not say an amount, amount is null.
- "Fifty thousand" is 50000. "Do lakh" is 200000. "Sadhe teen hazaar" is 3500.
- Do not infer consent from tone. Only from what they describe.
- Return the JSON and nothing else.`;

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Voice needs an OpenAI key on the server. Type it instead." },
      { status: 503 },
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("audio");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "Could not read the recording." }, { status: 400 });
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No audio was received." }, { status: 400 });
  }
  // A minute of speech is plenty. Anything larger is a mistake, not a story.
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "That recording is too long." }, { status: 413 });
  }

  const client = new OpenAI({ apiKey: key });

  let transcript = "";
  let language = "";
  try {
    const result = await client.audio.transcriptions.create({
      file,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-transcribe",
      // No language hint. Forcing a language is how you mistranscribe Kannada as
      // bad Hindi. Let the model hear what was actually spoken.
      response_format: "json",
    });
    transcript = (result as { text?: string }).text?.trim() ?? "";
    language = (result as { language?: string }).language ?? "";
  } catch (error) {
    console.error("[listen] transcription failed", error);
    return NextResponse.json(
      { error: "Could not hear that clearly. Try again, or type it instead." },
      { status: 502 },
    );
  }

  if (!transcript) {
    return NextResponse.json(
      { error: "Nothing was said in that recording." },
      { status: 422 },
    );
  }

  const heard: Heard = {
    transcript,
    language,
    amount: null,
    route: null,
    minutesAgo: null,
    consent: null,
    frozenAccount: false,
  };

  // Extraction is best-effort. A transcript with no fields is still useful: it
  // goes straight into the complaint narrative.
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACT },
        { role: "user", content: transcript },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Heard>;
      const routes = ["upi", "card", "netbanking", "wallet", "cash"];
      const consents = ["unauthorised", "deceived", "unsure"];
      if (typeof parsed.amount === "number" && parsed.amount > 0) heard.amount = Math.round(parsed.amount);
      if (typeof parsed.route === "string" && routes.includes(parsed.route)) heard.route = parsed.route as Heard["route"];
      if (typeof parsed.minutesAgo === "number" && parsed.minutesAgo >= 0) heard.minutesAgo = Math.round(parsed.minutesAgo);
      if (typeof parsed.consent === "string" && consents.includes(parsed.consent)) heard.consent = parsed.consent as Heard["consent"];
      heard.frozenAccount = parsed.frozenAccount === true;
    }
  } catch (error) {
    console.error("[listen] extraction failed, returning transcript only", error);
  }

  return NextResponse.json(heard);
}
