import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.join(process.cwd(), ".next/server/app");
const destinationRoot = path.join(process.cwd(), ".open-next/assets");
let copiedPages = 0;

async function copyHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await copyHtmlFiles(sourcePath);
      continue;
    }
    if (!entry.name.endsWith(".html") || entry.name.startsWith("_")) continue;

    const relativePath = path.relative(sourceRoot, sourcePath);
    const destinationPath = path.join(destinationRoot, relativePath);
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
    copiedPages += 1;
  }
}

await copyHtmlFiles(sourceRoot);
console.log(`Copied ${copiedPages} static HTML pages into the Cloudflare asset bundle.`);
