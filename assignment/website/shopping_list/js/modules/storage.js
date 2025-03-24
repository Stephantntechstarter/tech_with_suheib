function saveList() {
  const items = [];
  document.querySelectorAll("#liste li").forEach(item => {
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

function loadList() {
  const data = localStorage.getItem("einkaufsliste");
  if (data) {
    JSON.parse(data).forEach(itemData => createListItem(itemData));
    updatePreis();
  }
}
