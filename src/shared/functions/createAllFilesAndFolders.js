const {
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  unlinkSync
} = require("fs");
const { join, sep } = require("path");
const { storageRootPath } = require("../constants/variables");
const NewsCollection = require("../../DB/Modals/news");
const axios = require("axios");
const AdsCollection = require("../../DB/Modals/ads");
const EmployCollection = require("../../DB/Modals/employ");

const checkService = (filePath) => {
  return filePath.split("/")[1];
};
const downloadImage = async (url, filePath) => {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer"
    });
    if (!response.data) {
      return;
    }
    // Write the binary data to a file
    writeFileSync(filePath, response.data);
  } catch (error) {}
};

const createAllFilesAndFolders = async (
  siteUlr,
  storagePath,
  fileFolderList
) => {
  try {
    if (!storagePath || !fileFolderList || !fileFolderList.length) {
      return;
    }

    for (const entry of fileFolderList) {
      const { type, name, contents, rootPath, fullPath } = entry;

      const fullFilePath = join(storagePath, rootPath, name);
      const exist = existsSync(fullFilePath);
      if (type === "folder") {
        if (!exist) {
          mkdirSync(fullFilePath);
        }
        if (contents && contents.length) {
          await createAllFilesAndFolders(siteUlr, storagePath, contents);
        }
      } else if (type === "file") {
        const service = await checkService(rootPath);
        let isDataExist = null;
        if (service === "news") {
          isDataExist = await NewsCollection.findOne({
            "images.src": name
          }).select("_id");
        } else if (service === "ads") {
          isDataExist = await AdsCollection.findOne({
            img: name
          }).select("_id");
        } else if (service === "ads") {
          isDataExist = await EmployCollection.findOne({
            img: name
          }).select("_id");
        }


        const imgUrl = `${siteUlr}/media/${name}`;
        if (isDataExist) {
          // if (!exist) {
            await downloadImage(imgUrl, fullFilePath);
          // }
          
        } else {
          if (exist) {
            unlinkSync(fullFilePath);
          }
        }
      }
      
    }
  } catch (error) {
    console.log("error ------->>", error);
  }
};

module.exports = createAllFilesAndFolders;
