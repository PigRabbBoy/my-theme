#!/usr/bin/env node
// Builds every PigRabb Theme from the Design System tokens.
//   in:  tokens/colors_and_type.css (vendored verbatim), tokens/extras.json
//   out: warp/pigrabb_{dark,light}.yaml, zed/pigrabb.json, macos-terminal/PigRabb {Dark,Light}.terminal
// Nothing is written when the Contrast gate fails (exit 1).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAMES = { dark: 'PigRabb Dark', light: 'PigRabb Light' };
const SLOTS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

// ---------- color math ----------

export function parseOklch(value) {
  const m = value.trim().match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/);
  if (!m) throw new Error(`not an oklch() color: ${value}`);
  return { l: +m[1], c: +m[2], h: +m[3], a: m[4] === undefined ? 1 : +m[4] };
}

function oklchToLinearSrgb({ l, c, h }) {
  const L = l / 100;
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lms = [
    (L + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    (L - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    (L - 0.0894841775 * a - 1.291485548 * b) ** 3,
  ];
  return [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

// Out-of-gamut colors lose chroma (lightness and hue stay) until they fit sRGB.
function toLinearSrgb(color) {
  let rgb = oklchToLinearSrgb(color);
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = color.c;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinearSrgb({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinearSrgb({ ...color, c: lo });
  }
  return rgb.map((v) => Math.min(1, Math.max(0, v)));
}

const byte = (n) => Math.round(n).toString(16).padStart(2, '0');
const encode = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function toHex(color, { alpha = false } = {}) {
  const rgb = toLinearSrgb(color).map((v) => byte(encode(v) * 255)).join('');
  return alpha ? `#${rgb}${byte(color.a * 255)}` : `#${rgb}`;
}

// WCAG 2 contrast, measured on the rounded hex the app actually renders.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(hexA, hexB) {
  const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const shift = (color, dl) => ({ ...color, l: Math.min(100, Math.max(0, color.l + dl)) });

// ---------- tokens ----------

function readBlock(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no "${selector}" block in colors_and_type.css`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

function loadTokens() {
  const css = readFileSync(join(ROOT, 'tokens/colors_and_type.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const root = readBlock(css, ':root');
  // The dark block only overrides; every var() inside it must resolve against the dark scope first.
  return { light: root, dark: { ...root, ...readBlock(css, '[data-theme="dark"]') } };
}

// A color reference is a DS token (`--color-pink-500`), an Extra (`night.bg`) or a literal `oklch()`.
// Tokens listed in extras.relevel replace the DS value for that Variant (same hue + chroma, lightness raised to pass the gate).
function palette(tokens, extras, variant) {
  const scope = { ...tokens[variant], ...extras.relevel[variant] };
  const get = (ref, seen = []) => {
    if (seen.includes(ref)) throw new Error(`reference cycle: ${[...seen, ref].join(' → ')}`);
    const raw = ref.startsWith('--') ? scope[ref] : ref.startsWith('night.') ? extras.night[ref.slice(6)] : ref;
    if (raw === undefined) throw new Error(`unknown color reference "${ref}" (${variant})`);
    const v = raw.match(/^var\((--[\w-]+)\)$/);
    return v ? get(v[1], [...seen, ref]) : parseOklch(raw);
  };
  return get;
}

// Dark brights lift L by 6 and dims drop it by 10; Light mirrors that so brights gain contrast.
function ansiColors(get, spec, variant) {
  const step = variant === 'dark' ? 1 : -1;
  const ansi = { normal: {}, bright: {}, dim: {} };
  for (const slot of SLOTS) {
    ansi.normal[slot] = get(spec[slot]);
    ansi.bright[slot] = spec[`bright_${slot}`] ? get(spec[`bright_${slot}`]) : shift(ansi.normal[slot], 6 * step);
    ansi.dim[slot] = shift(ansi.normal[slot], -10 * step);
  }
  return ansi;
}

// ---------- Contrast gate ----------

const checks = [];

function check(label, fg, bg, min) {
  checks.push({ label, fg, bg, min, ratio: contrast(fg, bg) });
}

function checkAnsi(label, ansi, bg) {
  for (const slot of SLOTS.filter((s) => s !== 'black' && s !== 'white')) {
    check(`${label} ansi.${slot}`, toHex(ansi.normal[slot]), bg, 4.5);
    check(`${label} ansi.bright_${slot}`, toHex(ansi.bright[slot]), bg, 4.5);
  }
  check(`${label} ansi.bright_black`, toHex(ansi.bright.black), bg, 3);
}

// ---------- terminal Targets (Warp, macOS Terminal) ----------

// Dark uses the DS Terminal kit night palette; Light uses the light role tokens.
function terminalColors(get, ansi, variant, label) {
  const dark = variant === 'dark';
  const colors = {
    bg: toHex(get(dark ? 'night.bg' : '--bg-surface')),
    fg: toHex(get(dark ? 'night.fg' : '--text-primary')),
    accent: toHex(get(dark ? 'night.pink' : '--color-pink-700')),
    selection: toHex(get(dark ? 'night.sel' : '--color-pink-100')),
  };
  check(`${label} foreground`, colors.fg, colors.bg, 4.5);
  check(`${label} cursor`, colors.accent, colors.bg, 3);
  checkAnsi(label, ansi, colors.bg);
  return colors;
}

// ---------- Warp ----------

function warpTheme(get, ansi, variant) {
  const dark = variant === 'dark';
  const { bg, fg, accent } = terminalColors(get, ansi, variant, `warp/${variant}`);

  const colors = (set) => SLOTS.map((s) => `    ${s}: '${toHex(set[s])}'`).join('\n');
  return `# Generated by scripts/build.mjs from tokens/ — do not edit by hand.
name: ${NAMES[variant]}
accent: '${accent}'
cursor: '${accent}'
background: '${bg}'
foreground: '${fg}'
details: ${dark ? 'darker' : 'lighter'}
terminal_colors:
  normal:
${colors(ansi.normal)}
  bright:
${colors(ansi.bright)}
`;
}

// ---------- macOS Terminal ----------

// Font keys of the stock "Basic" profile (Terminal.app/Contents/Resources/Initial Settings/Basic.terminal):
// SF Mono Terminal Regular 11pt as an NSKeyedArchiver NSFont archive, so PigRabb looks like the default apart from color.
const BASIC_FONT =
  'YnBsaXN0MDDUAQIDBAUGBwpYJHZlcnNpb25ZJGFyY2hpdmVyVCR0b3BYJG9iamVjdHMSAAGGoF8QD05TS2V5ZWRBcmNoaXZlctEICVRyb290gAGkCwwVFlUkbnVsbNQNDg8QERITFFZOU1NpemVYTlNmRmxhZ3NWTlNOYW1lViRjbGFzcyNAJgAAAAAAABAQgAKAA18QFlNGTW9ub1Rlcm1pbmFsLVJlZ3VsYXLSFxgZGlokY2xhc3NuYW1lWCRjbGFzc2VzVk5TRm9udKIZG1hOU09iamVjdAgRGiQpMjdJTFFTWF5nbnd+hY6QkpStsr3GzdAAAAAAAAABAQAAAAAAAAAcAAAAAAAAAAAAAAAAAAAA2Q==';
const BASIC_FONT_WIDTH_SPACING = 1.004032258064516;

const b64 = (text) => Buffer.from(text, 'utf8').toString('base64');

// An opaque NSColor archived in sRGB (NSCustomColorSpace with NSID 7). The shorter NSRGB form found in
// Apple's own profiles is Generic RGB, which would shift every hex value.
function nsColorArchive(hex) {
  const rgb = [1, 3, 5].map((i) => String(Number((parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(10))));
  const uid = (n) => `<dict><key>CF$UID</key><integer>${n}</integer></dict>`;
  const cls = (name) =>
    `<dict><key>$classes</key><array><string>${name}</string><string>NSObject</string></array><key>$classname</key><string>${name}</string></dict>`;
  const objects = [
    '<string>$null</string>',
    `<dict><key>$class</key>${uid(4)}<key>NSColorSpace</key><integer>1</integer><key>NSComponents</key><data>${b64(`${rgb.join(' ')} 1`)}</data><key>NSCustomColorSpace</key>${uid(2)}</dict>`,
    `<dict><key>$class</key>${uid(3)}<key>NSID</key><integer>7</integer></dict>`,
    cls('NSColorSpace'),
    cls('NSColor'),
  ];
  return b64(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>$archiver</key><string>NSKeyedArchiver</string><key>$objects</key><array>${objects.join('')}</array><key>$top</key><dict><key>root</key>${uid(1)}</dict><key>$version</key><integer>100000</integer></dict></plist>
`);
}

function macosTerminalProfile(get, ansi, variant) {
  const label = `macos-terminal/${variant}`;
  const { bg, fg, accent, selection } = terminalColors(get, ansi, variant, label);
  check(`${label} foreground on selection`, fg, selection, 4.5);

  const colors = { BackgroundColor: bg, TextColor: fg, TextBoldColor: fg, CursorColor: accent, SelectionColor: selection };
  for (const slot of SLOTS) {
    const Slot = slot[0].toUpperCase() + slot.slice(1);
    colors[`ANSI${Slot}Color`] = toHex(ansi.normal[slot]);
    colors[`ANSIBright${Slot}Color`] = toHex(ansi.bright[slot]);
  }
  const colorEntries = Object.keys(colors)
    .sort()
    .map((key) => `\t<key>${key}</key>\n\t<data>${nsColorArchive(colors[key])}</data>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- Generated by scripts/build.mjs from tokens/ — do not edit by hand. -->
<plist version="1.0">
<dict>
${colorEntries.join('\n')}
\t<key>Font</key>
\t<data>${BASIC_FONT}</data>
\t<key>FontAntialias</key>
\t<true/>
\t<key>FontWidthSpacing</key>
\t<real>${BASIC_FONT_WIDTH_SPACING}</real>
\t<key>ProfileCurrentVersion</key>
\t<real>2.09</real>
\t<key>name</key>
\t<string>${NAMES[variant]}</string>
\t<key>type</key>
\t<string>Window Settings</string>
</dict>
</plist>
`;
}

// ---------- Zed ----------

// Every UI key of Zed's official One theme (assets/themes/one/one.json), copied once on 2026-09-16.
// The build refuses to emit a theme with a missing or unknown key.
const ZED_KEYS = ['border', 'border.variant', 'border.focused', 'border.selected', 'border.transparent', 'border.disabled', 'elevated_surface.background', 'surface.background', 'background', 'element.background', 'element.hover', 'element.active', 'element.selected', 'element.disabled', 'drop_target.background', 'ghost_element.background', 'ghost_element.hover', 'ghost_element.active', 'ghost_element.selected', 'ghost_element.disabled', 'text', 'text.muted', 'text.placeholder', 'text.disabled', 'text.accent', 'icon', 'icon.muted', 'icon.disabled', 'icon.placeholder', 'icon.accent', 'status_bar.background', 'title_bar.background', 'title_bar.inactive_background', 'toolbar.background', 'tab_bar.background', 'tab.inactive_background', 'tab.active_background', 'search.match_background', 'search.active_match_background', 'panel.background', 'panel.focused_border', 'pane.focused_border', 'scrollbar.thumb.background', 'scrollbar.thumb.hover_background', 'scrollbar.thumb.border', 'scrollbar.track.background', 'scrollbar.track.border', 'editor.foreground', 'editor.background', 'editor.gutter.background', 'editor.subheader.background', 'editor.active_line.background', 'editor.highlighted_line.background', 'editor.line_number', 'editor.active_line_number', 'editor.hover_line_number', 'editor.invisible', 'editor.wrap_guide', 'editor.active_wrap_guide', 'editor.document_highlight.read_background', 'editor.document_highlight.write_background', 'terminal.background', 'terminal.foreground', 'terminal.bright_foreground', 'terminal.dim_foreground', 'terminal.ansi.black', 'terminal.ansi.bright_black', 'terminal.ansi.dim_black', 'terminal.ansi.red', 'terminal.ansi.bright_red', 'terminal.ansi.dim_red', 'terminal.ansi.green', 'terminal.ansi.bright_green', 'terminal.ansi.dim_green', 'terminal.ansi.yellow', 'terminal.ansi.bright_yellow', 'terminal.ansi.dim_yellow', 'terminal.ansi.blue', 'terminal.ansi.bright_blue', 'terminal.ansi.dim_blue', 'terminal.ansi.magenta', 'terminal.ansi.bright_magenta', 'terminal.ansi.dim_magenta', 'terminal.ansi.cyan', 'terminal.ansi.bright_cyan', 'terminal.ansi.dim_cyan', 'terminal.ansi.white', 'terminal.ansi.bright_white', 'terminal.ansi.dim_white', 'link_text.hover', 'version_control.added', 'version_control.modified', 'version_control.word_added', 'version_control.word_deleted', 'version_control.deleted', 'version_control.conflict_marker.ours', 'version_control.conflict_marker.theirs', 'conflict', 'conflict.background', 'conflict.border', 'created', 'created.background', 'created.border', 'deleted', 'deleted.background', 'deleted.border', 'error', 'error.background', 'error.border', 'hidden', 'hidden.background', 'hidden.border', 'hint', 'hint.background', 'hint.border', 'ignored', 'ignored.background', 'ignored.border', 'info', 'info.background', 'info.border', 'modified', 'modified.background', 'modified.border', 'predictive', 'predictive.background', 'predictive.border', 'renamed', 'renamed.background', 'renamed.border', 'success', 'success.background', 'success.border', 'unreachable', 'unreachable.background', 'unreachable.border', 'warning', 'warning.background', 'warning.border'];

const CLEAR = '#00000000';

function zedTheme(get, ansi, variant) {
  const dark = variant === 'dark';
  const label = `zed/${variant}`;
  const accent = get(dark ? '--color-pink-500' : '--color-pink-700');
  const x = (ref, a = 1) => toHex({ ...(typeof ref === 'string' ? get(ref) : ref), a }, { alpha: true });
  const opaque = (ref) => toHex(get(ref));
  const tone = (name, fg, bg, border) => ({ [name]: x(fg), [`${name}.background`]: x(bg), [`${name}.border`]: x(border) });
  const success = ['--color-success-700', '--color-success-100', '--color-success-500'];
  const warning = ['--color-warning-700', '--color-warning-100', '--color-warning-500'];
  const error = ['--color-error-700', '--color-error-100', '--color-error-500'];
  const quiet = ['--text-tertiary', '--bg-card', '--border-subtle'];

  const ansiKeys = {};
  for (const slot of SLOTS) {
    ansiKeys[`terminal.ansi.${slot}`] = x(ansi.normal[slot]);
    ansiKeys[`terminal.ansi.bright_${slot}`] = x(ansi.bright[slot]);
    ansiKeys[`terminal.ansi.dim_${slot}`] = x(ansi.dim[slot]);
  }

  const ui = {
    border: x('--border-subtle'),
    'border.variant': x('--border-subtle'),
    'border.focused': x(accent),
    'border.selected': x(accent),
    'border.transparent': CLEAR,
    'border.disabled': x('--border-subtle'),
    'elevated_surface.background': x('--bg-elevated'),
    'surface.background': x('--bg-surface'),
    background: x('--bg-page'),
    'element.background': x('--bg-card'),
    'element.hover': x('--border-subtle'),
    'element.active': x('--border-strong'),
    'element.selected': x('--bg-accent'),
    'element.disabled': x('--bg-card'),
    'drop_target.background': x('--color-pink-500', 0.25),
    'ghost_element.background': CLEAR,
    'ghost_element.hover': x('--bg-card'),
    'ghost_element.active': x('--border-subtle'),
    'ghost_element.selected': x('--bg-accent'),
    'ghost_element.disabled': CLEAR,
    text: x('--text-primary'),
    'text.muted': x('--text-secondary'),
    'text.placeholder': x('--text-tertiary'),
    'text.disabled': x('--text-disabled'),
    'text.accent': x('--text-link'),
    icon: x('--text-secondary'),
    'icon.muted': x('--text-tertiary'),
    'icon.disabled': x('--text-disabled'),
    'icon.placeholder': x('--text-tertiary'),
    'icon.accent': x(accent),
    'status_bar.background': x('--bg-page'),
    'title_bar.background': x('--bg-page'),
    'title_bar.inactive_background': x('--bg-page'),
    'toolbar.background': x('--bg-surface'),
    'tab_bar.background': x('--bg-page'),
    'tab.inactive_background': x('--bg-page'),
    'tab.active_background': x('--bg-surface'),
    'search.match_background': x('--color-pink-500', 0.3),
    'search.active_match_background': x('--color-warning-500', 0.45),
    'panel.background': x('--bg-surface'),
    'panel.focused_border': x(accent),
    'pane.focused_border': null,
    'scrollbar.thumb.background': x('--text-tertiary', 0.3),
    'scrollbar.thumb.hover_background': x('--text-tertiary', 0.5),
    'scrollbar.thumb.border': CLEAR,
    'scrollbar.track.background': CLEAR,
    'scrollbar.track.border': CLEAR,
    'editor.foreground': x('--text-primary'),
    'editor.background': x('--bg-surface'),
    'editor.gutter.background': x('--bg-surface'),
    'editor.subheader.background': x('--bg-card'),
    'editor.active_line.background': x('--bg-card', 0.75),
    'editor.highlighted_line.background': x('--bg-accent'),
    'editor.line_number': x('--text-disabled'),
    'editor.active_line_number': x('--text-primary'),
    'editor.hover_line_number': x('--text-secondary'),
    'editor.invisible': x('--border-strong'),
    'editor.wrap_guide': x('--border-subtle'),
    'editor.active_wrap_guide': x('--border-strong'),
    'editor.document_highlight.read_background': x('--color-pink-500', 0.15),
    'editor.document_highlight.write_background': x('--color-cyan-500', 0.2),
    'terminal.background': x('--bg-surface'),
    'terminal.foreground': x('--text-primary'),
    'terminal.bright_foreground': x('--text-primary'),
    'terminal.dim_foreground': x('--text-tertiary'),
    ...ansiKeys,
    'link_text.hover': x('--text-link-hover'),
    'version_control.added': x('--color-success-500'),
    'version_control.modified': x('--color-warning-500'),
    'version_control.word_added': x('--color-success-500', 0.35),
    'version_control.word_deleted': x('--color-error-500', 0.35),
    'version_control.deleted': x('--color-error-500'),
    'version_control.conflict_marker.ours': x('--color-success-500', 0.15),
    'version_control.conflict_marker.theirs': x('--color-violet-500', 0.15),
    ...tone('conflict', ...warning),
    ...tone('created', ...success),
    ...tone('deleted', ...error),
    ...tone('error', ...error),
    ...tone('hidden', ...quiet),
    ...tone('hint', ...quiet),
    ...tone('ignored', '--text-disabled', '--bg-card', '--border-subtle'),
    ...tone('info', '--color-cyan-700', '--color-cyan-100', '--color-cyan-500'),
    ...tone('modified', ...warning),
    ...tone('predictive', ...quiet),
    ...tone('renamed', '--color-violet-500', '--color-violet-100', '--color-violet-500'),
    ...tone('success', ...success),
    ...tone('unreachable', ...quiet),
    ...tone('warning', ...warning),
  };

  const missing = ZED_KEYS.filter((k) => !(k in ui));
  const unknown = Object.keys(ui).filter((k) => !ZED_KEYS.includes(k));
  if (missing.length || unknown.length) {
    throw new Error(`${label} key mismatch — missing: [${missing}] unknown: [${unknown}]`);
  }

  // Syntax colors come from the DS Coding kit (keyword magenta · string success-700 · number warning-700 ·
  // type plum · function rose · comment tertiary italic · attribute pink-700 · punctuation secondary).
  const s = (ref, { italic = false, bold = false } = {}) => ({
    color: x(ref),
    font_style: italic ? 'italic' : null,
    font_weight: bold ? 700 : null,
  });
  const syntax = {
    keyword: s('--color-magenta-500'),
    preproc: s('--color-magenta-500'),
    tag: s('--color-magenta-500'),
    'tag.doctype': s('--color-magenta-500'),
    title: s('--color-magenta-500', { bold: true }),
    'punctuation.special': s('--color-magenta-500'),
    string: s('--color-success-700'),
    'string.special': s('--color-success-700'),
    'string.special.symbol': s('--color-success-700'),
    'text.literal': s('--color-success-700'),
    number: s('--color-warning-700'),
    boolean: s('--color-warning-700'),
    constant: s('--color-warning-700'),
    'constant.builtin': s('--color-warning-700'),
    'string.escape': s('--color-warning-700'),
    'string.regex': s('--color-warning-700'),
    type: s('--color-violet-500'),
    'type.builtin': s('--color-violet-500'),
    enum: s('--color-violet-500'),
    variant: s('--color-violet-500'),
    constructor: s('--color-violet-500'),
    namespace: s('--color-violet-500'),
    selector: s('--color-violet-500'),
    'selector.pseudo': s('--color-violet-500'),
    'emphasis.strong': s('--color-violet-500', { bold: true }),
    function: s('--color-cyan-700'),
    link_text: s('--color-cyan-700'),
    attribute: s('--color-pink-700'),
    property: s('--color-pink-700'),
    label: s('--color-pink-700'),
    comment: s('--text-tertiary', { italic: true }),
    'comment.doc': s('--text-tertiary', { italic: true }),
    hint: s('--text-tertiary'),
    predictive: s('--text-tertiary', { italic: true }),
    punctuation: s('--text-secondary'),
    'punctuation.bracket': s('--text-secondary'),
    'punctuation.delimiter': s('--text-secondary'),
    'punctuation.list_marker': s('--text-secondary'),
    'punctuation.markup': s('--text-secondary'),
    operator: s('--text-secondary'),
    variable: s('--text-primary'),
    'variable.parameter': s('--text-primary'),
    'variable.special': s('--text-primary'),
    embedded: s('--text-primary'),
    primary: s('--text-primary'),
    emphasis: s('--text-primary', { italic: true }),
    link_uri: s('--text-link'),
    'diff.plus': s('--color-success-700'),
    'diff.minus': s('--color-error-700'),
  };

  const editorBg = opaque('--bg-surface');
  for (const ref of ['--text-primary', '--text-secondary', '--text-tertiary', '--text-link']) {
    check(`${label} ${ref}`, opaque(ref), opaque('--bg-page'), 4.5);
    check(`${label} ${ref} on surface`, opaque(ref), editorBg, 4.5);
  }
  check(`${label} cursor`, toHex(accent), editorBg, 3);
  for (const [name, style] of Object.entries(syntax)) {
    const min = ['comment', 'comment.doc', 'hint', 'predictive'].includes(name) ? 3 : 4.5;
    check(`${label} syntax.${name}`, style.color.slice(0, 7), editorBg, min);
  }
  for (const name of ['conflict', 'created', 'deleted', 'error', 'info', 'modified', 'renamed', 'success', 'warning']) {
    check(`${label} ${name}`, ui[name].slice(0, 7), editorBg, 4.5);
  }
  checkAnsi(label, ansi, editorBg);

  const players = [
    accent,
    get('--color-cyan-500'),
    get('--color-violet-500'),
    get('--color-magenta-500'),
    get('--color-success-500'),
    get('--color-warning-500'),
    ansi.normal.blue,
    ansi.normal.cyan,
  ].map((c) => ({ cursor: x(c), background: x(c), selection: x(c, 0.25) }));
  const accents = [accent, '--color-cyan-700', '--color-violet-500', '--color-warning-700', '--color-success-700', ansi.normal.blue, ansi.normal.cyan].map((c) => x(c));

  const style = Object.fromEntries(ZED_KEYS.map((k) => [k, ui[k]]));
  return { name: NAMES[variant], appearance: variant, style: { ...style, accents, players, syntax } };
}

// ---------- main ----------

function build() {
  const tokens = loadTokens();
  const extras = JSON.parse(readFileSync(join(ROOT, 'tokens/extras.json'), 'utf8'));
  const outputs = {};
  const zedThemes = [];
  for (const variant of ['dark', 'light']) {
    const get = palette(tokens, extras, variant);
    const ansi = ansiColors(get, extras.ansi[variant], variant);
    outputs[`warp/pigrabb_${variant}.yaml`] = warpTheme(get, ansi, variant);
    // macOS Terminal names an imported profile after the file, not its `name` key.
    outputs[`macos-terminal/${NAMES[variant]}.terminal`] = macosTerminalProfile(get, ansi, variant);
    zedThemes.push(zedTheme(get, ansi, variant));
  }
  outputs['zed/pigrabb.json'] = `${JSON.stringify(
    {
      $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
      name: 'PigRabb',
      author: 'PigRabb Studio (generated by scripts/build.mjs from tokens/ — do not edit by hand)',
      themes: zedThemes,
    },
    null,
    2,
  )}\n`;

  const failed = checks.filter((c) => c.ratio < c.min);
  for (const c of checks) {
    const mark = c.ratio < c.min ? 'FAIL' : 'ok  ';
    console.log(`${mark} ${c.ratio.toFixed(2).padStart(5)} ≥ ${c.min}  ${c.fg} on ${c.bg}  ${c.label}`);
  }
  console.log(`\nContrast gate: ${checks.length} checks, ${failed.length} failed`);
  if (failed.length) {
    console.error('Nothing written — fix the colors above first.');
    process.exit(1);
  }
  for (const [path, content] of Object.entries(outputs)) {
    writeFileSync(join(ROOT, path), content);
    console.log(`wrote ${path}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
