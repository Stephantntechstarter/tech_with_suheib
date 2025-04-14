const buttonShowAnimals = document.getElementById("button_show_animals");
const showAnimals = document.getElementById("show_animals");
const form = document.getElementById("addAnimalForm");

buttonShowAnimals.addEventListener("click", async () => {
  const res = await fetch("http://127.0.0.1:3000/tiere")
  displayData(await res.json())

  function displayData(data) {
    console.log(data)
    showAnimals.innerHTML = "";
    data.forEach(tier => {
      console.log(tier)
      const li = document.createElement("li");
      li.textContent = tier.name;
      showAnimals.appendChild(li);
    });
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    tierart: form.tierart.value,
    name: form.name.value,
    krankheit: form.krankheit.value,
    age: form.age.value,
    gewicht: form.gewicht.value
  };

  try {
    const response = await fetch("http://127.0.0.1:3000/tiere", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Tier erfolgreich hinzugefügt!");
      form.reset();
    }
  } catch (error) {
    console.error("Fehler:", error);
  }
});
