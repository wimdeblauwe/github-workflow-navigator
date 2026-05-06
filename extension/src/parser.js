// Workflow filename parsing per specs/conventions.md.
// Exposes parseFilename, buildTree, countLeaves on the content-script global scope.

const CI_VARIANTS = [
  { suffix: '_ci-release-snapshot', type: 'release-snapshot' },
  { suffix: '_ci-sonar-qube',       type: 'sonar-qube' },
  { suffix: '_ci-release',          type: 'release' },
  { suffix: '_ci-test',             type: 'test' },
];

const CD_REGEX = /^(.+)_cd(-[\w-]+)?$/;

const CI_TYPE_ORDER = {
  release: 0,
  'release-snapshot': 1,
  test: 2,
  'sonar-qube': 3,
};

function parseFilename(filename) {
  const m = filename.match(/^(.*)\.(ya?ml)$/);
  if (!m) return { kind: 'unrecognized', filename };
  const base = m[1];

  if (base.startsWith('_')) {
    return { kind: 'helper', filename };
  }

  for (const { suffix, type } of CI_VARIANTS) {
    if (base.endsWith(suffix)) {
      const appPart = base.slice(0, -suffix.length);
      const segments = appPart.split('_').filter(Boolean);
      if (segments.length === 0) return { kind: 'unrecognized', filename };
      return { kind: 'app', filename, segments, category: 'ci', type };
    }
  }

  const cd = base.match(CD_REGEX);
  if (cd) {
    const segments = cd[1].split('_').filter(Boolean);
    if (segments.length > 0) {
      return { kind: 'app', filename, segments, category: 'cd', type: 'cd' + (cd[2] || '') };
    }
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
  const catRank = { ci: 0, cd: 1 };
  const ra = catRank[a.category] ?? 2;
  const rb = catRank[b.category] ?? 2;
  if (ra !== rb) return ra - rb;
  if (a.category === 'ci') {
    return (CI_TYPE_ORDER[a.type] ?? 99) - (CI_TYPE_ORDER[b.type] ?? 99);
  }
  return a.type.localeCompare(b.type);
}

function countLeaves(node) {
  let n = node.leaves.length;
  for (const c of node.children.values()) n += countLeaves(c);
  return n;
}
