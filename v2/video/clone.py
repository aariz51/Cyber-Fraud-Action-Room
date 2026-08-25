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
    1: "In Indian cyber fraud, the first hour decides whether you get your money back. Report within minutes and there is a sixty percent chance it can still be frozen. After a week, five percent. Nothing tells you that at the time.",

    2: "So this is one door, and then a focused workspace. Money just moved. My account is frozen. Or I need to organise my case. Nothing urgent is buried in a landing page.",

    3: "Four questions build a local case. How much, how it left, when, and the one nobody asks. Did you approve the payment? That answer decides which law protects you.",

    4: "Now the clock is running. Fifty seven percent, and falling every minute you read this. The actions are ordered by how much money each one recovers, so calling 1930 comes first, with a script.",

    5: "This is the money trail. Your money fans out through intermediary accounts within minutes. Layer one is the only layer banks reliably catch, which is what makes speed mean something.",

    6: "Here an OpenAI model does exactly one job. It turns a panicking person's rough account into the factual chronology a police officer can act on. Everything else on this site stays deterministic.",

    7: "A second path, for the other victim of the same money trail. One tainted rupee freezes an entire account. A hundred and seventy five rupees disputed, eighteen lakh held. We test that freeze against real law.",

    8: "Real workflow, synthetic case data. It connects to no bank, no police system, no CFCFRMS. Every figure carries its source, and the one thing a prototype cannot have is the write that actually moves money.",

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
