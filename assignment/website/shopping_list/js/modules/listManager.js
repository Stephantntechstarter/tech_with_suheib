const kategorieEmojis = {
  "Lebensmittel": "🥩🥦🍞",
  "Unterhaltung": "🎮",
  "Bücher": "📚",
  "Elektronik": "💻",
  "Haushalt": "🏠"
};

function validateInputs() {
  let valid = true;
  [artikelInput, anzahlInput, preisInput].forEach(input => {
    input.classList.toggle("error", input.value.trim() === "");
    if (input.value.trim() === "") valid = false;
  });
  return valid;
}

function findDuplicate(artikel, preis) {
  return [...document.querySelectorAll("#liste li")].find(item =>
    item.dataset.artikel === artikel.toLowerCase() &&
    item.dataset.preis === preis.toFixed(2)
  );
}
