import fs from "fs";
import path from "path";

export const logJSON = <T>(obj: T, saveFile?: boolean, filename?: string) => {
  console.log(JSON.stringify(obj, null, "  "));
  if (saveFile) {
    /**
     * @param {Object} obj
     * @param {string} filename
     */
    const filePath = path.resolve(__dirname, filename ?? "temp_log.json");
    const jsonData = JSON.stringify(obj, null, 2);
    fs.writeFileSync(filePath, jsonData, "utf-8");
    console.log(`Saved JSON file: ${filePath}`);
  }
};

export const logAndRt = <T>(obj: T): T => {
  logJSON(obj);
  return obj;
};
