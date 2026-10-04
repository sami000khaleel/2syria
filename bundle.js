// bundle.js
const fs = require('fs');
const path = require('path');

const bundleFiles = ["*.js"];
const noBundleDir = ["node_modules", "images", "uploads","scripts"];

// Simple pattern matcher for "*.ext" and exact filenames
function matchesPattern(filename, patterns) {
  return patterns.some(pattern => {
    if (pattern.startsWith('*.')) {
      return filename.endsWith(pattern.slice(1));
    }
    return filename === pattern;
  });
}

// Track whether any ancestor directory is in noBundleDir
function isInNoBundleDir(relPath) {
  const parts = relPath.split(path.sep);
  // Check all directory segments (exclude the filename itself)
  return parts.slice(0, -1).some(seg => noBundleDir.includes(seg));
}

function walk(dir, rootDir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      // Recurse into every directory — noBundleDir just filters files inside
      walk(fullPath, rootDir, results);
    } else if (entry.isFile()) {
      if (isInNoBundleDir(relPath)) continue;         // skip files inside noBundleDir
      if (!matchesPattern(entry.name, bundleFiles)) continue;
      results.push(relPath);
    }
  }
  return results;
}

function bundle(rootDir, outputFile = 'bundle.txt') {
  const files = walk(rootDir, rootDir);
  files.sort();

  let output = '';
  for (const relPath of files) {
    const code = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    output += `${relPath}\n${code}\n--------new file--------\n`;
  }

  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`Bundled ${files.length} files into ${outputFile}`);
}

const rootDir = process.argv[2] || process.cwd();
const outputFile = process.argv[3] || 'bundle.txt';
bundle(rootDir, outputFile);