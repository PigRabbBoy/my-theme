#!/usr/bin/env bash
# Imports the PigRabb profiles into macOS Terminal by opening each .terminal file — the same as a double-click.
# Terminal stores profiles only in its own preferences (there is no themes folder), opens a window per import and
# names the profile after the file — so each file is named exactly like its profile.
# A profile that already exists is skipped, because re-importing adds a duplicate ("PigRabb Dark 1").
# Updating or removing a profile is manual — see macos-terminal/README.md. `--uninstall` prints those steps.
set -euo pipefail

src="$(cd "$(dirname "$0")" && pwd)"
profiles=("PigRabb Dark" "PigRabb Light")

if [[ "$(uname)" != Darwin ]]; then
  echo "macOS Terminal: skipped (not macOS)"
  exit 0
fi

# Read-only: top-level profile names sit at a 4-space indent in `defaults read` output.
has_profile() {
  defaults read com.apple.Terminal "Window Settings" 2>/dev/null | grep -qF "    \"$1\" = "
}

case "${1:-}" in
  "")
    for name in "${profiles[@]}"; do
      if has_profile "$name"; then
        echo "macOS Terminal: \"$name\" already exists — skipped (to update it, see macos-terminal/README.md)"
      else
        open "$src/$name.terminal"
        echo "macOS Terminal: imported \"$name\" (Terminal opens a window for it)"
      fi
    done
    ;;
  --uninstall)
    echo "macOS Terminal: profiles live in Terminal's preferences; remove them by hand:"
    echo "  Terminal → Settings → Profiles → select \"PigRabb Dark\" / \"PigRabb Light\" → click −"
    ;;
  *)
    echo "usage: $0 [--uninstall]" >&2
    exit 2
    ;;
esac
