#!/bin/bash
# Timed screen capture for one segment of the demo.
#
#   ./capture.sh 3 16      capture segment 3 for 16 seconds
#   ./capture.sh list      show what has been captured so far
#
# Records screen 0 at 30fps, scales to 1920 wide, and writes seg<N>.mp4.
# Starts after a 2 second lead-in so the first frame is never mid-click.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)/segments"
mkdir -p "$DIR"

if [ "${1:-}" = "list" ]; then
  for f in "$DIR"/seg*.mp4; do
    [ -e "$f" ] || { echo "nothing captured yet"; exit 0; }
    d=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")
    printf "  %-12s %5.1fs\n" "$(basename "$f")" "$d"
  done
  exit 0
fi

N="${1:?usage: ./capture.sh <segment-number> <seconds>}"
SECS="${2:?usage: ./capture.sh <segment-number> <seconds>}"
OUT="$DIR/seg${N}.mp4"

# Bring Chrome forward and let the compositor settle before the first frame.
# Whatever had focus (terminal, editor) must not appear in the recording.
osascript -e 'tell application "Google Chrome" to activate' >/dev/null 2>&1
sleep 1.5

# avfoundation index 4 is "Capture screen 0" on this machine. Verify with:
#   ffmpeg -f avfoundation -list_devices true -i ""
exec ffmpeg -hide_banner -loglevel error -y \
  -f avfoundation -capture_cursor 1 -framerate 30 -i "4:" \
  -t "$SECS" \
  -vf "crop=2560:1404:0:36,scale=1920:1080,setsar=1,format=yuv420p" \
  -c:v libx264 -preset veryfast -crf 20 -movflags +faststart \
  "$OUT"
