import { webcrypto } from "crypto";
import dynamicImport from "./index.js";
import * as fs from "fs";

async function main() {
  // Import lodash-es
  const { random } = (await dynamicImport(
    "https://cdn.skypack.dev/lodash-es"
  )) as { random: () => number };
  random();

  // Import uuid which depends on the global "crypto"
  const { v4: uuidv4 } = (await dynamicImport("https://cdn.skypack.dev/uuid", {
    crypto: webcrypto,
  })) as { v4: () => string };
  uuidv4();

  // Import a native node module using an import map
  const { lstat } = (await dynamicImport(
    "fs",
    {},
    { imports: { fs: "node:fs/promises" } }
  )) as { lstat: (path: string) => Promise<fs.Stats> };
  await lstat(".");
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
