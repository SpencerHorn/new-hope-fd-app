// Load volunteers from localStorage or use default
function loadVolunteers() {
  const saved = localStorage.getItem('nhfdVolunteers');
  if (saved) {
    return JSON.parse(saved);
  } else {
    // Default list
    return [
      'Bass, Autumn',
      'Baw, Htoo',
      'Bergen, Gavin',
      'Blalock, Brian',
      'Blalock, Luke',
      'Blankenship, Bill',
      'Bravo, Ariadna',
      'Burton, Wayne',
      'Callaway, Carl',
      'Capps, Jonathan',
      'Carroll, Cliff',
      'Castelloe, Mike',
      'Cherry, Ricky',
      'Ellis, Shawn',
      'Givens, Ryan',
      'Greenlee, Jimmy',
      'Greenlee, Zachary',
      'Greenlee, Matthew',
      'Heizer, Xander',
      'Hernandez, Jocelyn',
      'Horn, Spencer',
      'Horne, Harold',
      'Hunt, David',
      'Johnson, Curtis',
      'Knotts, Bridget',
      'Kosek, Joshua',
      'Krishnakumar, Anish',
      'May, Ben',
      'May, Matt',
      'McDowell, Jayson',
      'Nieves, Chris',
      'Payne, Brantley',
      'Poe, Kwah',
      'Pratt, Howard',
      'Pulley, Jake',
      'Renner, Caleb',
      'Rodriguez, Christina',
      'Tapp, Mike',
      'Tillmans, Fry',
      'Turner, Lindsey',
      'Tyndall, Richard',
      'Velazquez, Luis',
      'Walker, Eddie',
      'Wall, Dusty',
      'White, Brett',
      'Whitt, Blake',
      'Whitton, Amanda',
      'Wruck, Ian',
      'Yoder, Taylor',
    ].sort();
  }
}

// Save volunteers to localStorage
function saveVolunteers() {
  localStorage.setItem('nhfdVolunteers', JSON.stringify(volunteers));
}

let volunteers = loadVolunteers();

// Initialize the table
function initializeTable() {
  renderVolunteers();
}

// Render volunteers in two-column format
function renderVolunteers() {
  const tbody = document.getElementById('volunteerList');
  tbody.innerHTML = '';

  // Split volunteers into rows of 2 columns
  for (let i = 0; i < volunteers.length; i += 2) {
    const row = document.createElement('tr');

    // First volunteer in row
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

    // Second volunteer in row
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

  // Create container for name and delete button
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';

  // Volunteer name
  const nameSpan = document.createElement('span');
  nameSpan.textContent = volunteerName;
  container.appendChild(nameSpan);

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '×';
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
  const cell = document.createElement('td');
  return cell;
}

function addVolunteer() {
  const input = document.getElementById('newVolunteerName');
  const name = input.value.trim();

  if (name && !volunteers.includes(name)) {
    volunteers.push(name);
    volunteers.sort();
    renderVolunteers();
    saveVolunteers(); // Auto-save to localStorage
    input.value = '';
  } else if (volunteers.includes(name)) {
    alert('Volunteer already exists!');
  }
}

function removeVolunteer(volunteerName) {
  if (confirm(`Remove ${volunteerName} from the list?`)) {
    volunteers = volunteers.filter((v) => v !== volunteerName);
    renderVolunteers();
    saveVolunteers(); // Auto-save to localStorage
  }
}

function saveVolunteerList() {
  // The array is already updated in real-time as you make changes
  // This function just confirms the save
  saveVolunteers(); // Ensure latest state is saved
  alert(`Volunteer list saved! Current count: ${volunteers.length} volunteers.`);
  console.log('Volunteers saved:', volunteers);
}

function resetToOriginal() {
  if (confirm('Reset to the original volunteer list? This will remove any volunteers you added.')) {
    volunteers = loadVolunteers(); // This will load the default list
    renderVolunteers();
    saveVolunteers(); // Save the reset state
  }
}

// Wait for html2pdf to be available
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

  // Generate timestamp for unique filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5); // Format: YYYY-MM-DD_HH-MM-SS

  const filename = `NHFD_Training_Report_${timestamp}.pdf`;

  const element = document.body;
  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename: filename,
    image: {
      type: 'jpeg',
      quality: 0.98,
    },
    html2canvas: {
      scale: 2,
      useCORS: false,
      logging: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    },
    jsPDF: {
      unit: 'in',
      format: 'letter',
      orientation: 'portrait',
      compress: true,
    },
  };

  const controls = document.querySelectorAll('.volunteer-management, .management-controls, .pdf-export, .delete-btn');
  const originalDisplay = [];

  // Store original display values and hide controls
  controls.forEach((control) => {
    originalDisplay.push(control.style.display);
    control.style.display = 'none';
  });

  try {
    await html2pdf().set(opt).from(element).save();
    console.log(`PDF saved as: ${filename}`);
  } catch (error) {
    console.error('PDF generation failed:', error);

    // Fallback: Try without the logo
    console.log('Trying fallback without images...');
    await exportToPDFWithoutImages(timestamp);
  } finally {
    // Restore controls
    controls.forEach((control, index) => {
      control.style.display = originalDisplay[index];
    });
  }
}

function clearForm() {
  if (confirm('Are you sure you want to clear all form data? This will reset all fields and checkboxes.')) {
    // Clear all text inputs and textareas
    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach((input) => {
      input.value = '';
    });

    // Clear all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });

    console.log('Form cleared successfully');
  }
}

// Fallback function without images
async function exportToPDFWithoutImages(timestamp) {
  const element = document.body.cloneNode(true);

  // Remove the logo image
  const logo = element.querySelector('.logo-image');
  if (logo) {
    logo.remove();
  }

  const filename = `NHFD_Training_Report_${timestamp}.pdf`;

  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2],
    filename: filename,
    html2canvas: {
      scale: 2,
      logging: false,
      useCORS: false,
    },
    jsPDF: {
      unit: 'in',
      format: 'letter',
      orientation: 'portrait',
      compress: true,
    },
  };

  await html2pdf().set(opt).from(element).save();
  console.log(`PDF saved as: ${filename}`);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeTable);
