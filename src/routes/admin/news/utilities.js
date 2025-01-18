const fs = require("fs");
const path = require("path");
const sanitizeFileName = require("../../../shared/utilize/sanitizeFileName");
const getRandomWord = require("../../../shared/utilize/getRandomWord");
const { newsStoragePath } = require("../../../shared/constants/variables");



const setFileName = (name, ext) => {
  let fileName = `${name}${ext}`;
  fileName = sanitizeFileName(fileName);
  const filePath = path.join(newsStoragePath, fileName);
  if (fs.existsSync(filePath)) {
    const updateName = `${name} ${getRandomWord()}`;
    return setFileName(updateName, ext);
  }
  return fileName;
};

module.exports = {  setFileName };
