const {storageRootPath } = require("../../shared/constants/variables"); 
const getAllFilesAndFolders = require("../../shared/functions/getAllFilesAndFolders");


const updateStorage = async () => {
  try {
    const fileList = getAllFilesAndFolders(storageRootPath);
    console.log("fileList ==>>", fileList[3]);
  } catch (error) {
    console.log("error from updateStorage function==>>", error);
  }
};

module.exports = { updateStorage };
