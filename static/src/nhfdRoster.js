// Roster management (two-members-per-row) using localStorage key 'nhfdRoster'
const VERSION_KEY = 'nhfdVersion';
function loadVersion() {
  const saved = localStorage.getItem(VERSION_KEY);
  return saved || "NHFD Version 10/4/2025";
}

function saveVersion() {
  const versionField = document.getElementById('versionField');
  localStorage.setItem(VERSION_KEY, versionField.value.trim());
}

document.addEventListener('DOMContentLoaded', () => {
  initializeTable();

  // Load version footer
  const versionField = document.getElementById('versionField');
  versionField.value = loadVersion();

  // Auto-save whenever edited
  versionField.addEventListener('input', saveVersion);
});

// Default roster data (from uploaded roster PDF -- preloaded)
function defaultRoster() {
  return [
    { last: "Bass", first: "Autumn", phone: "984-365-5865", email: "autumn.bass@newhopefire.com" },
    { last: "Baw", first: "Htoo", phone: "919-260-8363", email: "htoo.baw@newhopefire.com" },
    { last: "Bergen", first: "Gavin", phone: "919-672-8417", email: "gavin.bergen@newhopefire.com" },
    { last: "Blalock", first: "Brian", phone: "919-699-6367", email: "brian.blalock@newhopefire.com" },
    { last: "Blalock", first: "Luke", phone: "919-590-7028", email: "luke.blalock@newhopefire.com" },
    { last: "Blankenship", first: "Bill", phone: "919-796-8061", email: "william.blankenship@newhopefire.com" },
    { last: "Bravo", first: "Ariadna", phone: "203-559-8312", email: "ariadna.bravo@newhopefire.com" },
    { last: "Burton", first: "Wayne", phone: "919-337-3189", email: "wayne.burton@newhopefire.com" },
    { last: "Callaway", first: "Carl", phone: "706-844-6582", email: "joseph.callaway@newhopefire.com" },
    { last: "Capps", first: "Jonathan", phone: "336-534-0004", email: "johnathan.capps@newhopefire.com" },
    { last: "Carroll", first: "Cliff", phone: "919-614-7210", email: "cliff.caroll@newhopefire.com" },
    { last: "Castelloe", first: "Mike", phone: "252-572-8381", email: "michael.castelloe@newhopefire.com" },
    { last: "Cherry", first: "Ricky", phone: "919-730-9441", email: "ricky.cherry@newhopefire.com" },
    { last: "Ellis", first: "Shawn", phone: "919-903-0442", email: "shawn.ellis@newhopefire.com" },
    { last: "Givens", first: "Ryan", phone: "336-269-6911", email: "ryan.givens@newhopefire.com" },
    { last: "Greenlee", first: "Jimmy", phone: "919-885-3296", email: "jimmy.greenlee@newhopefire.com" },
    { last: "Greenlee", first: "Zachary", phone: "919-672-2237", email: "zachary.greenlee@newhopefire.com" },
    { last: "Greenlee", first: "Matthew", phone: "919-672-7054", email: "matthew.greenlee@newhopefire.com" },
    { last: "Heizer", first: "Xander", phone: "919-338-9322", email: "xander.heizer@newhopefire.com" },
    { last: "Hernandez", first: "Jocelyn", phone: "984-261-8542", email: "jocelyn.hernandez@newhopefire.com" },
    { last: "Horn", first: "Spencer", phone: "919-322-8072", email: "spencer.horn@newhopefire.com" },
    { last: "Horne", first: "Harold", phone: "919-260-2721", email: "harold.horne@newhopefire.com" },
    { last: "Hunt", first: "David", phone: "919-264-6464", email: "david.hunt@newhopefire.com" },
    { last: "Johnson", first: "Curtis", phone: "919-260-5467", email: "curtis.johnson@newhopefire.com" },
    { last: "Knotts", first: "Bridget", phone: "919-428-3587", email: "bridget.knotts@newhopefire.com" },
    { last: "Kosek", first: "Joshua", phone: "919-771-9219", email: "joshua.kosek@newhopefire.com" },
    { last: "Krishnakumar", first: "Anish", phone: "984-243-1068", email: "anish.krishnakumar@newhopefire.com" },
    { last: "May", first: "Ben", phone: "919-450-8539", email: "ben.may@newhopefire.com" },
    { last: "May", first: "Matt", phone: "919-717-9219", email: "matt.may@newhopefire.com" },
    { last: "McDowell", first: "Jayson", phone: "919-824-0780", email: "jason.mcdowell@newhopefire.com" },
    { last: "Nieves", first: "Chris", phone: "919-215-8843", email: "chris.nieves@newhopefire.com" },
    { last: "Payne", first: "Brantley", phone: "336-212-0766", email: "brantley.payne@newhopefire.com" },
    { last: "Poe", first: "Kwah", phone: "984-234-1801", email: "kwah.poe@newhopefire.com" },
    { last: "Pratt", first: "Howard", phone: "919-451-2423", email: "howard.pratt@newhopefire.com" },
    { last: "Pulley", first: "Jake", phone: "336-343-5874", email: "jake.pulley@newhopefire.com" },
    { last: "Renner", first: "Caleb", phone: "828-450-1038", email: "caleb.renner@newhopefire.com" },
    { last: "Rodriguez", first: "Christina", phone: "919-656-0470", email: "christina.rodriguez@newhopefire.com" },
    { last: "Tapp", first: "Mike", phone: "919-619-8685", email: "mike.tapp@newhopefire.com" },
    { last: "Tillmans", first: "Fry", phone: "984-227-0838", email: "fry.tillmans@newhopefire.com" },
    { last: "Turner", first: "Lindsey", phone: "336-214-4296", email: "lindsey.turner@newhopefire.com" },
    { last: "Tyndall", first: "Richard", phone: "919-618-3548", email: "richard.tyndall@newhopefire.com" },
    { last: "Velazquez", first: "Luis", phone: "609-225-0354", email: "luis.velazquez@newhopefire.com" },
    { last: "Walker", first: "Eddie", phone: "919-730-3428", email: "eddie.walker@newhopefire.com" },
    { last: "Wall", first: "Dusty", phone: "919-730-7227", email: "john.wall@newhopefire.com" },
    { last: "White", first: "Brett", phone: "919-810-7983", email: "brett.white@newhopefire.com" },
    { last: "Whitt", first: "Blake", phone: "336-583-0076", email: "blake.whitt@newhopefire.com" },
    { last: "Whitton", first: "Amanda", phone: "704-578-7373", email: "amanda.whitton@newhopefire.com" },
    { last: "Wruck", first: "Ian", phone: "984-484-6971", email: "ian.wruck@newhopefire.com" },
    { last: "Yoder", first: "Taylor", phone: "865-206-2066", email: "taylor.yoder@newhopefire.com" }
  ];
}

const STORAGE_KEY = 'nhfdRoster';

// Load roster from localStorage or return default
function loadRoster() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      // Only use saved roster if it contains at least one member
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing saved roster:", e);
    }
  }

  // Fallback to default roster
  return defaultRoster();
}


// Save roster to localStorage
function saveRosterToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
}

let roster = loadRoster();

// Sorting utility (by last name, then first)
function sortRoster() {
  roster.sort((a, b) => {
    const lastComp = a.last.localeCompare(b.last, undefined, { sensitivity: 'base' });
    if (lastComp !== 0) return lastComp;
    return a.first.localeCompare(b.first, undefined, { sensitivity: 'base' });
  });
}

// Initialize table on DOM load
function initializeTable() {
  renderVolunteers();
}

// Render roster in two-column (two members per row) format
function renderVolunteers() {
  sortRoster();

  const tbody = document.getElementById('volunteerList');
  tbody.innerHTML = '';

  const numbered = roster.map((m, idx) => ({
    ...m,
    number: idx + 1
  }));

  const half = Math.ceil(numbered.length / 2);
  const leftColumn = numbered.slice(0, half);
  const rightColumn = numbered.slice(half);

  for (let i = 0; i < half; i++) {
    const row = document.createElement('tr');

    // left side
    if (leftColumn[i]) {
      row.appendChild(createNameCell(leftColumn[i]));
      row.appendChild(createPhoneCell(leftColumn[i]));
      row.appendChild(createEmailCell(leftColumn[i]));
    } else {
      row.appendChild(createEmptyNameCell());
      row.appendChild(createEmptyCell());
      row.appendChild(createEmptyCell());
    }

    // right side
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
  deleteBtn.textContent = '×';
  deleteBtn.title = `Remove ${member.last}, ${member.first}`;
  deleteBtn.onclick = function(e) {
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
  const cell = document.createElement('td');
  return cell;
}

// Add member from inputs
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

  // Check duplicates by exact last+first match
  const exists = roster.some(r => r.last.toLowerCase() === last.toLowerCase() && r.first.toLowerCase() === first.toLowerCase());
  if (exists) {
    alert('Member already exists in roster.');
    return;
  }

  roster.push({ last, first, phone, email });
  sortRoster();
  saveRosterToStorage();
  renderVolunteers();

  // Clear the input fields after adding
  lastInput.value = '';
  firstInput.value = '';
  phoneInput.value = '';
  emailInput.value = '';
}

// Remove member (object match)
function removeVolunteer(member) {
  if (confirm(`Remove ${member.last}, ${member.first} from roster?`)) {
    roster = roster.filter(r => !(r.last === member.last && r.first === member.first && r.phone === member.phone && r.email === member.email));
    saveRosterToStorage();
    renderVolunteers();
  }
}

// Save roster (explicit)
function saveRoster() {
  saveRosterToStorage();
  alert(`Roster saved! Current count: ${roster.length} members.`);
  console.log('Roster saved:', roster);
}

// Reset to original default list
function resetToOriginal() {
  if (confirm('Reset to the original roster? This will remove any added members.')) {
    roster = defaultRoster();
    saveRosterToStorage();
    renderVolunteers();
  }
}

// Clear the add-member inputs (clear form)
function clearForm() {
  if (confirm('Clear the add-member form fields?')) {
    document.getElementById('lastName').value = '';
    document.getElementById('firstName').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
    console.log('Add-member form cleared');
  }
}

// PDF Export logic (keeps your original approach)
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
    filename: filename,
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
    console.log(`PDF saved as: ${filename}`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    console.log('Trying fallback without images...');
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
    filename: filename,
    html2canvas: { scale: 2, logging: false, useCORS: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', compress: true }
  };

  await html2pdf().set(opt).from(element).save();
  console.log(`PDF saved as: ${filename}`);
}

// DOM ready
document.addEventListener('DOMContentLoaded', initializeTable);
