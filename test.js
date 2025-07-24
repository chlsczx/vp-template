const { statSync } = require("fs");
const path = require("path");

console.log(path.join(process.cwd(), "..", "..", "..", ".."));
