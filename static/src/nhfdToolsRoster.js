const VERSION_KEY = 'nhfdToolsRosterVersion';
const STORAGE_KEY = 'nhfdToolsRoster';
const AUTO_PRINT = new URLSearchParams(window.location.search).get('autoprint') === '1';

let roster = [];
let baseRoster = [];

function loadVersion() {
  const saved = localStorage.getItem(VERSION_KEY);
  return saved || 'NHFD DB Version';
}

function saveVersion() {
  const versionField = document.getElementById('versionField');
  localStorage.setItem(VERSION_KEY, versionField.value.trim());
}

async function fetchRosterFromDatabase() {
  const res = await fetch('/api/roster/station', {
    headers: { Accept: 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to load roster: ${res.status}`);
  }

  const rows = await res.json();
  return rows.map((row) => ({
    last: row.lastName || '',
    first: row.firstName || '',
    phone: row.phone || '',
    email: row.workEmail || row.personalEmail || ''
  }));
}

async function loadRoster() {
  try {
    baseRoster = await fetchRosterFromDatabase();
  } catch (err) {
    console.error(err);
    baseRoster = [];
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (baseRoster.length === 0) {
          return parsed;
        }

        const merged = [...baseRoster];
        const existingKeys = new Set(
          merged.map((row) => `${String(row.last).toLowerCase()}|${String(row.first).toLowerCase()}`)
        );

        for (const row of parsed) {
          const key = `${String(row.last).toLowerCase()}|${String(row.first).toLowerCase()}`;
          if (!existingKeys.has(key)) {
            merged.push(row);
            existingKeys.add(key);
          }
        }

        return merged;
      }
    } catch (err) {
      console.error('Error parsing saved roster:', err);
    }
  }

  return [...baseRoster];
}

function saveRosterToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
}

function sortRoster() {
  roster.sort((a, b) => {
    const lastComp = a.last.localeCompare(b.last, undefined, { sensitivity: 'base' });
    if (lastComp !== 0) return lastComp;
    return a.first.localeCompare(b.first, undefined, { sensitivity: 'base' });
  });
}

async function initializeTable() {
  roster = await loadRoster();
  renderVolunteers();

  const versionField = document.getElementById('versionField');
  versionField.value = loadVersion();
  versionField.addEventListener('input', saveVersion);

  if (AUTO_PRINT) {
    setTimeout(() => {
      exportToPDF();
    }, 250);
  }
}

function renderVolunteers() {
  sortRoster();

  const tbody = document.getElementById('volunteerList');
  tbody.innerHTML = '';

  const numbered = roster.map((member, idx) => ({
    ...member,
    number: idx + 1
  }));

  const half = Math.ceil(numbered.length / 2);
  const leftColumn = numbered.slice(0, half);
  const rightColumn = numbered.slice(half);

  for (let i = 0; i < half; i++) {
    const row = document.createElement('tr');

    if (leftColumn[i]) {
      row.appendChild(createNameCell(leftColumn[i]));
      row.appendChild(createPhoneCell(leftColumn[i]));
      row.appendChild(createEmailCell(leftColumn[i]));
    } else {
      row.appendChild(createEmptyNameCell());
      row.appendChild(createEmptyCell());
      row.appendChild(createEmptyCell());
    }

    if (rightColumn[i]) {
      row.appendChild(createNameCell(rightColumn[i]));
      row.appendChild(createPhoneCell(rightColumn[i]));
      row.appendChild(createEmailCell(rightColumn[i]));
    } else {
      row.appendChild(createEmptyNameCell());
      row.appendChild(createEmptyCell());
      row.appendChild(createEmptyCell());
    }

    tbody.appendChild(row);
  }
}

function createNameCell(member) {
  const cell = document.createElement('td');
  cell.className = 'name-cell';

  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = `${member.number}. ${member.last}, ${member.first}`;
  container.appendChild(nameSpan);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'x';
  deleteBtn.title = `Remove ${member.last}, ${member.first}`;
  deleteBtn.onclick = function (e) {
    e.stopPropagation();
    removeVolunteer(member);
  };
  container.appendChild(deleteBtn);

  cell.appendChild(container);
  return cell;
}

function createPhoneCell(member) {
  const cell = document.createElement('td');
  cell.className = 'phone-cell';
  cell.textContent = member.phone || '';
  cell.style.textAlign = 'center';
  return cell;
}

function createEmailCell(member) {
  const cell = document.createElement('td');
  cell.className = 'email-cell';
  cell.textContent = member.email || '';
  return cell;
}

function createEmptyNameCell() {
  const cell = document.createElement('td');
  cell.className = 'name-cell';
  return cell;
}

function createEmptyCell() {
  return document.createElement('td');
}

function addVolunteer() {
  const lastInput = document.getElementById('lastName');
  const firstInput = document.getElementById('firstName');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');

  const last = lastInput.value.trim();
  const first = firstInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();

  if (!last || !first) {
    alert('Please enter both Last Name and First Name.');
    return;
  }

  const exists = roster.some(
    (row) => row.last.toLowerCase() === last.toLowerCase() && row.first.toLowerCase() === first.toLowerCase()
  );
  if (exists) {
    alert('Member already exists in roster.');
    return;
  }

  roster.push({ last, first, phone, email });
  sortRoster();
  saveRosterToStorage();
  renderVolunteers();

  lastInput.value = '';
  firstInput.value = '';
  phoneInput.value = '';
  emailInput.value = '';
}

function removeVolunteer(member) {
  if (confirm(`Remove ${member.last}, ${member.first} from roster?`)) {
    roster = roster.filter(
      (row) =>
        !(row.last === member.last && row.first === member.first && row.phone === member.phone && row.email === member.email)
    );
    saveRosterToStorage();
    renderVolunteers();
  }
}

function saveRoster() {
  saveRosterToStorage();
  alert(`Roster saved! Current count: ${roster.length} members.`);
}

function resetToOriginal() {
  if (confirm('Reset to the database roster? This will remove any added members.')) {
    roster = baseRoster.map((row) => ({ ...row }));
    saveRosterToStorage();
    renderVolunteers();
  }
}

function clearForm() {
  if (confirm('Clear the add-member form fields?')) {
    document.getElementById('lastName').value = '';
    document.getElementById('firstName').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
  }
}

function waitForHtml2Pdf() {
  return new Promise((resolve) => {
    if (window.html2pdf) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.html2pdf) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

async function exportToPDF() {
  await waitForHtml2Pdf();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
  const filename = `NHFD_Roster_${timestamp}.pdf`;
  const element = document.body;
  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', compress: true }
  };

  const controls = document.querySelectorAll('.volunteer-management, .management-controls, .pdf-export, .delete-btn');
  const originalDisplay = [];
  controls.forEach((control) => {
    originalDisplay.push(control.style.display);
    control.style.display = 'none';
  });

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    await exportToPDFWithoutImages(timestamp);
  } finally {
    controls.forEach((control, index) => {
      control.style.display = originalDisplay[index];
    });
  }
}

async function exportToPDFWithoutImages(timestamp) {
  const element = document.body.cloneNode(true);
  const logo = element.querySelector('.logo-image');
  if (logo) logo.remove();

  const filename = `NHFD_Roster_${timestamp}.pdf`;
  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename,
    html2canvas: { scale: 2, logging: false, useCORS: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', compress: true }
  };

  await html2pdf().set(opt).from(element).save();
}

document.addEventListener('DOMContentLoaded', initializeTable);
