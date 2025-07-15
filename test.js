const { statSync } = require("fs");
const path = require("path");

console.log(path.posix.join(process.cwd(), "test.js"));
