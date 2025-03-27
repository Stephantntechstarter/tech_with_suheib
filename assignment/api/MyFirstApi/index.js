const express = require("express");
const app = express();
const sillyname = require("sillyname");

const pets = [
  { id: 1, name: "Alfred", species: "dog", age: 3 },
  { id: 2, name: "Mia", species: "cat", age: 2 },
  { id: 3, name: "Carlos", species: "parrot", age: 10 },
  { id: 4, name: "Tank", species: "turtle", age: 23 },
  { id: 5, name: "Luna", species: "ferret", age: 1 }
];

app.get("/", (req, res) => {
  res.send("Willkommen bei meiner ersten API!");
});

app.get("/data", (req, res) => {
  res.json([
    { id: 1, name: "Max" },
    { id: 2, name: "Lena" }
  ]);
});

app.get("/randomname", (req, res) => {
  const randomName = sillyname();
  res.send(randomName);
});

app.get("/tiere", (req, res) => {
  res.json(pets);
});

app.get("/tiere/search", (req, res) => {
  const species = req.query.species;
  const result = pets.filter((pet) => pet.species == species);
  res.json(result);
})

app.get("/tiere/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const foundPet = pets.find((pet) => pet.id === id);

  if (foundPet) {
    res.json(foundPet)
  } else {
    res.status(404).send("Tier mit deiner ID nicht gefunden. ID: " + id);
  };

});

app.use(express.json());

app.post("/tiere", (req, res) => {
  const { species, name, age } = req.body;
  const newPet = {
    id: pets.length + 1,
    name: name,
    species: species,
    age: age,
  };

  pets.push(newPet);

  res.json(pets);

});

app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});
