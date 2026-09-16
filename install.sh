#!/usr/bin/env bash
# Installs every PigRabb Theme (or removes them with `--uninstall`).
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
"$root/warp/install.sh" "$@"
"$root/zed/install.sh" "$@"
"$root/macos-terminal/install.sh" "$@"
