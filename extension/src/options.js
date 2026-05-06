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

// ── Parsing section ───────────────────────────────────────────────────────────

const OPT_DEFAULT_SEPARATOR = '_';
const OPT_DEFAULT_PATTERNS = [
  { suffix: '_ci-release',          label: 'release',          color: 'green'  },
  { suffix: '_ci-release-snapshot', label: 'release-snapshot', color: 'yellow' },
  { suffix: '_ci-test',             label: 'test',             color: 'blue'   },
  { suffix: '_ci-sonar-qube',       label: 'sonar-qube',       color: 'purple' },
  { suffix: '_cd',                  label: 'cd',               color: 'orange' },
];

const COLOR_OPTIONS = [
  { id: 'blue',   bg: '#ddf4ff' },
  { id: 'green',  bg: '#dafbe1' },
  { id: 'yellow', bg: '#fff8c5' },
  { id: 'purple', bg: '#fbefff' },
  { id: 'orange', bg: '#ffe9cc' },
  { id: 'red',    bg: '#ffebe9' },
  { id: 'gray',   bg: '#eaeef2' },
];

const separatorInput   = document.getElementById('separator');
const separatorSaveBtn = document.getElementById('separator-save');
const separatorStatus  = document.getElementById('separator-status');
const patternsListEl   = document.getElementById('patterns-list');
const addPatternBtn    = document.getElementById('add-pattern');
const resetPatternsBtn = document.getElementById('reset-patterns');
const patternsSaveBtn  = document.getElementById('patterns-save');
const patternsStatus   = document.getElementById('patterns-status');

let patterns = [];

chrome.storage.local.get(['separator', 'patterns'], (r) => {
  separatorInput.value = r.separator !== undefined ? r.separator : OPT_DEFAULT_SEPARATOR;
  patterns = r.patterns !== undefined
    ? r.patterns.map((p) => ({ ...p }))
    : OPT_DEFAULT_PATTERNS.map((p) => ({ ...p }));
  renderPatternsList();
});

separatorSaveBtn.addEventListener('click', () => {
  chrome.storage.local.set({ separator: separatorInput.value }, () => {
    flash(separatorStatus, 'Saved.', false);
  });
});

addPatternBtn.addEventListener('click', () => {
  collectPatterns();
  patterns.push({ suffix: '', label: '' });
  renderPatternsList();
  const rows = patternsListEl.querySelectorAll('.pattern-row');
  rows[rows.length - 1]?.querySelector('input')?.focus();
});

resetPatternsBtn.addEventListener('click', () => {
  patterns = OPT_DEFAULT_PATTERNS.map((p) => ({ ...p }));
  renderPatternsList();
});

patternsSaveBtn.addEventListener('click', () => {
  collectPatterns();
  chrome.storage.local.set({ patterns }, () => {
    flash(patternsStatus, 'Saved.', false);
  });
});

function collectPatterns() {
  patterns = [];
  patternsListEl.querySelectorAll('.pattern-row').forEach((row) => {
    const suffix = row.querySelector('.pattern-input-suffix').value;
    const label  = row.querySelector('.pattern-input-label').value;
    const color  = row.querySelector('.color-swatch.selected')?.dataset.color || 'blue';
    if (suffix || label) patterns.push({ suffix, label, color });
  });
}

function createColorPicker(selectedColor) {
  const picker = document.createElement('div');
  picker.className = 'color-picker';
  COLOR_OPTIONS.forEach(({ id, bg }) => {
    const swatch = document.createElement('span');
    swatch.className = 'color-swatch' + (id === (selectedColor || 'blue') ? ' selected' : '');
    swatch.dataset.color = id;
    swatch.style.background = bg;
    swatch.title = id;
    swatch.addEventListener('click', () => {
      picker.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('selected'));
      swatch.classList.add('selected');
    });
    picker.appendChild(swatch);
  });
  return picker;
}

function renderPatternsList() {
  patternsListEl.innerHTML = '';
  patterns.forEach((p, i) => patternsListEl.appendChild(createPatternRow(p, i)));
}

function createPatternRow(p, i) {
  const row = document.createElement('div');
  row.className = 'pattern-row';

  const suffixInput = document.createElement('input');
  suffixInput.type = 'text';
  suffixInput.className = 'mono pattern-input-suffix col-suffix';
  suffixInput.placeholder = '_ci-test';
  suffixInput.value = p.suffix;

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'pattern-input-label col-label';
  labelInput.placeholder = 'test';
  labelInput.value = p.label;

  const colorPicker = createColorPicker(p.color);

  const actions = document.createElement('div');
  actions.className = 'col-actions';

  const upBtn = document.createElement('button');
  upBtn.className = 'secondary icon-btn';
  upBtn.textContent = '↑';
  upBtn.title = 'Move up';
  upBtn.disabled = i === 0;
  upBtn.addEventListener('click', () => {
    collectPatterns();
    [patterns[i - 1], patterns[i]] = [patterns[i], patterns[i - 1]];
    renderPatternsList();
  });

  const downBtn = document.createElement('button');
  downBtn.className = 'secondary icon-btn';
  downBtn.textContent = '↓';
  downBtn.title = 'Move down';
  downBtn.disabled = i === patterns.length - 1;
  downBtn.addEventListener('click', () => {
    collectPatterns();
    [patterns[i], patterns[i + 1]] = [patterns[i + 1], patterns[i]];
    renderPatternsList();
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'secondary icon-btn';
  removeBtn.textContent = '×';
  removeBtn.title = 'Remove';
  removeBtn.addEventListener('click', () => {
    collectPatterns();
    patterns.splice(i, 1);
    renderPatternsList();
  });

  actions.append(upBtn, downBtn, removeBtn);
  row.append(suffixInput, labelInput, colorPicker, actions);
  return row;
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
