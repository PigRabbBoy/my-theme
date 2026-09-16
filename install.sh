#!/usr/bin/env bash
# Installs every PigRabb Theme (or removes them with `--uninstall`).
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
"$root/warp/install.sh" "$@"
"$root/zed/install.sh" "$@"
"$root/macos-terminal/install.sh" "$@"
# Last: it stops while DBeaver is running, and the others shouldn't wait on that.
"$root/dbeaver/install.sh" "$@"
