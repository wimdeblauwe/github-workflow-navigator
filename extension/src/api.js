async function fetchAllWorkflows(owner, repo, token) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows?per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const workflows = data.workflows || [];
    out.push(...workflows);
    if (workflows.length < 100) break;
  }
  return out;
}

function filenameFromPath(path) {
  return path.replace(/^.*\//, '');
}
