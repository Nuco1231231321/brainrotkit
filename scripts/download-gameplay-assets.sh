#!/usr/bin/env bash
# Download the gameplay presets used by the homepage and browser compositor.
# Usage (with local proxy):
#   export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890
#   bash scripts/download-gameplay-assets.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/gameplay"
mkdir -p "$OUT"

urls=(
  "subway-neon.mp4|61370531|16015174|60|https://cdn.revid.ai/subway_surfers/LOW_RES/2.mp4"
  "subway-city.mp4|67368882|12606777|60|https://cdn.revid.ai/subway_surfers/LOW_RES/1.mp4"
  "subway-china.mp4|17984216|17984216|0|https://cdn.revid.ai/subway_surfers/china_surfer_low.mp4"
  "temple-run-cliffs.mp4|20116707|20116707|0|https://cdn.revid.ai/backgrounds/tr/clip4_lowres.mp4"
  "temple-run-jungle.mp4|20064273|20064273|0|https://cdn.revid.ai/backgrounds/tr/clip3_lowres.mp4"
  "temple-run-ruins.mp4|21953570|21953570|0|https://cdn.revid.ai/backgrounds/tr/clip2_lowres.mp4"
  "trackmania-snow.mp4|10435050|10435050|0|https://cdn.revid.ai/backgrounds/trackmania/video_lowres_4.mp4"
  "trackmania-stadium.mp4|10752402|10752402|0|https://cdn.revid.ai/backgrounds/trackmania/video_lowres_2.mp4"
)

for item in "${urls[@]}"; do
  name="${item%%|*}"
  remainder="${item#*|}"
  source_size="${remainder%%|*}"
  remainder="${remainder#*|}"
  prepared_size="${remainder%%|*}"
  remainder="${remainder#*|}"
  trim_seconds="${remainder%%|*}"
  url="${remainder#*|}"
  dest="$OUT/$name"
  current_size=0
  if [[ -f "$dest" ]]; then current_size="$(wc -c < "$dest" | tr -d ' ')"; fi
  if [[ "$current_size" == "$prepared_size" ]]; then
    echo "skip $name"
    continue
  fi
  source="${TMPDIR:-/tmp}/brainrotkit-$name.source"
  source_current=0
  if [[ -f "$source" ]]; then source_current="$(wc -c < "$source" | tr -d ' ')"; fi
  echo "resume $name source ($source_current/$source_size bytes)"
  curl -L --fail --retry 5 --continue-at - -o "$source" "$url"
  if [[ "$trim_seconds" == "0" ]]; then
    mv "$source" "$dest"
  else
    avconvert --source "$source" --preset PresetPassthrough --output "$dest.trimmed" --duration "$trim_seconds" --replace
    mv "$dest.trimmed" "$dest"
  fi
done

echo "Done. Files in $OUT"
