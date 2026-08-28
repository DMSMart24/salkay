import { readFileSync, writeFileSync, statSync } from "node:fs";

const src = process.argv[2];
const dest = process.argv[3];
const json = JSON.parse(readFileSync(src, "utf8"));
const data = json.result?.data ?? json.data;
if (!data) {
  throw new Error(`No screenshot data. Keys: ${Object.keys(json).join(",")}`);
}
writeFileSync(dest, Buffer.from(data, "base64"));
console.log(statSync(dest).size);
