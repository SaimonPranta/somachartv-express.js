const router = require("express").Router();
const getRandomNumber = require("../../../shared/functions/getRandomNumber");
const NewsCollection = require("../../../DB/Modals/news");
const path = require("path");
const { newsStoragePath } = require("../../../shared/constants/variables");
const fs = require("fs");
const { getQueries, setFileName } = require("./utilities");
const getDocument = require("../../../shared/utilize/getDocument");
const notifyGoogle = require("../../../shared/utilize/notifyGoogle");

router.get("/", async (req, res) => {
  try {
    const limit = 24;
    const page = req.query.page || 1;
    const search = req.query.search;
    const id = req.query.id;
    const query = getQueries(search);
    const totalNews = await NewsCollection.countDocuments();
    let newsSlice = totalNews / limit;
    if (newsSlice.toString().includes(".")) {
      const [beforeDot, afterDot] = newsSlice.toString().split(".");
      if (Number(afterDot) > 0) {
        newsSlice = Number(beforeDot) + 1;
      }
    }

    if (newsSlice < page) {
      return res.json({
        message: "All news are already loaded",
      });
    }
    const skip = (newsSlice - page) * limit;

    let newList = [];

    if (id) {
      newList = await NewsCollection.findOne({ _id: id });
    } else if (search) {
      newList = await NewsCollection.find(query).limit(limit);
    } else {
      newList = (
        await NewsCollection.find({}).skip(skip).limit(limit)
      ).reverse();
    }

    res.json({
      data: newList,
    });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    let files = req.files;
    const { htmlDescription, title, category } = data;
    let images = data.images;
    if (
      !images ||
      !htmlDescription ||
      !title ||
      !category ||
      !category.label ||
      !category.route
    ) {
      return res.json({
        message:
          "Title, Category, HTML Description and Image field are required",
      });
    }
    images = await images.map((fileInfo, index) => {
      const imgKey = fileInfo.imgKey;
      const file = files[imgKey];
      if (!file) {
        return;
      }
      const updateTitle = index ? `${title}_${index}` : title;
      const name = fileInfo.fileName || updateTitle;
      const ext = path.extname(file.name);
      const fileName = setFileName(name, ext);
      file.name = fileName;
      return {
        ...fileInfo,
        src: fileName,
        file: file,
      };
    });
    const document = await getDocument(htmlDescription);

    const paragraphList = await document.querySelectorAll("p");
    let description = "";
    await paragraphList.forEach((paragraph) => {
      if (!paragraph.textContent) {
        return;
      }
      description += `${paragraph.textContent} `;
    });
    const updateInfo = {
      ...data,
      description,
      images,
    };
    const newsInfo = await new NewsCollection({ ...updateInfo });

    const updateNews = await newsInfo.save();

    if (!updateNews) {
      return res.json({
        success: false,
        message: "Failed to create a news",
      });
    }
    if (!fs.existsSync(newsStoragePath)) {
      await fs.mkdirSync(newsStoragePath);
    }
    await Promise.all(
      images.map(async ({ file }) => {
        try {
          const imgFilePath = path.join(newsStoragePath, file.name);
          if (!fs.existsSync(imgFilePath)) {
            await file.mv(imgFilePath);
          }
        } catch (error) {}
      })
    );
    const newsDetailsPageUrl = `https://somacharnews.com/news/${updateNews._id}`;
    const notifyResponse = await notifyGoogle(newsDetailsPageUrl);

    if (notifyResponse) {
      await NewsCollection.findOneAndUpdate(
        { _id: updateNews._id },
        {
          googleIndexInfo: {
            indexed: true,
            date: new Date(),
          },
        }
      );
    }

    res.json({
      success: true,
      data: updateNews,
      message: "Categories updated successfully",
    });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});
router.put("/", async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { htmlDescription, title, category } = data;
    let images = data.images;
    let files = req.files || {};
    const newsID = data._id;

    if (
      !images ||
      !htmlDescription ||
      !title ||
      !category ||
      !category.label ||
      !category.route
    ) {
      return res.json({
        message:
          "Title, Category, HTML Description and Image field are required",
      });
    }

    const news = await NewsCollection.findOne({ _id: newsID });
    if (!news) {
      return res.json({
        message: "Failed to update, news not found",
      });
    }
    images = await images.map((fileInfo, index) => {
      const imgKey = fileInfo.imgKey;
      const file = files[imgKey];

      if (file) {
        const updateTitle = index ? `${title}_${index}` : title;
        const name = fileInfo.fileName || updateTitle;
        const ext = path.extname(file.name);
        const fileName = setFileName(name, ext);
        file.name = fileName;
        fileInfo["src"] = fileName;
        fileInfo["file"] = file;
      }

      return {
        ...fileInfo,
        // src: fileName,
        // file: file,
      };
    });
    const document = await getDocument(htmlDescription);

    const paragraphList = await document.querySelectorAll("p");
    let description = "";
    await paragraphList.forEach((paragraph) => {
      if (!paragraph.textContent) {
        return;
      }
      description += `${paragraph.textContent} `;
    });
    const updateInfo = {
      ...data,
      description,
      images,
    };
    const updateNews = await NewsCollection.findOneAndUpdate(
      { _id: newsID },
      { ...updateInfo },
      { new: true }
    );

    if (!updateNews) {
      return res.json({
        success: false,
        message: "Failed to update a news",
      });
    }
    if (!fs.existsSync(newsStoragePath)) {
      await fs.mkdirSync(newsStoragePath);
    }
    await Promise.all(
      news.images.map(async ({ src }) => {
        try {
          if (!src) {
            return;
          }
          const exist = await images.some((item) => item.src === src);
          if (!exist) {
            const imgFilePath = path.join(newsStoragePath, src);
            if (fs.existsSync(imgFilePath)) {
              await fs.unlinkSync(imgFilePath);
            }
          }
        } catch (error) {}
      })
    );
    await Promise.all(
      images.map(async ({ file }) => {
        try {
          if (!file) {
            return;
          }
          const imgFilePath = path.join(newsStoragePath, file.name);
          if (!fs.existsSync(imgFilePath)) {
            await file.mv(imgFilePath);
          }
        } catch (error) {}
      })
    );

    res.json({
      success: true,
      data: updateNews,
      message: "Categories updated successfully",
    });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { id } = req.query;

    const deleteInfo = await NewsCollection.findOneAndDelete({ _id: id });
    await Promise.all(
      deleteInfo.images.map(async (imgInfo) => {
        const imgPath = path.join(newsStoragePath, imgInfo.src);
        if (fs.existsSync(imgPath)) {
          await fs.unlinkSync(imgPath);
        }
      })
    );
    res.json({
      data: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
