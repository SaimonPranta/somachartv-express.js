const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const { storageRootPath } = require("../../shared/constants/variables");
const createAllFilesAndFolders = require("../../shared/functions/createAllFilesAndFolders");
const getAllFilesAndFolders = require("../../shared/functions/getAllFilesAndFolders");

router.get("/get-media-file", async (req, res) => {
  try {
    const fileList = await getAllFilesAndFolders(storageRootPath);
    if (!fileList || !fileList.length) {
      return res.json({
        message: "No file or folder found"
      });
    }
    res.json({
      data: fileList
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});
 
module.exports = router;
