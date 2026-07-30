const syncFields = document.querySelectorAll('[data-sync-field]');
const logoInputs = document.querySelectorAll('[data-logo]');
const sopPages = document.querySelectorAll('.sop-page');
const assignSopBtn = document.getElementById('assignSopBtn');
const loadSopBtn = document.getElementById('loadSopBtn');
const saveSopBtn = document.getElementById('saveSopBtn');
const sopNameInput = document.getElementById('sopNameInput');
const saveStatus = document.getElementById('saveStatus');
const loadSopDialog = document.getElementById('loadSopDialog');
const loadSopSelect = document.getElementById('loadSopSelect');
const confirmLoadSopBtn = document.getElementById('confirmLoadSopBtn');
const cancelLoadSopBtn = document.getElementById('cancelLoadSopBtn');

function setSaveStatus(message, isError = false) {
  if (!saveStatus) return;
  saveStatus.textContent = message;
  saveStatus.style.color = isError ? '#b91c1c' : '#166534';
}

function updatePagination() {
  const totalPages = sopPages.length;
  sopPages.forEach((page, index) => {
    page.querySelectorAll('[data-page-number]').forEach((el) => {
      el.textContent = String(index + 1);
    });
    page.querySelectorAll('[data-page-total]').forEach((el) => {
      el.textContent = String(totalPages);
    });
  });
}

function mirrorField(fieldName, value) {
  const normalized = value || '';
  document.querySelectorAll(`[data-sync-field="${fieldName}"]`).forEach((el) => {
    if (el.value !== normalized) {
      el.value = normalized;
    }
  });

  document.querySelectorAll(`[data-footer-sync="${fieldName}"]`).forEach((el) => {
    el.textContent = normalized;
  });
}

function collectSyncValues() {
  const values = {};
  document.querySelectorAll('[data-sync-field]').forEach((field) => {
    const name = field.dataset.syncField;
    if (!name || values[name] !== undefined) {
      return;
    }

    values[name] = field.value || '';
  });

  return values;
}

function collectFormPayload() {
  return {
    syncValues: collectSyncValues(),
    editableBlocks: Array.from(document.querySelectorAll('.editable')).map((el) => el.innerHTML),
    lineInputs: Array.from(document.querySelectorAll('.line-input')).map((el) => el.innerHTML),
    logoSrc: logoInputs[0]?.src || null
  };
}

function applySavedPayload(payload) {
  const syncValues = payload?.syncValues || {};
  Object.entries(syncValues).forEach(([fieldName, value]) => {
    mirrorField(fieldName, String(value || ''));
  });

  const editableBlocks = payload?.editableBlocks || [];
  document.querySelectorAll('.editable').forEach((block, index) => {
    block.innerHTML = editableBlocks[index] || '';
  });

  const lineInputs = payload?.lineInputs || [];
  document.querySelectorAll('.line-input').forEach((cell, index) => {
    cell.innerHTML = lineInputs[index] || '';
  });

  const logoSrc = payload?.logoSrc;
  if (typeof logoSrc === 'string' && logoSrc.trim()) {
    logoInputs.forEach((logo) => {
      logo.src = logoSrc;
    });
  }
}

async function saveSopDocument() {
  const name = String(sopNameInput?.value || '').trim();
  if (!name) {
    setSaveStatus('Enter a saved SOP name before saving.', true);
    return;
  }

  const payload = collectFormPayload();

  setSaveStatus('Saving SOP...', false);

  try {
    const res = await fetch('/api/sops/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, payload })
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSaveStatus(body.error || 'Unable to save SOP document.', true);
      return;
    }

    setSaveStatus(body.updated ? 'SOP updated successfully.' : 'SOP saved successfully.');
  } catch {
    setSaveStatus('Unable to save SOP document.', true);
  }
}

async function loadSopByQueryString() {
  const params = new URLSearchParams(window.location.search);
  const documentId = params.get('documentId');
  const canAssign = params.get('canAssign') === '1';

  if (assignSopBtn) {
    assignSopBtn.style.display = canAssign ? '' : 'none';
  }

  if (assignSopBtn && canAssign) {
    assignSopBtn.addEventListener('click', () => {
      window.parent.postMessage({ type: 'open-assign-sop-modal' }, window.location.origin);
    });
  }

  if (!documentId) {
    return;
  }

  try {
    const res = await fetch(`/api/sops/documents/${encodeURIComponent(documentId)}`);
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setSaveStatus(body.error || 'Unable to load saved SOP.', true);
      return;
    }

    if (sopNameInput) {
      sopNameInput.value = body.name || '';
    }

    applySavedPayload(body.payload || {});
    setSaveStatus(`Loaded SOP: ${body.name || 'saved document'}.`);
  } catch {
    setSaveStatus('Unable to load saved SOP.', true);
  }
}

async function fetchSavedSops() {
  const res = await fetch('/api/sops/documents');
  if (!res.ok) {
    throw new Error('Unable to fetch saved SOP list.');
  }

  return res.json();
}

function updateSopQueryParam(documentId) {
  const url = new URL(window.location.href);
  url.searchParams.set('documentId', documentId);
  window.history.replaceState({}, '', url.toString());
}

async function loadSopDocumentById(documentId) {
  const res = await fetch(`/api/sops/documents/${encodeURIComponent(documentId)}`);
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    setSaveStatus(body.error || 'Unable to load saved SOP.', true);
    return false;
  }

  if (sopNameInput) {
    sopNameInput.value = body.name || '';
  }

  applySavedPayload(body.payload || {});
  updateSopQueryParam(documentId);
  setSaveStatus(`Loaded SOP: ${body.name || 'saved document'}.`);
  return true;
}

async function openLoadSopDialog() {
  if (!loadSopDialog || !loadSopSelect) {
    return;
  }

  setSaveStatus('Loading saved SOP list...', false);

  try {
    const documents = await fetchSavedSops();
    loadSopSelect.innerHTML = '';

    if (!documents.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No saved SOPs found';
      loadSopSelect.appendChild(option);
      loadSopSelect.disabled = true;
      if (confirmLoadSopBtn) confirmLoadSopBtn.disabled = true;
    } else {
      documents.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${doc.name} - ${doc.sopNumber} (${doc.revisionDate})`;
        loadSopSelect.appendChild(option);
      });
      loadSopSelect.disabled = false;
      if (confirmLoadSopBtn) confirmLoadSopBtn.disabled = false;
    }

    loadSopDialog.showModal();
    setSaveStatus('', false);
  } catch {
    setSaveStatus('Unable to load saved SOP list.', true);
  }
}

syncFields.forEach((field) => {
  field.addEventListener('input', () => {
    mirrorField(field.dataset.syncField, field.value);
  });

  mirrorField(field.dataset.syncField, field.value);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.querySelectorAll('[data-sync-field]').forEach((field) => {
    const defaultValue = field.dataset.syncField === 'departmentHeader'
      ? 'NEW HOPE VOLUNTEER FIRE DEPARTMENT'
      : '';
    field.value = defaultValue;
    mirrorField(field.dataset.syncField, defaultValue);
  });

  document.querySelectorAll('.editable').forEach((block) => {
    block.innerHTML = '';
  });

  document.querySelectorAll('.line-input').forEach((cell) => {
    cell.innerHTML = '';
  });
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const source = document.getElementById('sopPages');
  const options = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename: 'NHFD_SOP.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  html2pdf().set(options).from(source).save();
});

if (saveSopBtn) {
  saveSopBtn.addEventListener('click', saveSopDocument);
}

if (loadSopBtn) {
  loadSopBtn.addEventListener('click', openLoadSopDialog);
}

if (cancelLoadSopBtn) {
  cancelLoadSopBtn.addEventListener('click', () => {
    loadSopDialog?.close();
  });
}

if (confirmLoadSopBtn) {
  confirmLoadSopBtn.addEventListener('click', async () => {
    if (!loadSopSelect?.value) {
      return;
    }

    const loaded = await loadSopDocumentById(loadSopSelect.value);
    if (loaded) {
      loadSopDialog?.close();
    }
  });
}

updatePagination();
loadSopByQueryString();
