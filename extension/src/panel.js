function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function workflowUrl(owner, repo, filename) {
  return `https://github.com/${owner}/${repo}/actions/workflows/${filename}`;
}

function createPanel({ onRefresh, onOpenSettings }) {
  const root = document.createElement('div');
  root.id = 'workflow-navigator-panel';
  root.innerHTML = `
    <div class="wn-header">
      <div class="wn-title">Workflows</div>
      <button class="wn-icon-btn" data-act="refresh" title="Refresh">↻</button>
      <button class="wn-icon-btn" data-act="settings" title="Settings">⚙</button>
      <button class="wn-icon-btn" data-act="collapse" title="Collapse">×</button>
    </div>
    <div class="wn-search">
      <input type="search" placeholder="Search (coming soon)" disabled />
    </div>
    <div class="wn-body"></div>
    <div class="wn-footer">
      <label><input type="checkbox" data-act="show-helpers" /> Show helpers</label>
    </div>
  `;
  const body = root.querySelector('.wn-body');
  const helperToggle = root.querySelector('[data-act="show-helpers"]');

  let lastData = null;
  let showHelpers = false;

  root.querySelector('[data-act="refresh"]').addEventListener('click', () => onRefresh && onRefresh());
  root.querySelector('[data-act="settings"]').addEventListener('click', () => onOpenSettings && onOpenSettings());
  root.querySelector('[data-act="collapse"]').addEventListener('click', () => {
    root.classList.toggle('wn-collapsed');
  });
  helperToggle.addEventListener('change', () => {
    showHelpers = helperToggle.checked;
    if (lastData) renderTree(lastData);
  });

  function showLoading() {
    body.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'wn-status';
    div.textContent = 'Loading…';
    body.appendChild(div);
  }

  function showError(msg) {
    body.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'wn-status wn-error';
    div.textContent = msg;
    body.appendChild(div);
  }

  function showEmpty(msg) {
    body.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'wn-status';
    div.textContent = msg;
    body.appendChild(div);
  }

  function renderTree(data) {
    lastData = data;
    body.innerHTML = '';
    const { tree, owner, repo, helpers, unrecognized } = data;

    if (tree.children.size === 0 && tree.leaves.length === 0
        && helpers.length === 0 && unrecognized.length === 0) {
      showEmpty('No workflows found.');
      return;
    }

    body.appendChild(renderNode(tree, owner, repo, true));

    if (showHelpers && helpers.length) {
      body.appendChild(renderFlatSection(`Helpers (${helpers.length})`, helpers, owner, repo));
    }
    if (unrecognized.length) {
      body.appendChild(renderFlatSection(`Unrecognized (${unrecognized.length})`, unrecognized, owner, repo));
    }
  }

  return { root, showLoading, showError, renderTree };
}

function renderNode(node, owner, repo, isRoot) {
  const ul = document.createElement('ul');
  ul.className = 'wn-tree';

  const sortedKeys = [...node.children.keys()].sort();
  for (const seg of sortedKeys) {
    const child = node.children.get(seg);
    ul.appendChild(renderFolder(seg, child, owner, repo));
  }
  for (const leaf of node.leaves) {
    ul.appendChild(renderLeaf(leaf, owner, repo));
  }
  return ul;
}

function renderFolder(name, node, owner, repo) {
  const li = document.createElement('li');
  li.className = 'wn-node wn-folder';

  const header = document.createElement('div');
  header.className = 'wn-row wn-row-folder';

  const toggle = document.createElement('span');
  toggle.className = 'wn-toggle';
  toggle.textContent = '▸';

  const label = document.createElement('span');
  label.className = 'wn-name';
  label.textContent = name;

  const count = document.createElement('span');
  count.className = 'wn-count';
  count.textContent = String(countLeaves(node));

  header.append(toggle, label, count);

  const childWrap = document.createElement('div');
  childWrap.className = 'wn-children';
  childWrap.style.display = 'none';
  childWrap.appendChild(renderNode(node, owner, repo, false));

  header.addEventListener('click', () => {
    const open = childWrap.style.display !== 'none';
    childWrap.style.display = open ? 'none' : 'block';
    toggle.textContent = open ? '▸' : '▾';
  });

  li.append(header, childWrap);
  return li;
}

function renderLeaf(leaf, owner, repo) {
  const li = document.createElement('li');
  li.className = 'wn-node wn-leaf';

  const a = document.createElement('a');
  a.href = workflowUrl(owner, repo, leaf.filename);
  a.className = 'wn-row wn-row-leaf';

  const badge = document.createElement('span');
  badge.className = `wn-type wn-cat-${leaf.category} wn-type-${leaf.type}`;
  badge.textContent = leaf.type;
  a.appendChild(badge);

  if (leaf.githubName) {
    const name = document.createElement('span');
    name.className = 'wn-leaf-name';
    name.textContent = leaf.githubName;
    a.appendChild(name);
  }

  li.appendChild(a);
  return li;
}

function renderFlatSection(title, items, owner, repo) {
  const wrap = document.createElement('div');
  wrap.className = 'wn-section';

  const h = document.createElement('div');
  h.className = 'wn-section-title';
  h.textContent = title;
  wrap.appendChild(h);

  const ul = document.createElement('ul');
  ul.className = 'wn-tree';
  items.sort((a, b) => a.filename.localeCompare(b.filename));
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'wn-node wn-leaf';
    const a = document.createElement('a');
    a.href = workflowUrl(owner, repo, item.filename);
    a.className = 'wn-row wn-row-leaf wn-row-flat';
    a.textContent = item.filename;
    li.appendChild(a);
    ul.appendChild(li);
  }
  wrap.appendChild(ul);
  return wrap;
}
