document.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("mode");
  document.body.classList.add(savedMode === "dark" ? "dark-mode" : "light-mode");
  loadList();
});

toggleModeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  localStorage.setItem("mode", document.body.classList.contains("dark-mode") ? "dark" : "light");
})
