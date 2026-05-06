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
      panel.showError('No GitHub token configured. Click ⚙ to add one.');
      return;
    }
    try {
      let workflows = force ? null : await getCachedWorkflows(owner, repo);
      if (!workflows) {
        workflows = await fetchAllWorkflows(owner, repo, token);
        await setCachedWorkflows(owner, repo, workflows);
      }
      const parsed = workflows.map((w) => {
        const p = parseFilename(filenameFromPath(w.path));
        p.githubName = w.name;
        p.state = w.state;
        p.id = w.id;
        return p;
      });
      panel.renderTree({
        owner, repo,
        apps: parsed.filter((p) => p.kind === 'app'),
        helpers: parsed.filter((p) => p.kind === 'helper'),
        unrecognized: parsed.filter((p) => p.kind === 'unrecognized'),
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
      chrome.storage.local.get(['githubToken'], (r) => resolve(r.githubToken || null));
    });
  }

  handleNavigation();
  document.addEventListener('turbo:load', handleNavigation);
})();
