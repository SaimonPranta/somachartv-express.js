const express = require("express");
const router = express.Router();
const {
  newsStoragePath,
  adsStoragePath,
  employStoragePath,
} = require("../../shared/constants/variables");

router.use("/", express.static(newsStoragePath));
router.use("/",express.static(adsStoragePath));
router.use("/",express.static(employStoragePath));

module.exports = router;
