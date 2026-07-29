const VERSION_KEY = 'nhfdToolsRosterVersion';
const AUTO_PRINT = new URLSearchParams(window.location.search).get('autoprint') === '1';

let roster = [];

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
    return await fetchRosterFromDatabase();
  } catch (err) {
    console.error(err);
    return [];
  }
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
  cell.textContent = `${member.number}. ${member.last}, ${member.first}`;
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

function clearForm() {
  if (confirm('Clear the version field?')) {
    const versionField = document.getElementById('versionField');
    versionField.value = '';
    saveVersion();
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

  const controls = document.querySelectorAll('.pdf-export');
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
