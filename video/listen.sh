#!/bin/bash
# Compare your real voice against the clone.
D="$(cd "$(dirname "$0")" && pwd)"
echo "▶ YOUR REAL VOICE (first 12s of the reference)"
ffmpeg -hide_banner -loglevel error -y -i "$D/reference-clean.wav" -t 12 /tmp/_ref12.wav && afplay /tmp/_ref12.wav
echo
echo "▶ THE CLONE reading take 1"
afplay "$D/vo/take1.wav"
echo
echo "Run again to re-listen:  ./listen.sh"
