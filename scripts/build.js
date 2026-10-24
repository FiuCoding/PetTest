"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(root, "dist");
const productionFiles = ["index.html", "styles.css", "data.js", "app.js", "_headers"];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const filename of productionFiles) {
  const source = path.join(root, filename);
  if (!fs.existsSync(source)) {
    throw new Error(`缺少生产文件：${filename}`);
  }
  fs.copyFileSync(source, path.join(outputDirectory, filename));
}

const totalBytes = productionFiles.reduce((total, filename) => {
  return total + fs.statSync(path.join(outputDirectory, filename)).size;
}, 0);

console.log(`Cloudflare Pages 构建完成：dist/（${productionFiles.length} 个文件，${(totalBytes / 1024).toFixed(1)} KB）`);
