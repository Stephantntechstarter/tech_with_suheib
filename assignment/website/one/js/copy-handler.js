function copyCode() {
  const code = document.querySelector(".language-json").textContent;
  navigator.clipboard.writeText(code.trim())
    .then(() => {
      const toast = document.createElement("div");
      toast.className = "copy-toast";
      toast.textContent = "✓ Kopiert!";
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 2000);
    })
    .catch(err => console.error("Fehler beim Kopieren:", err));
}
