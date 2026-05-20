const fs = require("fs");

async function parseTxt(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

module.exports = { parseTxt };
