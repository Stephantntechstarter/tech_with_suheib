const fs = require("fs").promises;
const path = require("path");

const dbPath = path.join(__dirname, "../data/cars.json");

async function readData() {
  try {
    const rawData = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    // Bei Fehler leere Datenbank zurückgeben
    return { cars: [] };
  }
}

async function writeData(data) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Fehler beim Schreiben:", error);
    throw error; // Fehler wird auf höhere Ebene "geworfen" (siehe Error-Handling Middleware (server.js))
  }
}

module.exports = { readData, writeData };
