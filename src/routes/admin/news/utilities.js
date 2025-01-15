const fs = require("fs");
const path = require("path");
const sanitizeFileName = require("../../../shared/utilize/sanitizeFileName");
const getRandomWord = require("../../../shared/utilize/getRandomWord");
const { newsStoragePath } = require("../../../shared/constants/variables");

const getQueries = (reqQuery = {}) => {
  const { search, fromDate, toDate} = reqQuery;
  let query = {};
  if (search) {
    const queryArray = [
      {
        title: new RegExp(search, "i")
      },
      {
        description: new RegExp(search, "i")
      },
      {
        "images.src": new RegExp(search, "i")
      },
      {
        "images.alt": new RegExp(search, "i")
      },
      {
        "images.figcaption": new RegExp(search, "i")
      },
      {
        "category.label": new RegExp(search, "i")
      },
      {
        "category.route": new RegExp(search, "i")
      },
      {
        "subcategory.label": new RegExp(search, "i")
      },
      {
        "subcategory.route": new RegExp(search, "i")
      },
      {
        "source.title": new RegExp(search, "i")
      },
      {
        "source.sourceUrl": new RegExp(search, "i")
      }
    ];
    if (query.$or) {
      query.$or = [...query.$or, ...queryArray];
    } else {
      query["$or"] = [...queryArray];
    }
  }
  if (fromDate && toDate) {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const startOfDay = new Date(startDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(endDate.setHours(23, 59, 59, 999));
    query["$and"] = [
      {
        createdAt: { $lte: endOfDay },
      },
      {
        createdAt: { $gte: startOfDay },
      },
    ];
  }

  return query;
};

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

module.exports = { getQueries, setFileName };
