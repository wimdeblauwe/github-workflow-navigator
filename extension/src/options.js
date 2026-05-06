// ── Auth method toggle ──────────────────────────────────────────────────────

const radios = document.querySelectorAll('input[name="authMethod"]');
const patSection = document.getElementById('pat-section');
const oauthSection = document.getElementById('oauth-section');

function showSection(method) {
  patSection.classList.toggle('active', method === 'pat');
  oauthSection.classList.toggle('active', method === 'oauth');
}

radios.forEach((r) => {
  r.addEventListener('change', () => {
    chrome.storage.local.set({ authMethod: r.value });
    showSection(r.value);
  });
});

chrome.storage.local.get(['authMethod'], (s) => {
  const method = s.authMethod || 'pat';
  document.querySelector(`input[value="${method}"]`).checked = true;
  showSection(method);
});

// ── PAT section ─────────────────────────────────────────────────────────────

const tokenInput = document.getElementById('token');
const patSaveBtn = document.getElementById('pat-save');
const patStatus = document.getElementById('pat-status');

chrome.storage.local.get(['githubToken'], (r) => {
  if (r.githubToken) tokenInput.value = r.githubToken;
});

patSaveBtn.addEventListener('click', () => {
  const value = tokenInput.value.trim();
  chrome.storage.local.set({ githubToken: value }, () => {
    flash(patStatus, value ? 'Saved.' : 'Cleared.', false);
  });
});

// ── OAuth section ────────────────────────────────────────────────────────────

const clientIdInput = document.getElementById('client-id');
const clientIdSaveBtn = document.getElementById('client-id-save');
const clientIdStatus = document.getElementById('client-id-status');
const oauthSignInBtn = document.getElementById('oauth-sign-in');
const oauthSignOutBtn = document.getElementById('oauth-sign-out');
const oauthError = document.getElementById('oauth-error');
const oauthConnected = document.getElementById('oauth-connected');
const oauthDisconnected = document.getElementById('oauth-disconnected');
const oauthAvatar = document.getElementById('oauth-avatar');
const oauthUsername = document.getElementById('oauth-username');
const redirectUrlEl = document.getElementById('redirect-url');
const copyRedirectBtn = document.getElementById('copy-redirect-url');

const redirectUrl = chrome.identity.getRedirectURL();
redirectUrlEl.textContent = redirectUrl;

copyRedirectBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(redirectUrl).then(() => flash(copyRedirectBtn, 'Copied!'));
});

chrome.storage.local.get(['oauthClientId', 'oauthToken', 'oauthUser', 'oauthAvatar'], (r) => {
  if (r.oauthClientId) clientIdInput.value = r.oauthClientId;
  renderOauthState(r.oauthToken, r.oauthUser, r.oauthAvatar);
});

clientIdSaveBtn.addEventListener('click', () => {
  const value = clientIdInput.value.trim();
  chrome.storage.local.set({ oauthClientId: value }, () => {
    flash(clientIdStatus, value ? 'Saved.' : 'Cleared.', false);
  });
});

oauthSignInBtn.addEventListener('click', async () => {
  const clientId = clientIdInput.value.trim();
  if (!clientId) {
    showOauthError('Enter and save a Client ID first.');
    return;
  }
  oauthSignInBtn.disabled = true;
  oauthError.textContent = '';
  try {
    const token = await startOAuthFlow(clientId);
    const { login, avatarUrl } = await fetchGitHubUser(token);
    await chrome.storage.local.set({ oauthToken: token, oauthUser: login, oauthAvatar: avatarUrl });
    renderOauthState(token, login, avatarUrl);
  } catch (e) {
    showOauthError(e.message);
  } finally {
    oauthSignInBtn.disabled = false;
  }
});

oauthSignOutBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['oauthToken', 'oauthUser', 'oauthAvatar'], () => {
    renderOauthState(null, null, null);
  });
});

function renderOauthState(token, user, avatar) {
  const connected = !!token && !!user;
  oauthConnected.style.display = connected ? 'block' : 'none';
  oauthDisconnected.style.display = connected ? 'none' : 'block';
  if (connected) {
    oauthUsername.textContent = `@${user}`;
    oauthAvatar.src = avatar || '';
    oauthAvatar.style.display = avatar ? 'inline' : 'none';
  }
}

function showOauthError(msg) {
  oauthError.textContent = msg;
  setTimeout(() => { oauthError.textContent = ''; }, 5000);
}

// ── OAuth PKCE helpers ────────────────────────────────────────────────────────

function generateCodeVerifier() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function startOAuthFlow(clientId) {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUrl,
    scope: 'repo',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: `https://github.com/login/oauth/authorize?${params}`,
    interactive: true,
  });

  const responseParams = new URL(responseUrl).searchParams;
  if (responseParams.get('state') !== state) throw new Error('State mismatch — possible CSRF.');
  const code = responseParams.get('code');
  if (!code) throw new Error('No authorization code returned.');

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, code, redirect_uri: redirectUrl, code_verifier: verifier }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'Token exchange failed.');
  }
  return tokenData.access_token;
}

async function fetchGitHubUser(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const data = await res.json();
  return { login: data.login, avatarUrl: data.avatar_url };
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function flash(el, msg, isBtn = false) {
  if (isBtn) {
    const orig = el.textContent;
    el.textContent = msg;
    setTimeout(() => { el.textContent = orig; }, 1500);
  } else {
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 2000);
  }
}
