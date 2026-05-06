// Workflow filename parsing per specs/conventions.md.
// Exposes parseFilename, buildTree, countLeaves, DEFAULT_SEPARATOR, DEFAULT_PATTERNS.

const DEFAULT_SEPARATOR = '_';

const DEFAULT_PATTERNS = [
  { suffix: '_ci-release',          label: 'release',          color: 'green'  },
  { suffix: '_ci-release-snapshot', label: 'release-snapshot', color: 'yellow' },
  { suffix: '_ci-test',             label: 'test',             color: 'blue'   },
  { suffix: '_ci-sonar-qube',       label: 'sonar-qube',       color: 'purple' },
  { suffix: '_cd',                  label: 'cd',               color: 'orange' },
];

function parseFilename(filename, config) {
  const sep      = (config && config.separator !== undefined) ? config.separator : DEFAULT_SEPARATOR;
  const patterns = (config && config.patterns  !== undefined) ? config.patterns  : DEFAULT_PATTERNS;

  const m = filename.match(/^(.*)\.(ya?ml)$/);
  if (!m) return { kind: 'unrecognized', filename };
  const base = m[1];

  if (base.startsWith('_')) return { kind: 'helper', filename };

  if (patterns.length === 0) return { kind: 'raw', filename };

  const sorted = patterns
    .map((p, i) => ({ ...p, originalIndex: i }))
    .sort((a, b) => (b.suffix || '').length - (a.suffix || '').length);

  for (let i = 0; i < sorted.length; i++) {
    const { suffix, label } = sorted[i];
    if (!suffix) continue;

    let appPart, variant;

    if (base.endsWith(suffix)) {
      appPart = base.slice(0, -suffix.length);
      variant = '';
    } else {
      // Prefix match: suffix followed by a '-variant' (e.g. '_ci' matches '_ci-test').
      const idx = base.lastIndexOf(suffix);
      if (idx > 0 && base[idx + suffix.length] === '-') {
        appPart = base.slice(0, idx);
        variant = base.slice(idx + suffix.length);
      } else {
        continue;
      }
    }

    const segments = sep ? appPart.split(sep).filter(Boolean) : [appPart];
    if (segments.length === 0) return { kind: 'unrecognized', filename };
    return { kind: 'app', filename, segments, type: label, color: sorted[i].color || 'blue', patternIndex: sorted[i].originalIndex };
  }

  return { kind: 'unrecognized', filename };
}

function buildTree(appWorkflows) {
  const root = { children: new Map(), leaves: [] };
  for (const wf of appWorkflows) {
    let node = root;
    for (const seg of wf.segments) {
      if (!node.children.has(seg)) {
        node.children.set(seg, { children: new Map(), leaves: [] });
      }
      node = node.children.get(seg);
    }
    node.leaves.push(wf);
  }
  sortTree(root);
  return root;
}

function sortTree(node) {
  node.leaves.sort(compareLeaves);
  for (const child of node.children.values()) sortTree(child);
}

function compareLeaves(a, b) {
  return (a.patternIndex ?? 999) - (b.patternIndex ?? 999);
}

function countLeaves(node) {
  let n = node.leaves.length;
  for (const c of node.children.values()) n += countLeaves(c);
  return n;
}
