#!/usr/bin/env node
import { writeFile, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const args = new Set(process.argv.slice(2));
const SPEC_PATH = "openapi.snapshot.json";
const TYPES_PATH = "src/types/api.ts";
const DEFAULT_URL = "http://localhost:5100/swagger/v1/swagger.json";
const TEMP_TYPES_PATH = "/tmp/fl-api-types.gen.ts";

function runOpenapiTypescript(input, output) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "npx",
      ["--no-install", "openapi-typescript", input, "-o", output],
      { stdio: "inherit" }
    );
    proc.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`openapi-typescript exited with ${code}`))
    );
    proc.on("error", reject);
  });
}

async function fetchAndWriteSnapshot(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const pretty = JSON.stringify(json, null, 2) + "\n";
  await writeFile(SPEC_PATH, pretty);
}

async function runCheck() {
  await runOpenapiTypescript(SPEC_PATH, TEMP_TYPES_PATH);
  const [generated, committed] = await Promise.all([
    readFile(TEMP_TYPES_PATH, "utf8"),
    readFile(TYPES_PATH, "utf8"),
  ]);
  if (generated !== committed) {
    console.error(
      `\u2717 ${TYPES_PATH} is stale vs ${SPEC_PATH}.\n` +
        `  Run \`npm run gen:api\` against a live API and commit the result.`
    );
    process.exit(1);
  }
  console.log(`\u2713 ${TYPES_PATH} matches ${SPEC_PATH}`);
}

async function runFetch() {
  const url = process.env.OPENAPI_URL ?? DEFAULT_URL;
  console.log(`Fetching ${url}\u2026`);
  await fetchAndWriteSnapshot(url);
  console.log(`\u2713 wrote ${SPEC_PATH}`);
  await runOpenapiTypescript(SPEC_PATH, TYPES_PATH);
  console.log(`\u2713 wrote ${TYPES_PATH}`);
}

const mode = args.has("--check") ? runCheck : runFetch;
mode().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
