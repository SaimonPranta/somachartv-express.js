const router = require("express").Router()
const fs = require("fs")
const path = require("path")

router.get("/", async (req, res) => {
    try {
       
    } catch (error) {
        console.log("Error")
        res.json({
            message: "Internal server error"
        })
    }
})



module.exports = router

const rootDir = __dirname
function getAllFilePaths(dir) {
    let filePaths = [];
  console.log("rootDir ==>", rootDir)
    // Read the contents of the directory
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
  
      // Check if the path is a directory
      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively search subdirectories
        filePaths = filePaths.concat(getAllFilePaths(fullPath));
      } else {
        // It's a file, add it to the list
        const finalPath = fullPath.replace(path.join(rootDir), "");
        filePaths.push(finalPath);
      }
    });
  
    return filePaths;
  }

  // console.log(getAllFilePaths("/"))