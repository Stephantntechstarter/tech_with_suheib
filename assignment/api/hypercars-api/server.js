const express = require("express");
const { readData, writeData } = require("./utils/db");
const { parsePrice } = require("./utils/helpers");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Error-Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// GET: Alle Fahrzeuge mit Filtern
app.get("/cars", async (req, res) => {
  try {
    const data = await readData();
    let cars = [...data.cars];

    // Volltextsuche
    const searchTerm = req.query.search?.toLowerCase();
    if (searchTerm) {
      cars = cars.filter(car => {
        const searchString = [
          car.manufacturer,
          car.model,
          car.year.toString(),
          car.horsepower.toString(),
          car.topSpeed?.toString() || "",
          car.price
        ].join(" ").toLowerCase();
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

    const minYear = parseInt(req.query.minYear);
    const maxYear = parseInt(req.query.maxYear);

    if (!isNaN(minYear)) {
      cars = cars.filter(c => c.year >= minYear);
    }

    if (!isNaN(maxYear)) {
      cars = cars.filter(c => c.year <= maxYear);
    }

    // Sortierung
    const validSortFields = ["id", "year", "horsepower", "topSpeed", "price"];
    const sortField = validSortFields.includes(req.query.sort)
      ? req.query.sort
      : "id";

    const sortOrder = req.query.order === "desc" ? -1 : 1;

    cars.sort((a, b) => {
      if (sortField === "price") {
        const valueA = parsePrice(a.price);
        const valueB = parsePrice(b.price);
        return (valueA - valueB) * sortOrder;
      }
      return (a[sortField] - b[sortField]) * sortOrder;
    });

    // Paginierung (Aufteilung großer Datenmengen in überschaubare, kleinere Abschnitte oder "Seiten")
    const defaultLimit = 10;
    const maxLimit = 100;

    let limit = parseInt(req.query.limit) || defaultLimit;
    limit = Math.min(Math.max(limit, 1), maxLimit);

    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    const totalMatches = cars.length;
    const paginatedCars = cars.slice(offset, offset + limit);

    res.json({
      metadata: {
        total: totalMatches,
        returned: paginatedCars.length,
        offset,
        limit,
        sort: {
          field: sortField,
          order: sortOrder === 1 ? "asc" : "desc"
        },
        filters: {
          searchTerm: searchTerm || null,
          minHorsepower: minHorsepower || null,
          minYear: minYear || null,
          applied: Object.keys(req.query).filter(k =>
            !["sort", "order", "limit", "offset"].includes(k))
        }
      },
      results: paginatedCars
    });

  } catch (error) {
    next(error);
  }
});

// POST: Neues Fahrzeug
app.post("/cars", async (req, res) => {
  try {
    const data = await readData();

    if (!req.body.manufacturer?.trim()) {
      return res.status(400).json({ error: "Hersteller benötigt" });
    }

    if (!req.body.model?.trim()) {
      return res.status(400).json({ error: "Modell benötigt" });
    }

    if (!Number.isInteger(req.body.horsepower)) {
      return res.status(400).json({ error: "Ungültige PS-Angabe" });
    }

    const newId = data.cars.length > 0
      ? Math.max(...data.cars.map(c => c.id)) + 1
      : 1;

    const newCar = {
      id: newId,
      ...req.body
    };

    data.cars.push(newCar);
    await writeData(data);

    res.status(201).json(newCar);
  } catch (error) {
    next(error);
  }
});

// PUT: Fahrzeug aktualisieren
app.put("/cars/:id", async (req, res) => {
  try {
    const data = await readData();
    const carId = parseInt(req.params.id);
    const carIndex = data.cars.findIndex(c => c.id === carId);

    if (carIndex === -1) {
      return res.status(404).json({ error: "Fahrzeug nicht gefunden" });
    }

    // Partielles Update
    data.cars[carIndex] = {
      ...data.cars[carIndex],
      ...req.body
    };

    await writeData(data);
    res.json(data.cars[carIndex]);
  } catch (error) {
    next(error);
  }
});

// DELETE: Fahrzeug löschen
app.delete("/cars/:id", async (req, res) => {
  try {
    const data = await readData();
    const carId = parseInt(req.params.id);
    const filteredCars = data.cars.filter(c => c.id !== carId);

    if (data.cars.length === filteredCars.length) {
      return res.status(404).json({ error: "Fahrzeug nicht gefunden" });
    }

    await writeData({ cars: filteredCars });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
