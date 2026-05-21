const OCTICONS = {
  sync: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"/></svg>',
  gear: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z"/></svg>',
  'chevron-up': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3.22 10.53a.749.749 0 0 1 0-1.06l4.25-4.25a.749.749 0 0 1 1.06 0l4.25 4.25a.749.749 0 1 1-1.06 1.06L8 6.811 4.28 10.53a.749.749 0 0 1-1.06 0Z"/></svg>',
  'chevron-down': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"/></svg>',
  'chevron-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"/></svg>',
};

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
      <button class="wn-icon-btn" data-act="refresh" title="Refresh">${OCTICONS.sync}</button>
      <button class="wn-icon-btn" data-act="settings" title="Settings">${OCTICONS.gear}</button>
      <button class="wn-icon-btn" data-act="collapse" title="Minimize">${OCTICONS['chevron-up']}</button>
    </div>
    <div class="wn-search">
      <input type="search" placeholder="Search workflows…" autocomplete="off" spellcheck="false" />
    </div>
    <div class="wn-body"></div>
  `;
  const body = root.querySelector('.wn-body');
  const searchInput = root.querySelector('.wn-search input');

  let lastData = null;
  let query = '';

  root.querySelector('[data-act="refresh"]').addEventListener('click', () => onRefresh && onRefresh());
  root.querySelector('[data-act="settings"]').addEventListener('click', () => onOpenSettings && onOpenSettings());
  const collapseBtn = root.querySelector('[data-act="collapse"]');
  collapseBtn.addEventListener('click', () => {
    const collapsed = root.classList.toggle('wn-collapsed');
    collapseBtn.innerHTML = collapsed ? OCTICONS['chevron-down'] : OCTICONS['chevron-up'];
    collapseBtn.title = collapsed ? 'Restore' : 'Minimize';
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

    const raw = data.raw || [];

    // No-patterns mode: show everything as a plain flat list.
    if (raw.length > 0) {
      const visibleRaw = query ? raw.filter((w) => itemMatches(w, query)) : raw;
      const helpers = query ? data.helpers.filter((w) => itemMatches(w, query)) : data.helpers;
      const showHelpersSection = helpers.length > 0;
      if (visibleRaw.length === 0 && !showHelpersSection) {
        showEmpty(query ? `No workflows match “${query}”.` : 'No workflows found.');
        return;
      }
      if (visibleRaw.length > 0) body.appendChild(renderFlatSection(null, visibleRaw, owner, repo));
      if (showHelpersSection) body.appendChild(renderFlatSection(`Helpers (${helpers.length})`, helpers, owner, repo, { collapsible: true, defaultOpen: !!query }));
      return;
    }

    const apps = query ? data.apps.filter((w) => itemMatches(w, query)) : data.apps;
    const helpers = query ? data.helpers.filter((w) => itemMatches(w, query)) : data.helpers;
    const unrecognized = query ? data.unrecognized.filter((w) => itemMatches(w, query)) : data.unrecognized;

    const showHelpersSection = helpers.length > 0;
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
      body.appendChild(renderFlatSection(`Helpers (${helpers.length})`, helpers, owner, repo, { collapsible: true, defaultOpen: !!query }));
    }
    if (showUnrecSection) {
      body.appendChild(renderFlatSection(`Unrecognized (${unrecognized.length})`, unrecognized, owner, repo, { collapsible: true, defaultOpen: !!query }));
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
  toggle.innerHTML = expandAll ? OCTICONS['chevron-down'] : OCTICONS['chevron-right'];

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
    toggle.innerHTML = open ? OCTICONS['chevron-right'] : OCTICONS['chevron-down'];
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
  badge.className = `wn-type wn-color-${leaf.color || 'blue'}`;
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

function renderFlatSection(title, items, owner, repo, { collapsible = false, defaultOpen = true } = {}) {
  const wrap = document.createElement('div');

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

  if (title) {
    wrap.className = 'wn-section';
    const h = document.createElement('div');
    h.className = 'wn-section-title';

    if (collapsible) {
      h.classList.add('wn-collapsible');
      const toggle = document.createElement('span');
      toggle.className = 'wn-toggle';
      toggle.innerHTML = defaultOpen ? OCTICONS['chevron-down'] : OCTICONS['chevron-right'];
      const label = document.createElement('span');
      label.textContent = title;
      h.append(toggle, label);

      const childWrap = document.createElement('div');
      childWrap.className = 'wn-children';
      childWrap.style.display = defaultOpen ? 'block' : 'none';
      childWrap.appendChild(ul);

      h.addEventListener('click', () => {
        const open = childWrap.style.display !== 'none';
        childWrap.style.display = open ? 'none' : 'block';
        toggle.innerHTML = open ? OCTICONS['chevron-right'] : OCTICONS['chevron-down'];
      });

      wrap.append(h, childWrap);
      return wrap;
    }

    h.textContent = title;
    wrap.appendChild(h);
  }

  wrap.appendChild(ul);
  return wrap;
}
