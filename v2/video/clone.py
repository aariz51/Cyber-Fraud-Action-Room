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
    1: "Every cyber fraud has two victims. One is robbed. "
       "The other received the money, had no idea it was stolen, "
       "and wakes up to their entire balance frozen over a few hundred rupees.",

    2: "That second person has committed no offence. "
       "They are not a complainant. They are not an accused. "
       "No portal has a category for them, so they get no door at all.",

    3: "Golden Hour gives them one. A few questions about the freeze, "
       "and it works out where they actually stand.",

    4: "Here the account holds eighteen lakh sixty thousand rupees. "
       "The disputed credit is one hundred and seventy five rupees. "
       "That is ten thousand six hundred and twenty nine rupees locked "
       "for every rupee actually in question.",

    5: "It cites the real law, and the law disagrees with itself. "
       "Bombay and Delhi hold that police cannot debit freeze. "
       "Karnataka holds they can. So the advice changes with the state.",

    6: "Then it drafts the letter to the bank and the ten rupee RTI, "
       "and unlocks each next step only on the day it becomes admissible.",

    7: "The first victim still gets the first hour. A live recovery clock "
       "against their own incident time, and the actions ordered by how much "
       "each one actually recovers, so calling nineteen thirty leads, "
       "with a script, because people go blank on the phone.",

    8: "There is a second clock, and nobody shows you this one either. "
       "Rights expire on a schedule. Three days for zero liability. "
       "Fourteen for a preliminary enquiry to become an F I R. "
       "Thirty before the ombudsman will even look at you. "
       "And the word people misread most is Disposed. It does not mean resolved. "
       "It means the file was handed on and the ticket was closed.",

    9: "Freezing is also not the same as getting paid. Of about fifty three thousand "
       "crore reported stolen, roughly seven thousand six hundred crore was frozen, "
       "and only about one hundred and sixty seven crore reached victims. "
       "One OpenAI model does one job here, and every legal test is deterministic. "
       "The four fields that would fix all of this are on the proposal page. "
       "Every case here is synthetic.",
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
