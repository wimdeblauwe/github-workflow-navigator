(function () {
  let currentKey = null;
  let currentPanel = null;

  function handleNavigation() {
    const repoInfo = parseRepoFromUrl();
    const newKey = repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : null;

    if (!repoInfo) {
      teardown();
      return;
    }

    if (currentKey === newKey) return;

    teardown();
    currentKey = newKey;
    currentPanel = createPanel({
      onRefresh: () => loadInto(currentPanel, repoInfo.owner, repoInfo.repo, true),
      onOpenSettings: () => chrome.runtime.sendMessage({ type: 'open-options' }),
    });
    document.body.appendChild(currentPanel.root);
    currentPanel.applyStoredPosition();
    loadInto(currentPanel, repoInfo.owner, repoInfo.repo);
  }

  function teardown() {
    if (currentPanel) {
      currentPanel.root.remove();
      currentPanel = null;
    }
    currentKey = null;
  }

  async function loadInto(panel, owner, repo, force = false) {
    panel.showLoading();
    const token = await getToken();
    if (!token) {
      panel.showError('No GitHub token configured. Click the gear icon to add one.');
      return;
    }
    try {
      let workflows = force ? null : await getCachedWorkflows(owner, repo);
      if (!workflows) {
        workflows = await fetchAllWorkflows(owner, repo, token);
        await setCachedWorkflows(owner, repo, workflows);
      }
      const config = await getConfig();
      const parsed = workflows.map((w) => {
        const p = parseFilename(filenameFromPath(w.path), config);
        p.githubName = w.name;
        p.state = w.state;
        p.id = w.id;
        return p;
      });

      const visConfig = await getVisibilityConfig();
      if (!shouldShowPanel(visConfig, owner, repo, parsed)) {
        panel.root.remove();
        return;
      }

      if (!document.body.contains(panel.root)) {
        document.body.appendChild(panel.root);
        panel.applyStoredPosition();
      }

      panel.renderTree({
        owner, repo,
        apps:         parsed.filter((p) => p.kind === 'app'),
        helpers:      parsed.filter((p) => p.kind === 'helper'),
        unrecognized: parsed.filter((p) => p.kind === 'unrecognized'),
        raw:          parsed.filter((p) => p.kind === 'raw'),
      });
    } catch (e) {
      panel.showError(`Failed to load workflows: ${e.message}`);
    }
  }

  function parseRepoFromUrl() {
    const m = location.pathname.match(/^\/([^/]+)\/([^/]+)\/actions/);
    if (!m) return null;
    return { owner: m[1], repo: m[2] };
  }

  function getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authMethod', 'githubToken', 'oauthToken'], (r) => {
        const method = r.authMethod || 'pat';
        resolve(method === 'oauth' ? (r.oauthToken || null) : (r.githubToken || null));
      });
    });
  }

  function getConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['separator', 'patterns'], (r) => {
        resolve({
          separator: r.separator !== undefined ? r.separator : DEFAULT_SEPARATOR,
          patterns:  r.patterns  !== undefined ? r.patterns  : DEFAULT_PATTERNS,
        });
      });
    });
  }

  function getVisibilityConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['panelAutoDetect', 'panelMinCount', 'panelMode', 'panelRepoList'], (r) => {
        resolve({
          autoDetect: r.panelAutoDetect !== undefined ? r.panelAutoDetect : true,
          minCount:   r.panelMinCount   !== undefined ? r.panelMinCount   : 0,
          mode:       r.panelMode       || 'all',
          repoList:   r.panelRepoList   || [],
        });
      });
    });
  }

  function shouldShowPanel(visConfig, owner, repo, parsed) {
    const slug       = `${owner}/${repo}`;
    const appCount   = parsed.filter((p) => p.kind === 'app').length;
    const totalCount = parsed.length;
    const isRawMode  = parsed.some((p) => p.kind === 'raw');

    if (visConfig.mode === 'allowlist' && !visConfig.repoList.includes(slug)) return false;
    if (visConfig.mode === 'blocklist' &&  visConfig.repoList.includes(slug)) return false;

    // Auto-detect: skip when patterns are empty (raw mode) — user intentionally disabled patterns
    if (visConfig.autoDetect && !isRawMode && appCount === 0) return false;

    if (visConfig.minCount > 0) {
      const count = (visConfig.autoDetect && !isRawMode) ? appCount : totalCount;
      if (count < visConfig.minCount) return false;
    }

    return true;
  }

  handleNavigation();
  document.addEventListener('turbo:load', handleNavigation);
})();
