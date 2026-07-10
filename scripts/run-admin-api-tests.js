const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.TVF_DISABLE_ADMIN_AUDIT = process.env.TVF_DISABLE_ADMIN_AUDIT || "1";

const testsDir = join(process.cwd(), "tests");
const files = readdirSync(testsDir)
  .filter((file) => /^(?:admin-.*-api|contact-api|dashboard-api|rate-limit)\.test\.js$/.test(file))
  .sort();

const failed = [];
for (const file of files) {
  process.stdout.write(`RUN ${file}\n`);
  const result = spawnSync(process.execPath, [join(testsDir, file)], { stdio: "inherit", env: process.env });
  if (result.status !== 0) failed.push(file);
}

if (failed.length) {
  console.error(`FAILED: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("ALL_ADMIN_TESTS_OK");
