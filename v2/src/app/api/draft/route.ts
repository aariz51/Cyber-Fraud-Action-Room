import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ROUTE_LABEL, type Consent, type FraudRoute } from "@/lib/case";

/**
 * Complaint drafting.
 *
 * A victim has to turn a confusing, upsetting hour into a factual chronology
 * that a police officer can act on. That is exactly the wrong task to hand
 * someone in a panic, and it is where an OpenAI model genuinely earns its place
 * in this product rather than being decoration.
 *
 * If no API key is configured, we fall back to a deterministic template so the
 * journey always completes. The response says which path produced the text and
 * the UI labels it, because pretending a template is a model would fail the
 * honesty bar this project is built on.
 */

export const runtime = "nodejs";

interface Body {
  amount: number;
  route: FraudRoute;
  consent: Consent;
  narrative: string;
  elapsedMin: number;
  incidentAt: number;
}

const SYSTEM = `You draft cyber-fraud complaints for Indian citizens reporting to the National Cyber Crime Reporting Portal.

Rules:
- Write in plain, factual, first-person English. No legal jargon the complainant would not use.
- Strict chronology. Times first, then what happened, then what was transferred.
- Never invent a detail. Never state a UPI ID, account number, phone number, name or
  reference number that the user did not give you.
- You MUST include these two placeholders verbatim, on their own line, because the
  complainant still has to fill them in:
  [PROVIDE: transaction reference number or UTR]
  [PROVIDE: beneficiary UPI ID or account number if known]
  Add further [PROVIDE: ...] markers for anything else material that is missing.
- AUTHORISATION IS LEGALLY LOAD-BEARING. Follow the supplied flag exactly and never
  soften or contradict it:
  - "no": the complainant did NOT authorise it. Say the transaction was unauthorised
    and that they did not knowingly share an OTP, PIN or password.
  - "yes, but under deception": the complainant DID authorise the payment themselves
    after being misled. Say exactly that. Do NOT call these transfers unauthorised
    and do NOT write that they happened without consent. Getting this wrong damages
    their claim.
  - "unsure": describe only what happened. Do not characterise consent either way.
- 150 to 220 words. Aim for the middle of that range. No preamble, no sign-off, no headings.
- Never use an em-dash. Use a full stop or a comma.
- End with one sentence requesting that a freeze request be raised with the beneficiary bank immediately.`;

function fallbackDraft(b: Body): string {
  const when = new Date(b.incidentAt);
  const t = when.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const how =
    b.consent === "unauthorised"
      ? "I did not authorise this transaction and did not share any OTP or password knowingly."
      : "I made the transfer myself after being misled about who I was dealing with.";

  const detail = b.narrative.trim()
    ? `\n\nWhat happened, in my own words: ${b.narrative.trim()}`
    : "\n\n[PROVIDE: a short account of how you were contacted and what you were told]";

  return `I am reporting a financial cyber fraud.

On ${t} an amount of Rs ${b.amount.toLocaleString("en-IN")} left my account by ${ROUTE_LABEL[b.route]}. ${how}${detail}

I have the following available: the transaction reference number, the bank alert I received, and screenshots of the messages sent to me. [PROVIDE: transaction reference number] [PROVIDE: beneficiary UPI ID or account number if known]

I realised this was a fraud and am reporting it now. I request that a freeze request be raised with the beneficiary bank immediately so that any remaining balance in the receiving account can be held.`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ error: "An amount is required" }, { status: 400 });
  }

  // Aariz's local shell currently exposes OPENAI_KEY. Production providers
  // conventionally expose OPENAI_API_KEY, so support both without ever sending
  // either value to the browser.
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!key) {
    return NextResponse.json({
      text: fallbackDraft(body),
      source: "template" as const,
      note: "No OpenAI key is configured, so this came from a built-in template.",
    });
  }

  try {
    const client = new OpenAI({ apiKey: key });
    const when = new Date(body.incidentAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            `Amount lost: Rs ${body.amount}`,
            `Payment route: ${ROUTE_LABEL[body.route]}`,
            `When it happened: ${when}`,
            `Authorised by the victim: ${body.consent === "deceived" ? "yes, but under deception" : body.consent === "unauthorised" ? "no" : "unsure"}`,
            `The victim describes it like this: ${body.narrative.trim() || "(they have not written anything yet)"}`,
          ].join("\n"),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty completion");

    return NextResponse.json({
      text: text.replace(/[—–]/g, "-"),
      source: "openai" as const,
      model: completion.model,
    });
  } catch (err) {
    // Never let the journey break. Fall back and say so.
    return NextResponse.json({
      text: fallbackDraft(body),
      source: "template" as const,
      note:
        err instanceof Error && err.message.includes("401")
          ? "The configured OpenAI key was rejected, so this came from a built-in template."
          : "The model call did not complete, so this came from a built-in template.",
    });
  }
}
