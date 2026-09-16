#!/usr/bin/env bash
# Installs the PigRabb theme plugin into DBeaver: copies dbeaver/plugin into the app's plugins folder and registers it
# with one line in bundles.info, which DBeaver reads on every start. `--uninstall` removes both.
# It all lives inside DBeaver.app, so `brew upgrade --cask dbeaver-community` wipes it — run this again afterwards.
# Never quits DBeaver and never selects the theme — see dbeaver/README.md.
set -euo pipefail

src="$(cd "$(dirname "$0")" && pwd)/plugin"
app="${DBEAVER_APP:-/Applications/DBeaver.app}"
eclipse="$app/Contents/Eclipse"
info="$eclipse/configuration/org.eclipse.equinox.simpleconfigurator/bundles.info"
id=com.pigrabb.dbeaver.themes
version="$(sed -n 's/^Bundle-Version: //p' "$src/META-INF/MANIFEST.MF")"
folder="${id}_${version}"

if [[ "$(uname)" != Darwin ]]; then
  echo "DBeaver: skipped (not macOS)"
  exit 0
fi
if [[ ! -f "$info" ]]; then
  echo "DBeaver: skipped ($app not found)"
  exit 0
fi

# A running DBeaver keeps its plugin list in memory and may have unsaved work, so stop instead of closing it.
require_quit() {
  if pgrep -f "$app/Contents/MacOS/" >/dev/null; then
    echo "DBeaver: quit DBeaver first, then run this again" >&2
    exit 1
  fi
}

# Removes every installed version (folder + bundles.info line), keeping a copy of bundles.info as .bak.
remove() {
  cp "$info" "$info.bak"
  rm -rf "$eclipse/plugins/${id}_"*
  grep -v "^${id}," "$info.bak" > "$info" || true
}

case "${1:-}" in
  "")
    if grep -q "^${id},${version}," "$info" && [[ -d "$eclipse/plugins/$folder" ]]; then
      echo "DBeaver: PigRabb themes $version already installed"
      exit 0
    fi
    require_quit
    remove
    cp -R "$src" "$eclipse/plugins/$folder"
    echo "${id},${version},plugins/${folder}/,4,false" >> "$info"
    echo "DBeaver: installed PigRabb themes $version (choose it in Settings → User Interface → Appearance)"
    ;;
  --uninstall)
    require_quit
    remove
    echo "DBeaver: removed PigRabb themes"
    ;;
  *)
    echo "usage: $0 [--uninstall]" >&2
    exit 2
    ;;
esac
