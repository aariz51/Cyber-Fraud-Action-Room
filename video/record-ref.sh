#!/bin/bash
# Record the voice reference for cloning.
#   ./record-ref.sh          record (Ctrl+C to stop)
#   ./record-ref.sh play     play it back
#   ./record-ref.sh check    report duration / level / clipping
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/reference.wav"

case "${1:-record}" in
  play)  [ -f "$OUT" ] || { echo "No reference recorded yet."; exit 1; }
         echo "Playing reference ..."; afplay "$OUT"; exit 0 ;;
  check) [ -f "$OUT" ] || { echo "No reference recorded yet."; exit 1; }
         DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT")
         echo "duration : ${DUR}s"
         ffmpeg -hide_banner -v error -i "$OUT" -af "volumedetect" -f null - 2>&1 | grep -E "mean_volume|max_volume"
         awk -v d="$DUR" 'BEGIN{
           if (d < 18)      print "VERDICT  : too short. Aim for 20 to 30 seconds.";
           else if (d > 45) print "VERDICT  : longer than needed, but usable.";
           else             print "VERDICT  : good length."
         }'
         echo "If max_volume is 0.0 dB you clipped. Move back from the mic and redo."
         exit 0 ;;
esac

echo "Reference recording. Read REFERENCE.md out loud, normal pace."
echo "Quiet room. No music. No fan. Stay about a hand's width from the mic."
echo
for i in 3 2 1; do printf "  %s\n" "$i"; sleep 1; done
echo "  SPEAK NOW.  Press Ctrl+C when you reach the end."
ffmpeg -hide_banner -loglevel error -y -f avfoundation -i ":0" \
       -ac 1 -ar 24000 -acodec pcm_s16le "$OUT"
echo
echo "Saved -> $OUT"
echo "Now run:  ./record-ref.sh check"
