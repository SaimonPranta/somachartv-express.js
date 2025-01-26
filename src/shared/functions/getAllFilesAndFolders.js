const { readdirSync } = require("fs");
const { join } = require("path");
const {storageRootPath } = require("../constants/variables");



const getAllFilesAndFolders = (folderRootPath) => {
  const entries = readdirSync(folderRootPath, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = join(folderRootPath, entry.name);
    const sanitizeFullPath = fullPath.replace(storageRootPath, "")
    if (entry.isDirectory()) {
      result.push({ name: entry.name, type: 'folder', fullPath: sanitizeFullPath, contents: getAllFilesAndFolders(fullPath) });
    } else {
      result.push({ name: entry.name, fullPath: sanitizeFullPath,  type: 'file' });
    }

  }

  return result;
};

module.exports = getAllFilesAndFolders