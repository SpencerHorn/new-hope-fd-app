const STORAGE_KEY = 'nhfdToolsTrainingVolunteers';
const VERSION_KEY = 'nhfdToolsTrainingVersion';
const AUTO_PRINT = new URLSearchParams(window.location.search).get('autoprint') === '1';

let volunteers = [];

function loadVersion() {
  const saved = localStorage.getItem(VERSION_KEY);
  return saved || 'NHFD DB Version';
}

function saveVersion() {
  const versionField = document.getElementById('versionField');
  localStorage.setItem(VERSION_KEY, versionField.value.trim());
}

async function fetchVolunteersFromDatabase() {
  const res = await fetch('/api/roster/station', {
    headers: { Accept: 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to load volunteers: ${res.status}`);
  }

  const rows = await res.json();
  return rows
    .map((row) => `${row.lastName}, ${row.firstName}`)
    .filter((name) => name && name !== ', ')
    .sort((a, b) => a.localeCompare(b));
}

async function loadVolunteers() {
  let fromDb = [];

  try {
    fromDb = await fetchVolunteersFromDatabase();
  } catch (err) {
    console.error(err);
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (fromDb.length === 0) {
          return parsed;
        }

        const merged = [...fromDb];
        for (const name of parsed) {
          if (!merged.includes(name)) {
            merged.push(name);
          }
        }
        return merged.sort((a, b) => a.localeCompare(b));
      }
    } catch (err) {
      console.error('Failed to parse saved training volunteers.', err);
    }
  }

  return fromDb;
}

function saveVolunteers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(volunteers));
}

async function initializeTable() {
  volunteers = await loadVolunteers();
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
  const tbody = document.getElementById('volunteerList');
  tbody.innerHTML = '';

  for (let i = 0; i < volunteers.length; i += 2) {
    const row = document.createElement('tr');

    if (volunteers[i]) {
      row.appendChild(createNameCell(volunteers[i]));
      for (let j = 0; j < 7; j++) {
        row.appendChild(createCheckboxCell(volunteers[i], j));
      }
    } else {
      row.appendChild(createEmptyNameCell());
      for (let j = 0; j < 7; j++) {
        row.appendChild(createEmptyCell());
      }
    }

    if (volunteers[i + 1]) {
      row.appendChild(createNameCell(volunteers[i + 1]));
      for (let j = 0; j < 7; j++) {
        row.appendChild(createCheckboxCell(volunteers[i + 1], j));
      }
    } else {
      row.appendChild(createEmptyNameCell());
      for (let j = 0; j < 7; j++) {
        row.appendChild(createEmptyCell());
      }
    }

    tbody.appendChild(row);
  }
}

function createNameCell(volunteerName) {
  const cell = document.createElement('td');
  cell.className = 'name-cell';

  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = volunteerName;
  container.appendChild(nameSpan);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'x';
  deleteBtn.title = `Remove ${volunteerName}`;
  deleteBtn.onclick = function (e) {
    e.stopPropagation();
    removeVolunteer(volunteerName);
  };
  container.appendChild(deleteBtn);

  cell.appendChild(container);
  return cell;
}

function createCheckboxCell(volunteerName, index) {
  const cell = document.createElement('td');
  cell.className = 'checkbox-cell';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = `volunteer_${volunteerName.replace(/[ ,]/g, '_')}_${index}`;
  cell.appendChild(checkbox);
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
  const input = document.getElementById('newVolunteerName');
  const name = input.value.trim();

  if (!name) return;

  if (volunteers.includes(name)) {
    alert('Volunteer already exists!');
    return;
  }

  volunteers.push(name);
  volunteers.sort((a, b) => a.localeCompare(b));
  renderVolunteers();
  saveVolunteers();
  input.value = '';
}

function removeVolunteer(volunteerName) {
  if (confirm(`Remove ${volunteerName} from the list?`)) {
    volunteers = volunteers.filter((v) => v !== volunteerName);
    renderVolunteers();
    saveVolunteers();
  }
}

function saveVolunteerList() {
  saveVolunteers();
  alert(`Volunteer list saved! Current count: ${volunteers.length} volunteers.`);
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
  const filename = `NHFD_Training_Report_${timestamp}.pdf`;

  const element = document.body;
  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: false,
      logging: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'in',
      format: 'letter',
      orientation: 'portrait',
      compress: true
    }
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

function clearForm() {
  if (confirm('Are you sure you want to clear all form data? This will reset all fields and checkboxes.')) {
    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach((input) => {
      input.value = '';
    });

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }
}

async function exportToPDFWithoutImages(timestamp) {
  const element = document.body.cloneNode(true);
  const logo = element.querySelector('.logo-image');
  if (logo) {
    logo.remove();
  }

  const filename = `NHFD_Training_Report_${timestamp}.pdf`;
  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename,
    html2canvas: {
      scale: 2,
      logging: false,
      useCORS: false
    },
    jsPDF: {
      unit: 'in',
      format: 'letter',
      orientation: 'portrait',
      compress: true
    }
  };

  await html2pdf().set(opt).from(element).save();
}

document.addEventListener('DOMContentLoaded', initializeTable);
