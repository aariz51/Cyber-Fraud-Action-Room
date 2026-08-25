#!/usr/bin/env python
"""
Generate the Golden Hour voiceover in Aariz's voice using Chatterbox zero-shot
cloning.

    ~/tts-venv/bin/python clone.py                 # all takes
    ~/tts-venv/bin/python clone.py 3               # just take 3
    ~/tts-venv/bin/python clone.py --ref other.wav # different reference

Reference audio should be 20 to 30 seconds, one speaker, quiet room, 24kHz mono.
The reference is the single biggest lever on output quality.
"""

import argparse
import re
import sys
import time
from pathlib import Path

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS

HERE = Path(__file__).resolve().parent
VO = HERE / "vo"

# Delivery. Chatterbox reads these as: how much emotional colour, and how hard to
# hold onto the reference timbre. Documentary narration wants restraint on both.
EXAGGERATION = 0.4
CFG_WEIGHT = 0.5

# Pause inserted between sentences within one take, in seconds.
SENTENCE_GAP = 0.28


# --------------------------------------------------------------------------
# Proper nouns
# --------------------------------------------------------------------------
# Chatterbox is strong on ordinary English and weak on initialisms and Indian
# numerals. Respell anything it would mangle BEFORE it reaches the model.
SPEAKABLE = [
    (r"\bCFCFRMS\b", "C F C F R M S"),
    (r"\bNCRP\b", "N C R P"),
    (r"\bBNSS\b", "B N S S"),
    (r"\bRBI\b", "R B I"),
    (r"\bUPI\b", "U P I"),
    (r"\bI4C\b", "I four C"),
    (r"\bFIR\b", "F I R"),
    (r"\bRTI\b", "R T I"),
    (r"\b1930\b", "nineteen thirty"),
    (r"\blakh\b", "lakh"),
    (r"\bRs\.?\s?", "rupees "),
]


def speakable(text: str) -> str:
    out = text
    for pattern, replacement in SPEAKABLE:
        out = re.sub(pattern, replacement, out)
    # collapse whitespace so the model does not read ragged line breaks as pauses
    return re.sub(r"\s+", " ", out).strip()


# --------------------------------------------------------------------------
# The script
# --------------------------------------------------------------------------
TAKES: dict[int, str] = {
    1: "In Indian cyber fraud, the outcome is decided in the first hour. "
       "Report within minutes and there is a sixty percent chance the money can still be frozen. "
       "After a week, it is five percent. Nothing in the system today tells you that.",

    2: "Golden Hour asks four questions. How much, how it left, when, and the one nobody asks. "
       "Did you approve the payment? That last answer decides which law protects you.",

    3: "Now the clock is running. Fifty seven percent, falling one point three points every ten minutes. "
       "And this is where your money actually is. "
       "Still mostly in the first account, the only layer banks reliably catch.",

    4: "The official flow opens with a form. But the freeze request is what stops money, so that leads. "
       "Call 1930 first, with a script, in Hindi or English, because people go blank on the phone.",

    5: "Six hours later. The odds have fallen to forty one percent. "
       "The money has scattered across forty three accounts. "
       "That is the whole argument, made visible.",

    6: "Second journey. Your own account frozen because you received one tainted rupee. "
       "A hundred and seventy five rupees disputed, eighteen lakh held. "
       "We test that freeze against real law, and draft the letter.",

    7: "An OpenAI model does exactly one job here. "
       "It turns a panicking person's story into the chronology a police officer can act on. "
       "Everything else is deterministic, because someone deciding what to do in ten minutes "
       "deserves the same answer every time.",

    8: "Every figure carries its source. Every mock is listed. "
       "The one thing a prototype cannot have is the write into CFCFRMS. "
       "That is the only step that moves money, "
       "and this is the wrapper that should exist around it.",
}


def split_sentences(text: str) -> list[str]:
    """Generate a sentence at a time. Shorter inputs hold the voice better and
    give us control over pacing between them."""
    parts = re.split(r"(?<=[.?!])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("takes", nargs="*", type=int, help="take numbers, default all")
    ap.add_argument("--ref", default=str(HERE / "reference.wav"))
    ap.add_argument("--exaggeration", type=float, default=EXAGGERATION)
    ap.add_argument("--cfg", type=float, default=CFG_WEIGHT)
    args = ap.parse_args()

    ref = Path(args.ref)
    if not ref.exists():
        print(f"Reference not found: {ref}")
        print("Record one first:  ./record-ref.sh")
        return 1

    dur = torchaudio.info(str(ref)).num_frames / torchaudio.info(str(ref)).sample_rate
    print(f"reference : {ref.name}  ({dur:.1f}s)")
    if dur < 15:
        print("  warning: under 15s. The clone will be weaker than it needs to be.")

    wanted = args.takes or sorted(TAKES)
    VO.mkdir(parents=True, exist_ok=True)

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"device    : {device}")
    t0 = time.time()
    model = ChatterboxTTS.from_pretrained(device=device)
    print(f"model     : ready in {time.time()-t0:.1f}s\n")

    gap = torch.zeros(1, int(model.sr * SENTENCE_GAP))

    for n in wanted:
        if n not in TAKES:
            print(f"take {n}: no such take, skipping")
            continue
        t1 = time.time()
        chunks = []
        for sentence in split_sentences(TAKES[n]):
            wav = model.generate(
                speakable(sentence),
                audio_prompt_path=str(ref),
                exaggeration=args.exaggeration,
                cfg_weight=args.cfg,
            )
            if wav.dim() == 1:
                wav = wav.unsqueeze(0)
            chunks.append(wav.cpu())
            chunks.append(gap)
        audio = torch.cat(chunks[:-1], dim=1)  # drop the trailing gap
        out = VO / f"take{n}.wav"
        torchaudio.save(str(out), audio, model.sr)
        secs = audio.shape[1] / model.sr
        print(f"take {n}: {secs:5.1f}s  ->  {out.name}   ({time.time()-t1:.1f}s to make)")

    total = 0.0
    for n in sorted(TAKES):
        f = VO / f"take{n}.wav"
        if f.exists():
            info = torchaudio.info(str(f))
            total += info.num_frames / info.sample_rate
    print(f"\ntotal narration: {total:.1f}s  (cap is 120s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
