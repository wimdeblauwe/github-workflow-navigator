const tokenInput = document.getElementById('token');
const status = document.getElementById('status');
const saveBtn = document.getElementById('save');

chrome.storage.local.get(['githubToken'], (r) => {
  if (r.githubToken) tokenInput.value = r.githubToken;
});

saveBtn.addEventListener('click', () => {
  const value = tokenInput.value.trim();
  chrome.storage.local.set({ githubToken: value }, () => {
    status.textContent = value ? 'Saved.' : 'Cleared.';
    setTimeout(() => { status.textContent = ''; }, 2000);
  });
});
