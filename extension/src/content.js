(function () {
  if (document.getElementById('workflow-navigator-panel')) return;

  const repoInfo = parseRepoFromUrl();
  if (!repoInfo) return;

  const panel = createPanel({
    onRefresh: () => load(repoInfo.owner, repoInfo.repo),
    onOpenSettings: () => chrome.runtime.sendMessage({ type: 'open-options' }),
  });
  document.body.appendChild(panel.root);

  load(repoInfo.owner, repoInfo.repo);

  async function load(owner, repo) {
    panel.showLoading();
    const token = await getToken();
    if (!token) {
      panel.showError('No GitHub token configured. Click ⚙ to add one.');
      return;
    }
    try {
      const workflows = await fetchAllWorkflows(owner, repo, token);
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
})();
