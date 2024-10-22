const path = require("path")
const storageRootPath = path.join(__dirname, "../../../../../storage.imp/somachartv.com")

const newsStoragePath = path.join(storageRootPath, "/news")

module.exports = {storageRootPath, newsStoragePath}