function parsePrice(price) {
  if (price.includes("Million")) {
    return parseFloat(price.replace(/[^0-9.]/g, "")) * 1000000;
  }
  return parseFloat(price.replace(/[^0-9,]/g, "").replace(",", ""));
}

module.exports = { parsePrice };
