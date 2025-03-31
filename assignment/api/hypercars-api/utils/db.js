const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/cars.json");

// Daten lesen
function readData() {
  try {
    const rawData = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Fehler beim Lesen der Datei:", error);
    return { cars: [] };
  }
}

// Daten schreiben
function writeData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Fehler beim Schreiben der Datei:", error);
  }
}

module.exports = { readData, writeData };
