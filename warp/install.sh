#!/usr/bin/env bash
# Copies the PigRabb Warp themes into ~/.warp/themes (macOS). `--uninstall` removes them.
# Never touches ~/.warp/settings.toml — see warp/README.md for selecting the theme.
set -euo pipefail

src="$(cd "$(dirname "$0")" && pwd)"
dest="$HOME/.warp/themes"
files=(pigrabb_dark.yaml pigrabb_light.yaml)

case "${1:-}" in
  "")
    mkdir -p "$dest"
    for f in "${files[@]}"; do cp "$src/$f" "$dest/$f"; done
    echo "Warp: installed ${files[*]} → $dest"
    ;;
  --uninstall)
    for f in "${files[@]}"; do rm -f "$dest/$f"; done
    echo "Warp: removed ${files[*]} from $dest"
    ;;
  *)
    echo "usage: $0 [--uninstall]" >&2
    exit 2
    ;;
esac
