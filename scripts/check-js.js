const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const files = readdirSync(root)
  .filter((file) => /^(admin.*|dashboard|main)\.js$/.test(file))
  .sort();

const failed = [];
for (const file of files) {
  process.stdout.write(`CHECK ${file}\n`);
  const result = spawnSync(process.execPath, ["--check", join(root, file)], { stdio: "inherit" });
  if (result.status !== 0) failed.push(file);
}

if (failed.length) {
  console.error(`JS_CHECK_FAILED: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("ALL_JS_CHECKS_OK");
