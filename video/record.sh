#!/bin/bash
# Record one voiceover take.
#   ./record.sh 1        record take 1 (stop with Ctrl+C or wait for silence)
#   ./record.sh 1 play   play back take 1
set -u
DIR="$(cd "$(dirname "$0")" && pwd)/vo"
mkdir -p "$DIR"
N="${1:?usage: ./record.sh <take-number> [play]}"
OUT="$DIR/take${N}.wav"

if [ "${2:-}" = "play" ]; then
  [ -f "$OUT" ] || { echo "No take $N recorded yet."; exit 1; }
  echo "Playing take $N ..."; afplay "$OUT"; exit 0
fi

echo "Take $N. Recording starts in..."
for i in 3 2 1; do printf "  %s\n" "$i"; sleep 1; done
echo "  SPEAK NOW.  Press Ctrl+C when you finish the line."
ffmpeg -hide_banner -loglevel error -y -f avfoundation -i ":0" \
       -ac 1 -ar 48000 -acodec pcm_s16le "$OUT"
echo
echo "Saved -> $OUT"
