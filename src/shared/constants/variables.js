const path = require("path");
const storageRootPath = path.join(
  __dirname,
  "../../../../../storage.imp/somachartv.com"
);

const newsStoragePath = path.join(storageRootPath, "/news");
const adsStoragePath = path.join(storageRootPath, "/ads");
const employStoragePath = path.join(storageRootPath, "/employ");

module.exports = {
  storageRootPath,
  newsStoragePath,
  adsStoragePath,
  employStoragePath,
};
