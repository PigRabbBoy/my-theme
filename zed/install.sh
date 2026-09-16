#!/usr/bin/env bash
# Copies the PigRabb Zed theme family into ~/.config/zed/themes. `--uninstall` removes it.
# Never touches ~/.config/zed/settings.json — see zed/README.md for selecting the theme.
set -euo pipefail

src="$(cd "$(dirname "$0")" && pwd)"
dest="$HOME/.config/zed/themes"
file=pigrabb.json

case "${1:-}" in
  "")
    mkdir -p "$dest"
    cp "$src/$file" "$dest/$file"
    echo "Zed: installed $file → $dest"
    ;;
  --uninstall)
    rm -f "$dest/$file"
    echo "Zed: removed $file from $dest"
    ;;
  *)
    echo "usage: $0 [--uninstall]" >&2
    exit 2
    ;;
esac
