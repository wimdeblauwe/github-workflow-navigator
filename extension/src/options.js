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
const deviceFlowEl = document.getElementById('device-flow');
const deviceUserCodeEl = document.getElementById('device-user-code');
const openGithubDeviceBtn = document.getElementById('open-github-device');
const cancelDeviceFlowBtn = document.getElementById('cancel-device-flow');

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

// ── OAuth Device Flow ─────────────────────────────────────────────────────────

async function startOAuthFlow(clientId) {
  const codeRes = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, scope: 'repo' }),
  });
  if (!codeRes.ok) throw new Error(`Device code request failed (${codeRes.status}).`);
  const codeData = await codeRes.json();
  if (codeData.error) throw new Error(codeData.error_description || codeData.error);

  const { device_code, user_code, verification_uri, expires_in, interval } = codeData;

  deviceUserCodeEl.textContent = user_code;
  openGithubDeviceBtn.onclick = () => window.open(verification_uri, '_blank');
  deviceFlowEl.style.display = 'block';
  window.open(verification_uri, '_blank');

  return pollForToken(clientId, device_code, interval || 5, expires_in || 900);
}

function pollForToken(clientId, deviceCode, initialInterval, expiresIn) {
  let pollInterval = initialInterval;
  const deadline = Date.now() + expiresIn * 1000;

  return new Promise((resolve, reject) => {
    let cancelled = false;
    let timeoutId = null;

    cancelDeviceFlowBtn.onclick = () => {
      cancelled = true;
      clearTimeout(timeoutId);
      deviceFlowEl.style.display = 'none';
      reject(new Error('Authorization cancelled.'));
    };

    async function poll() {
      if (cancelled) return;
      if (Date.now() > deadline) {
        deviceFlowEl.style.display = 'none';
        reject(new Error('Authorization expired. Please try again.'));
        return;
      }

      try {
        const res = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        });
        const data = await res.json();

        if (data.access_token) {
          deviceFlowEl.style.display = 'none';
          resolve(data.access_token);
          return;
        }

        if (data.error === 'slow_down') pollInterval += 5;

        if (data.error === 'authorization_pending' || data.error === 'slow_down') {
          timeoutId = setTimeout(poll, pollInterval * 1000);
          return;
        }

        deviceFlowEl.style.display = 'none';
        reject(new Error(data.error_description || data.error || 'Authorization failed.'));
      } catch {
        if (!cancelled) timeoutId = setTimeout(poll, pollInterval * 1000);
      }
    }

    timeoutId = setTimeout(poll, pollInterval * 1000);
  });
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
