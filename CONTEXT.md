# PigRabb Themes

Color themes for developer software, derived from the PigRabb Studio Design System, one folder per software.

## Language

### Source

**Design System**:
PigRabb Studio Design System on claude.ai/design — the only source of color truth for every Theme.
_Avoid_: DS kit, brand guide, palette

**Token**:
A named OKLCH color value defined by the Design System, such as `--color-pink-500` or `--text-primary`.
_Avoid_: variable, swatch

**Extra**:
A color the Themes need but the Design System's token file does not define — the Terminal kit's night palette, the off-brand blue and cyan, and the re-levelled Light ANSI colors.
_Avoid_: override, custom color

### Output

**Target**:
One piece of software that receives a Theme (Warp Terminal, Zed Editor, macOS Terminal).
_Avoid_: app, platform, editor

**macOS Terminal**:
The terminal application bundled with macOS — a Target, distinct from the Design System's Terminal kit and from Warp Terminal.
_Avoid_: Terminal.app, Apple Terminal, "the terminal"

**Variant**:
The light or dark rendition of a Theme. Which Variant is shown — following the operating system appearance or locked to one — is the user's choice per Target.
_Avoid_: mode, flavor, appearance

**Theme**:
The installable artifact for one Target, covering both Variants.
_Avoid_: skin, color scheme

**ANSI slot**:
One of the 16 terminal colors (normal and bright × black, red, green, yellow, blue, magenta, cyan, white). Zed adds 8 dim slots. Each Variant has one set of ANSI slots shared by every Target that renders a terminal.
_Avoid_: terminal color, palette entry

**Contrast gate**:
The rule that a Theme is rejected when a text color or ANSI slot falls below its minimum contrast ratio against the background it sits on.
_Avoid_: lint, accessibility check
