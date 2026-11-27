import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = 'src/db.js';
if (existsSync(path)) {
  let text = readFileSync(path, 'utf8');
  const replacement = `const deletedSet = getDeletedProductIds();\n  const existingProds = getStorageItem('products', null);\n  if (!Array.isArray(existingProds)) {\n    const initialList = filterEarringsOnly(defaultProducts, deletedSet);\n    setStorageItem('products', initialList, true);\n  } else {\n    const cleanedExisting = filterEarringsOnly(existingProds, deletedSet);\n    if (cleanedExisting.length !== existingProds.length || JSON.stringify(cleanedExisting) !== JSON.stringify(existingProds)) {\n      setStorageItem('products', cleanedExisting, true);\n    }\n  }\n  try {`;
  text = text.replace("const deletedSet = getDeletedProductIds();\n  setStorageItem('products', [], true);\n  try {", replacement);
  writeFileSync(path, text, 'utf8');
}
