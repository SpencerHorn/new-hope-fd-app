const syncFields = document.querySelectorAll('[data-sync-field]');
const logoInputs = document.querySelectorAll('[data-logo]');
const sopPages = document.querySelectorAll('.sop-page');

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

document.getElementById('logoUpload').addEventListener('change', (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const src = reader.result;
    if (typeof src !== 'string') {
      return;
    }

    logoInputs.forEach((logo) => {
      logo.src = src;
    });
  };
  reader.readAsDataURL(file);
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

updatePagination();
