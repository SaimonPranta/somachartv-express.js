const { readdirSync } = require("fs");
const { join, sep } = require("path");
const {storageRootPath } = require("../constants/variables");



const getAllFilesAndFolders = (folderRootPath) => {
  const entries = readdirSync(folderRootPath, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = join(folderRootPath, entry.name);
    const sanitizeFullPath = fullPath.replace(storageRootPath, "")
    const updateSanitizeFullPath = sanitizeFullPath.split(sep).join('/');
    const rootPath = updateSanitizeFullPath.replace(`/${entry.name}`, "")
    if (entry.isDirectory()) {
      result.push({ name: entry.name, type: 'folder', fullPath: updateSanitizeFullPath, rootPath, contents: getAllFilesAndFolders(fullPath) });
    } else {
      result.push({ name: entry.name, fullPath: updateSanitizeFullPath,rootPath,   type: 'file' });
    }

  }

  return result;
};

module.exports = getAllFilesAndFolders