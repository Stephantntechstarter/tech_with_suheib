function updatePreis() {
  let total = 0;
  const items = document.querySelectorAll("#liste li");

  items.forEach(item => {
    if (item.querySelector("input[type='checkbox']").checked) {
      total += parseFloat(item.dataset.totalPrice);
    }
  });

  gesamt.textContent = `Gesamt: ${total.toFixed(2)}€`;
  handleBudgetFeedback(total);
  saveList();
}

function handleBudgetFeedback(total) {
  const budget = parseFloat(budgetInput.value);
  if (!budget) return;

  const remaining = budget - total;
  budgetFeedback.textContent = remaining < 0
    ? `Budget überschritten um ${Math.abs(remaining).toFixed(2)}€!`
    : `Verbleibendes Budget: ${remaining.toFixed(2)}€`;
  budgetFeedback.style.color = remaining < 0 ? "red" : "green";
}
