import fs from 'fs-extra';
import path from 'path';

const esmFileId = 'index.mjs';
const cssFileId = 'index.css';

// updates main entry points to unique filenames to prevent unwanted caching
export function updateHtmlReferences() {
  const files = fs.readdirSync('./dist');
  const esmFile = files.find(f => f.match(/index-[A-Z0-9]+?\.mjs/));
  const cssFile = files.find(f => f.match(/index-[A-Z0-9]+?\.css/));

  const indexContent = fs.readFileSync('./dist/index.html', 'utf-8');
  const updatedIndexContent = indexContent
    .replace(esmFileId, path.basename(esmFile))
    .replace(cssFileId, path.basename(cssFile));

  fs.writeFileSync('./dist/index.html', updatedIndexContent);
}
