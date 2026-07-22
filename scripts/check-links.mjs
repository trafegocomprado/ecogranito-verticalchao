import { readFile, stat } from "node:fs/promises";
import { isAbsolute, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const html = await readFile(resolve(root, "index.html"), "utf8");
const failures = [];
const checked = new Set();
const attributePattern = /\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi;
const publishRootFiles = new Set([
  "index.html",
  "styles.css",
  "script.js",
  "robots.txt",
  "_headers",
]);

try {
  const metadata = await stat(resolve(root, "build.json"));
  if (metadata.isFile()) publishRootFiles.add("build.json");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

function reject(url, reason) {
  failures.push(`${url} (${reason})`);
}

for (const match of html.matchAll(attributePattern)) {
  const originalUrl = match[2].trim();
  if (
    originalUrl === "" ||
    /^(?:#|mailto:|tel:|https?:|data:)/i.test(originalUrl)
  ) {
    continue;
  }

  const pathOnly = originalUrl.split(/[?#]/, 1)[0];
  if (pathOnly === "") continue;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathOnly);
  } catch {
    reject(originalUrl, "invalid URL encoding");
    continue;
  }

  if (decodedPath.startsWith("//")) {
    reject(originalUrl, "unsafe absolute or drive-qualified path");
    continue;
  }
  const publishCandidate = decodedPath.startsWith("/")
    ? decodedPath.slice(1)
    : decodedPath;
  if (/^(?:\\|[a-z]:)/i.test(publishCandidate) || isAbsolute(publishCandidate)) {
    reject(originalUrl, "unsafe absolute or drive-qualified path");
    continue;
  }
  if (publishCandidate.includes("\\") || publishCandidate.split("/").includes("..")) {
    reject(originalUrl, "unsafe path traversal");
    continue;
  }

  const publishPath = posix.normalize(publishCandidate);
  const isPublished =
    publishRootFiles.has(publishPath) ||
    (publishPath.startsWith("assets/") && publishPath.length > "assets/".length);
  if (!isPublished) {
    reject(originalUrl, "not included in publish manifest");
    continue;
  }

  const localPath = resolve(root, publishPath);
  const relativePath = relative(root, localPath);
  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    reject(originalUrl, "unsafe path outside publish root");
    continue;
  }
  if (checked.has(localPath)) continue;
  checked.add(localPath);

  try {
    const localFile = await stat(localPath);
    if (!localFile.isFile()) reject(originalUrl, "publish target is not a file");
  } catch {
    reject(originalUrl, "missing local file");
  }
}

if (failures.length > 0) {
  console.error(`Local link check failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Local link check passed (${checked.size} unique files checked).`);
}
