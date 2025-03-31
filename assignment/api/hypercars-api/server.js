const express = require("express");
const { readData, writeData } = require("./utils/db");
const app = express();
const port = 3000;

// Middleware für JSON-Parsing
app.use(express.json());

// GET: Alle Fahrzeuge
app.get('/cars', (req, res) => {
  const data = readData();
  let cars = [...data.cars]; // erstellt Kopie des Arrays

  // Volltextsuche
  const searchTerm = req.query.search?.toLowerCase();
  if (searchTerm) {
    cars = cars.filter(car => {
      const searchString = [
        car.manufacturer,
        car.model,
        car.year.toString(),
        car.horsepower.toString(),
        car.topSpeed?.toString() || '',
        car.price
      ].join(' ').toLowerCase();

      return searchString.includes(searchTerm);
    });
  }

  // Einzelfilter
  const { manufacturer, model, minHorsepower } = req.query;

  if (manufacturer) {
    const manufacturerSearch = manufacturer.toLowerCase();
    cars = cars.filter(c =>
      c.manufacturer.toLowerCase().includes(manufacturerSearch)
    );
  }

  if (model) {
    const modelSearch = model.toLowerCase();
    cars = cars.filter(c =>
      c.model.toLowerCase().includes(modelSearch)
    );
  }

  if (minHorsepower) {
    const minHP = parseInt(minHorsepower);
    if (!isNaN(minHP)) {
      cars = cars.filter(c => c.horsepower >= minHP);
    }
  }

  // Jahr-Range Filter
  const minYear = parseInt(req.query.minYear);
  const maxYear = parseInt(req.query.maxYear);

  if (!isNaN(minYear)) {
    cars = cars.filter(c => c.year >= minYear);
  }

  if (!isNaN(maxYear)) {
    cars = cars.filter(c => c.year <= maxYear);
  }

  // Sortierung
  const validSortFields = ['id', 'year', 'horsepower', 'topSpeed', 'price'];
  const sortField = validSortFields.includes(req.query.sort)
    ? req.query.sort
    : 'id';

  const sortOrder = req.query.order === 'desc' ? -1 : 1;

  cars.sort((a, b) => {
    // Sonderbehandlung für Preis (Entfernen € und konvertiert zu einer Zahl)
    if (sortField === 'price') {
      const valueA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const valueB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return (valueA - valueB) * sortOrder;
    }
    return (a[sortField] - b[sortField]) * sortOrder;
  });

  // Paginierung
  const defaultLimit = 10;
  const maxLimit = 100;

  let limit = parseInt(req.query.limit) || defaultLimit;
  limit = Math.min(Math.max(limit, 1), maxLimit); // Begrenzung 1-100

  const offset = Math.max(parseInt(req.query.offset) || 0, 0);

  // Gesamtergebnisse vor Paginierung
  const totalMatches = cars.length;

  // Paginierung anwenden
  const paginatedCars = cars.slice(offset, offset + limit);

  // Response mit Metadaten
  res.json({
    metadata: {
      total: totalMatches,
      returned: paginatedCars.length,
      offset,
      limit,
      sort: {
        field: sortField,
        order: sortOrder === 1 ? 'asc' : 'desc'
      },
      filters: {
        searchTerm: searchTerm || null,
        applied: Object.keys(req.query).filter(k => k !== 'sort' && k !== 'order' && k !== 'limit' && k !== 'offset')
      }
    },
    results: paginatedCars
  });
});

// POST: Neues Fahrzeug hinzufügen
app.post("/cars", (req, res) => {
  const data = readData();
  const newCar = {
    id: data.cars.length + 1,
    ...req.body
  };

  data.cars.push(newCar);
  writeData(data);
  res.status(201).json(newCar);
});

// PUT: Fahrzeug aktualisieren
app.put("/cars/:id", (req, res) => {
  const data = readData();
  const carId = parseInt(req.params.id);
  const carIndex = data.cars.findIndex(c => c.id === carId);

  if (carIndex === -1) {
    return res.status(404).json({ error: "Fahrzeug nicht gefunden" });
  }

  data.cars[carIndex] = { ...data.cars[carIndex], ...req.body };
  writeData(data);
  res.json(data.cars[carIndex]);
});

// DELETE: Fahrzeug löschen
app.delete("/cars/:id", (req, res) => {
  const data = readData();
  const carId = parseInt(req.params.id);
  const filteredCars = data.cars.filter(c => c.id !== carId);

  if (data.cars.length === filteredCars.length) {
    return res.status(404).json({ error: "Fahrzeug nicht gefunden" });
  }

  writeData({ cars: filteredCars });
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
