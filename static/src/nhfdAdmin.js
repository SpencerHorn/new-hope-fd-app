const STORAGE_KEY = "nhfdPPEList";
let ppeList = loadList();

// Load saved list
function loadList() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

// Save list
function saveList() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ppeList));
}

// Add member to list + table
function addMember() {
  const last = document.getElementById("last").value.trim();
  const first = document.getElementById("first").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const workEmail = document.getElementById("workEmail").value.trim();
  const personalEmail = document.getElementById("personalEmail").value.trim();
  const maskSize = document.getElementById("maskSize").value.trim();
  const maskFit = document.getElementById("maskFit").value.trim();
  const shirtSize = document.getElementById("shirtSize").value.trim();

  if (!last || !first) {
    alert("Last name and first name are required.");
    return;
  }

  const member = { last, first, phone, workEmail, personalEmail, maskSize, maskFit, shirtSize };

  ppeList.push(member);

  saveList();
  renderTable();
  clearFormFields();
}

// Clear input fields only
function clearFormFields() {
  document.querySelectorAll("input").forEach(input => input.value = "");
}

// Clear form button
function clearForm() {
  if (!confirm("Clear all fields?")) return;
  clearFormFields();
}

// Delete member
function deleteMember(index) {
  if (!confirm("Remove this member?")) return;
  ppeList.splice(index, 1);
  saveList();
  renderTable();
}

// Render table
function renderTable() {
  const tbody = document.getElementById("ppeList");
  tbody.innerHTML = "";

  // Sort alphabetically by last, then first
  ppeList.sort((a, b) => {
    const last = a.last.localeCompare(b.last, undefined, { sensitivity: "base" });
    if (last !== 0) return last;
    return a.first.localeCompare(b.first, undefined, { sensitivity: "base" });
  });

  ppeList.forEach((m, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${m.last}, ${m.first}</td>
      <td>${m.phone}</td>
      <td>${m.workEmail}</td>
      <td>${m.personalEmail}</td>
      <td>${m.maskSize}</td>
      <td>${m.maskFit}</td>
      <td>${m.shirtSize}</td>
      <td><button class="delete-btn" onclick="deleteMember(${i})">×</button></td>
    `;

    tbody.appendChild(row);
  });
}

// PDF Export
async function exportToPDF() {
  const element = document.body;
  const filename = `NHFD_PPE_${new Date().toISOString().slice(0,10)}.pdf`;

  const opt = {
    margin: 0.2,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff"
    },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
  };

  await html2pdf().set(opt).from(element).save();
}

// Initialize
document.addEventListener("DOMContentLoaded", renderTable);
