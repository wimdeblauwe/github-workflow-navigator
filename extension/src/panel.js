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
      <button class="wn-icon-btn" data-act="collapse" title="Minimize">⊟</button>
    </div>
    <div class="wn-search">
      <input type="search" placeholder="Search workflows…" autocomplete="off" spellcheck="false" />
    </div>
    <div class="wn-body"></div>
    <div class="wn-footer">
      <label><input type="checkbox" data-act="show-helpers" /> Show helpers</label>
    </div>
  `;
  const body = root.querySelector('.wn-body');
  const helperToggle = root.querySelector('[data-act="show-helpers"]');
  const searchInput = root.querySelector('.wn-search input');

  let lastData = null;
  let showHelpers = false;
  let query = '';

  root.querySelector('[data-act="refresh"]').addEventListener('click', () => onRefresh && onRefresh());
  root.querySelector('[data-act="settings"]').addEventListener('click', () => onOpenSettings && onOpenSettings());
  const collapseBtn = root.querySelector('[data-act="collapse"]');
  collapseBtn.addEventListener('click', () => {
    const collapsed = root.classList.toggle('wn-collapsed');
    collapseBtn.textContent = collapsed ? '⊞' : '⊟';
    collapseBtn.title = collapsed ? 'Restore' : 'Minimize';
  });
  helperToggle.addEventListener('change', () => {
    showHelpers = helperToggle.checked;
    if (lastData) renderTree(lastData);
  });
  searchInput.addEventListener('input', () => {
    query = searchInput.value.trim().toLowerCase();
    if (lastData) renderTree(lastData);
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      query = '';
      if (lastData) renderTree(lastData);
    }
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
    const { owner, repo } = data;

    const apps = query ? data.apps.filter((w) => itemMatches(w, query)) : data.apps;
    const helpers = query ? data.helpers.filter((w) => itemMatches(w, query)) : data.helpers;
    const unrecognized = query ? data.unrecognized.filter((w) => itemMatches(w, query)) : data.unrecognized;

    const showHelpersSection = showHelpers && helpers.length > 0;
    const showUnrecSection = unrecognized.length > 0;

    if (apps.length === 0 && !showHelpersSection && !showUnrecSection) {
      showEmpty(query ? `No workflows match “${query}”.` : 'No workflows found.');
      return;
    }

    if (apps.length > 0) {
      const tree = buildTree(apps);
      body.appendChild(renderNode(tree, owner, repo, !!query));
    }
    if (showHelpersSection) {
      body.appendChild(renderFlatSection(`Helpers (${helpers.length})`, helpers, owner, repo));
    }
    if (showUnrecSection) {
      body.appendChild(renderFlatSection(`Unrecognized (${unrecognized.length})`, unrecognized, owner, repo));
    }
  }

  return { root, showLoading, showError, renderTree };
}

function itemMatches(item, query) {
  return (item.filename || '').toLowerCase().includes(query)
      || (item.githubName || '').toLowerCase().includes(query);
}

function renderNode(node, owner, repo, expandAll) {
  const ul = document.createElement('ul');
  ul.className = 'wn-tree';

  const sortedKeys = [...node.children.keys()].sort();
  for (const seg of sortedKeys) {
    ul.appendChild(renderFolder(seg, node.children.get(seg), owner, repo, expandAll));
  }
  for (const leaf of node.leaves) {
    ul.appendChild(renderLeaf(leaf, owner, repo));
  }
  return ul;
}

function renderFolder(name, node, owner, repo, expandAll) {
  const li = document.createElement('li');
  li.className = 'wn-node wn-folder';

  const header = document.createElement('div');
  header.className = 'wn-row wn-row-folder';

  const toggle = document.createElement('span');
  toggle.className = 'wn-toggle';
  toggle.textContent = expandAll ? '▾' : '▸';

  const label = document.createElement('span');
  label.className = 'wn-name';
  label.textContent = name;

  const count = document.createElement('span');
  count.className = 'wn-count';
  count.textContent = String(countLeaves(node));

  header.append(toggle, label, count);

  const childWrap = document.createElement('div');
  childWrap.className = 'wn-children';
  childWrap.style.display = expandAll ? 'block' : 'none';
  childWrap.appendChild(renderNode(node, owner, repo, expandAll));

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
