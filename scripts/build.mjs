import { cp, lstat, mkdir, rename, rm } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const dist = resolve(root, "dist");
const staging = resolve(root, ".dist-staging");
const backup = resolve(root, ".dist-backup");
const publicDir = resolve(root, "public");
const publicStaging = resolve(root, ".public-staging");
const publicBackup = resolve(root, ".public-backup");
const managedDirectories = new Map([
  [dist, "dist"],
  [staging, ".dist-staging"],
  [backup, ".dist-backup"],
  [publicDir, "public"],
  [publicStaging, ".public-staging"],
  [publicBackup, ".public-backup"],
]);

function assertManagedDirectory(target) {
  const expectedName = managedDirectories.get(target);
  if (
    expectedName === undefined ||
    dirname(target) !== root ||
    basename(target) !== expectedName
  ) {
    throw new Error(`Refusing to manage unexpected build directory: ${target}`);
  }
}

async function pathExists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function removeManagedDirectory(target) {
  assertManagedDirectory(target);
  await rm(target, { recursive: true, force: true });
}

async function preflightSources() {
  const requiredEntries = [
    ["index.html", "file"],
    ["styles.css", "file"],
    ["script.js", "file"],
    ["robots.txt", "file"],
    ["sitemap.xml", "file"],
    ["_headers", "file"],
    ["_redirects", "file"],
    ["assets", "directory"],
  ];
  const failures = [];

  for (const [entry, expectedType] of requiredEntries) {
    try {
      const details = await lstat(resolve(root, entry));
      const hasExpectedType =
        expectedType === "file" ? details.isFile() : details.isDirectory();
      if (!hasExpectedType) failures.push(`${entry} is not a ${expectedType}`);
    } catch (error) {
      if (error.code === "ENOENT") failures.push(`${entry} is missing`);
      else throw error;
    }
  }

  const entries = requiredEntries.map(([entry]) => entry);
  const buildMetadata = resolve(root, "build.json");
  try {
    const details = await lstat(buildMetadata);
    if (details.isFile()) entries.push("build.json");
    else failures.push("build.json is present but is not a file");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (failures.length > 0) {
    throw new Error(`Build preflight failed:\n- ${failures.join("\n- ")}`);
  }
  return entries;
}

let entries;
try {
  entries = await preflightSources();
} catch (error) {
  await removeManagedDirectory(staging);
  throw error;
}

await removeManagedDirectory(staging);
await mkdir(staging);

try {
  for (const entry of entries) {
    await cp(resolve(root, entry), resolve(staging, entry), { recursive: true });
  }

  await rm(resolve(staging, "assets", "img", "source"), { recursive: true, force: true });
  await rm(resolve(staging, "assets", "favicon-source.png"), { force: true });

  await removeManagedDirectory(backup);
  const hadPreviousBuild = await pathExists(dist);
  if (hadPreviousBuild) await rename(dist, backup);

  try {
    await rename(staging, dist);
  } catch (installError) {
    if (hadPreviousBuild) {
      try {
        await rename(backup, dist);
      } catch (rollbackError) {
        installError.cause = rollbackError;
      }
    }
    throw installError;
  }

  if (hadPreviousBuild) await removeManagedDirectory(backup);
} finally {
  await removeManagedDirectory(staging);
}

console.log(`Built static site in ${dist}`);

const publicEntries = entries.filter((entry) => entry !== "build.json");
await removeManagedDirectory(publicStaging);
await mkdir(publicStaging);

try {
  for (const entry of publicEntries) {
    await cp(resolve(dist, entry), resolve(publicStaging, entry), { recursive: true });
  }

  await removeManagedDirectory(publicBackup);
  const hadPreviousPublic = await pathExists(publicDir);
  if (hadPreviousPublic) await rename(publicDir, publicBackup);

  try {
    await rename(publicStaging, publicDir);
  } catch (installError) {
    if (hadPreviousPublic) await rename(publicBackup, publicDir);
    throw installError;
  }

  if (hadPreviousPublic) await removeManagedDirectory(publicBackup);
} finally {
  await removeManagedDirectory(publicStaging);
}

console.log(`Packaged Cloudflare Pages output in ${publicDir}`);
