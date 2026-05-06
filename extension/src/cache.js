const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_KEY = 'workflowCache';

function getCachedWorkflows(owner, repo) {
  return new Promise((resolve) => {
    chrome.storage.local.get([CACHE_KEY], (result) => {
      const entry = (result[CACHE_KEY] || {})[`${owner}/${repo}`];
      if (entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
        resolve(entry.workflows);
      } else {
        resolve(null);
      }
    });
  });
}

function setCachedWorkflows(owner, repo, workflows) {
  return new Promise((resolve) => {
    chrome.storage.local.get([CACHE_KEY], (result) => {
      const cache = result[CACHE_KEY] || {};
      cache[`${owner}/${repo}`] = { fetchedAt: Date.now(), workflows };
      chrome.storage.local.set({ [CACHE_KEY]: cache }, resolve);
    });
  });
}
