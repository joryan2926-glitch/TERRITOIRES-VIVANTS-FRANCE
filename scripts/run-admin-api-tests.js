const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");

const testsDir = join(process.cwd(), "tests");
const files = readdirSync(testsDir)
  .filter((file) => /^admin-.*-api\.test\.js$/.test(file))
  .sort();

const failed = [];
for (const file of files) {
  process.stdout.write(`RUN ${file}\n`);
  const result = spawnSync(process.execPath, [join(testsDir, file)], { stdio: "inherit" });
  if (result.status !== 0) failed.push(file);
}

if (failed.length) {
  console.error(`FAILED: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("ALL_ADMIN_TESTS_OK");
