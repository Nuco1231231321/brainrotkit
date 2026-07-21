#!/usr/bin/env bash
# Download open gameplay clips for offline use.
# Usage (with local proxy):
#   export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890
#   bash scripts/download-gameplay-assets.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/gameplay"
mkdir -p "$OUT"

urls=(
  "mineclone.webm|https://upload.wikimedia.org/wikipedia/commons/9/92/MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm"
  "supertux.webm|https://upload.wikimedia.org/wikipedia/commons/2/24/Gameplay_of_SuperTux_%288_Minutes%29.webm"
  "tux-ingo.webm|https://upload.wikimedia.org/wikipedia/commons/d/de/Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm"
  "tux-daggers.webm|https://upload.wikimedia.org/wikipedia/commons/3/33/Tux_Racer_gameplay_%28Path_of_Daggers%29.webm"
  "zero-ad.webm|https://upload.wikimedia.org/wikipedia/commons/b/bc/0_A.D._-_Gameplay-Test_15052019_Full-HD.webm"
  "red-eclipse-1.webm|https://upload.wikimedia.org/wikipedia/commons/3/34/Red_Eclipse_1%2C5_Gameplay_1.webm"
  "red-eclipse-2.webm|https://upload.wikimedia.org/wikipedia/commons/c/c6/Red_Eclipse_1%2C5_Gameplay_2.webm"
  "fez.webm|https://upload.wikimedia.org/wikipedia/commons/4/47/FEZ_trial_gameplay_HD.webm"
  "gigalomania.webm|https://upload.wikimedia.org/wikipedia/commons/6/60/Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm"
  "physics.webm|https://upload.wikimedia.org/wikipedia/commons/d/d9/Fantastic_Contraption_raw_gameplay_highlights.webm"
  "scp.webm|https://upload.wikimedia.org/wikipedia/commons/7/7e/SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm"
)

for item in "${urls[@]}"; do
  name="${item%%|*}"
  url="${item#*|}"
  dest="$OUT/$name"
  if [[ -f "$dest" ]]; then
    echo "skip $name"
    continue
  fi
  echo "download $name"
  curl -L --fail --retry 3 -o "$dest" "$url"
done

echo "Done. Files in $OUT"