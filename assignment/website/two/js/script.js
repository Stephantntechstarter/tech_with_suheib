const addButton = document.getElementById("addButton");
const sortButton = document.getElementById("sortButton");
const clearListButton = document.getElementById("clearListButton");
const artikelInput = document.getElementById("artikel");
const anzahlInput = document.getElementById("anzahl");
const preisInput = document.getElementById("preis");
const kategorieInput = document.getElementById("kategorie");
const liste = document.getElementById("liste");
const gesamt = document.getElementById("gesamt");
const toggleModeButton = document.getElementById("toggleMode");
const budgetInput = document.getElementById("budget");
const budgetFeedback = document.getElementById("budgetFeedback");

const kategorieEmojis = {
  "Lebensmittel": "🥦",
  "Unterhaltung": "🎮",
  "Bücher": "📚",
  "Elektronik": "💻",
  "Haushalt": "🏠"
};

// Speichert die Liste in localStorage
function saveList() {
  const items = [];
  const liItems = document.querySelectorAll("#liste li");
  liItems.forEach(item => {
    // Speichern der nötigen Daten aus dem Datensatz
    items.push({
      artikel: item.dataset.artikel,
      anzahl: parseFloat(item.dataset.anzahl),
      preis: parseFloat(item.dataset.preis),
      kategorie: item.dataset.kategorie,
      totalPrice: parseFloat(item.dataset.totalPrice),
      checked: item.querySelector("input[type='checkbox']").checked
    });
  });
  localStorage.setItem("einkaufsliste", JSON.stringify(items));
}

// Lädt die Liste aus localStorage
function loadList() {
  const data = localStorage.getItem("einkaufsliste");
  if (data) {
    const items = JSON.parse(data);
    items.forEach(itemData => {
      createListItem(itemData);
    });
    updatePreis();
  }
}

// Eingabevalidierung
function validateInputs() {
  let valid = true;
  [artikelInput, anzahlInput, preisInput].forEach(input => {
    if (input.value.trim() === "") {
      input.classList.add("error");
      valid = false;
    } else {
      input.classList.remove("error");
    }
  });
  return valid;
}

// Aktualisiert den Gesamtpreis und das Budget-Feedback
function updatePreis() {
  let total = 0;
  const items = document.querySelectorAll("#liste li");
  items.forEach(item => {
    const preis = parseFloat(item.dataset.totalPrice);
    const checkbox = item.querySelector("input[type='checkbox']");
    if (checkbox.checked) {
      total += preis;
    }
  });
  gesamt.textContent = `Gesamt: ${total.toFixed(2)}€`;

  // Budget-Feedback
  const budget = parseFloat(budgetInput.value);
  if (!isNaN(budget)) {
    const remaining = budget - total;
    if (remaining < 0) {
      budgetFeedback.textContent = `Budget überschritten um ${Math.abs(remaining).toFixed(2)}€!`;
      budgetFeedback.style.color = "red";
    } else {
      budgetFeedback.textContent = `Verbleibendes Budget: ${remaining.toFixed(2)}€`;
      budgetFeedback.style.color = "green";
    }
  } else {
    budgetFeedback.textContent = "";
  }
  saveList();
}

// Sucht nach einem vorhandenen Listeneintrag mit gleichem Artikelname und Stückpreis
function findDuplicate(artikel, preis) {
  const items = document.querySelectorAll("#liste li");
  for (let item of items) {
    if (item.dataset.artikel === artikel.toLowerCase() && item.dataset.preis === preis.toFixed(2)) {
      return item;
    }
  }
  return null;
}

// Erzeugt einen neuen Listeneintrag oder aktualisiert einen bestehenden
function createListItem(itemData) {
  const emoji = kategorieEmojis[itemData.kategorie] || "📦";
  const new_li = document.createElement("li");
  new_li.dataset.artikel = itemData.artikel;
  new_li.dataset.anzahl = itemData.anzahl;
  new_li.dataset.preis = itemData.preis.toFixed(2);
  new_li.dataset.kategorie = itemData.kategorie;
  new_li.dataset.totalPrice = itemData.totalPrice;

  // Erstellt einen Container für den normalen Anzeigemodus
  const displayRow = document.createElement("div");
  displayRow.classList.add("display-row");

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = itemData.checked;
  checkbox.addEventListener("change", updatePreis);
  displayRow.appendChild(checkbox);

  // Artikeltext
  const textSpan = document.createElement("span");
  textSpan.textContent = `${emoji} ${itemData.anzahl} x ${itemData.artikel}: ${itemData.preis.toFixed(2)}€ p.P. - ${itemData.totalPrice.toFixed(2)}€`;
  displayRow.appendChild(textSpan);

  // Bearbeiten-Button
  const editButton = document.createElement("button");
  editButton.textContent = "Bearbeiten";
  editButton.addEventListener("click", () => enterEditMode(new_li, textSpan));
  displayRow.appendChild(editButton);

  // Löschen-Button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "❌";
  deleteButton.addEventListener("click", () => {
    liste.removeChild(new_li);
    updatePreis();
  });
  displayRow.appendChild(deleteButton);

  new_li.appendChild(displayRow);
  liste.appendChild(new_li);
  saveList();
}

// Fügt einen Artikel hinzu oder aktualisiert einen vorhandenen Eintrag (bei Dopplungen)
function addItem() {
  if (!validateInputs()) return;

  const artikel = artikelInput.value.trim();
  const anzahl = parseFloat(anzahlInput.value);
  const preis = parseFloat(preisInput.value);
  const kategorie = kategorieInput.value;
  const emoji = kategorieEmojis[kategorie] || "📦";
  const total = anzahl * preis;

  const duplicate = findDuplicate(artikel, preis);

  if (duplicate) {
    // Aktualisiere vorhandenen Eintrag
    let currentAnzahl = parseFloat(duplicate.dataset.anzahl);
    currentAnzahl += anzahl;
    duplicate.dataset.anzahl = currentAnzahl;

    const newTotal = currentAnzahl * preis;
    duplicate.dataset.totalPrice = newTotal;

    // Aktualisiere den angezeigten Text
    const textSpan = duplicate.querySelector("span");
    textSpan.textContent = `${emoji} ${currentAnzahl} x ${artikel}: ${preis.toFixed(2)}€ p.P. - ${newTotal.toFixed(2)}€`;
    updatePreis();
  } else {
    // Neuer Eintrag
    const itemData = {
      artikel: artikel.toLowerCase(),
      anzahl: anzahl,
      preis: preis,
      kategorie: kategorie,
      totalPrice: total,
      checked: true
    };
    createListItem(itemData);
    updatePreis();
  }

  // Felder zurücksetzen (Budget bleibt erhalten)
  artikelInput.value = "";
  anzahlInput.value = "";
  preisInput.value = "";
}

// Sortiert die Liste alphabetisch nach Artikelname
function sortList() {
  const items = Array.from(document.querySelectorAll("#liste li"));
  items.sort((a, b) => {
    const nameA = a.dataset.artikel;
    const nameB = b.dataset.artikel;
    return nameA.localeCompare(nameB);
  });
  // Liste leeren und sortierte Elemente neu einfügen
  liste.innerHTML = "";
  items.forEach(item => liste.appendChild(item));
  saveList();
  updatePreis();
}

// Bearbeitungsmodus für einen Listeneintrag
function enterEditMode(li, textSpan) {
  // Markiere den Eintrag als in Bearbeitung
  li.classList.add("editing");
  // Verberge die Standardanzeige
  textSpan.style.display = "none";

  // Erstelle Container für Edit-Felder
  const editContainer = document.createElement("div");

  // Erstelle Input-Felder vorbefüllt mit aktuellen Daten
  const artikelEdit = document.createElement("input");
  artikelEdit.type = "text";
  artikelEdit.value = li.dataset.artikel;

  const anzahlEdit = document.createElement("input");
  anzahlEdit.type = "number";
  anzahlEdit.value = li.dataset.anzahl;

  const preisEdit = document.createElement("input");
  preisEdit.type = "number";
  preisEdit.value = li.dataset.preis;

  const kategorieEdit = document.createElement("select");
  for (const key in kategorieEmojis) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${kategorieEmojis[key]} ${key}`;
    if (key === li.dataset.kategorie) {
      option.selected = true;
    }
    kategorieEdit.appendChild(option);
  }

  editContainer.appendChild(artikelEdit);
  editContainer.appendChild(anzahlEdit);
  editContainer.appendChild(preisEdit);
  editContainer.appendChild(kategorieEdit);

  // Erstelle Speichern-Button
  const saveButton = document.createElement("button");
  saveButton.textContent = "Speichern";
  saveButton.addEventListener("click", () => {
    // Lese bearbeitete Werte aus
    const newArtikel = artikelEdit.value.trim().toLowerCase();
    const newAnzahl = parseFloat(anzahlEdit.value);
    const newPreis = parseFloat(preisEdit.value);
    const newKategorie = kategorieEdit.value;
    const newEmoji = kategorieEmojis[newKategorie] || "📦";
    const newTotal = newAnzahl * newPreis;

    // Update Datensätze
    li.dataset.artikel = newArtikel;
    li.dataset.anzahl = newAnzahl;
    li.dataset.preis = newPreis.toFixed(2);
    li.dataset.kategorie = newKategorie;
    li.dataset.totalPrice = newTotal;

    // Update Textanzeige
    textSpan.textContent = `${newEmoji} ${newAnzahl} x ${newArtikel}: ${newPreis.toFixed(2)}€ p.P. - ${newTotal.toFixed(2)}€`;

    // Beende den Bearbeitungsmodus
    li.classList.remove("editing");
    textSpan.style.display = "inline";
    li.removeChild(editContainer);
    updatePreis();
  });
  editContainer.appendChild(saveButton);

  // Erstelle Abbrechen-Button
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Abbrechen";
  cancelButton.addEventListener("click", () => {
    li.classList.remove("editing");
    textSpan.style.display = "inline";
    li.removeChild(editContainer);
  });
  editContainer.appendChild(cancelButton);

  li.appendChild(editContainer);
}

// Liste leeren
clearListButton.addEventListener("click", () => {
  liste.innerHTML = "";
  updatePreis();
});

// Light-/Darkmode-Toggle
function toggleMode() {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("mode", isDark ? "dark" : "light");
}

document.addEventListener("DOMContentLoaded", () => {
  // Modus laden
  const savedMode = localStorage.getItem("mode");
  if (savedMode === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.add("light-mode");
  }
  loadList();
});

toggleModeButton.addEventListener("click", toggleMode);

// Sortier-Button
sortButton.addEventListener("click", sortList);

// Enter-Taste als Trigger
document.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    addItem();
  }
});

// Entferne Fehlerumrandung bei Eingabe
[artikelInput, anzahlInput, preisInput].forEach(input => {
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      input.classList.remove("error");
    }
  });
});

budgetInput.addEventListener("input", updatePreis);
addButton.addEventListener("click", addItem);
