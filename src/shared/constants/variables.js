const path = require("path");
const dotenv = require("dotenv");
const storageRootPath = path.join(
  __dirname,
  "../../../../../storage.imp/somachartv.com"
);
dotenv.config();

const newsStoragePath = path.join(storageRootPath, "/news");
const adsStoragePath = path.join(storageRootPath, "/ads");
const employStoragePath = path.join(storageRootPath, "/employ");

// DB url
const REMOTE_URI = `mongodb+srv://saimonpranta:${process.env.DB_PASSWORD}@somacharcluster.vn9e3.mongodb.net/somachar?retryWrites=true&w=majority`;
const LOCAL_URI = "mongodb://localhost:27017/somachar";
const DB_URI =
  process.env.npm_lifecycle_event === "dev" ? LOCAL_URI : REMOTE_URI;

module.exports = {
  storageRootPath,
  newsStoragePath,
  adsStoragePath,
  employStoragePath,
  REMOTE_URI,
  LOCAL_URI,
  DB_URI,
};
