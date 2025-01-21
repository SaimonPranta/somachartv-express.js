const router = require("express").Router();
const CollectedNewsCollection = require("../../DB/Modals/collectedNews");
const NewsCollection = require("../../DB/Modals/news");
const CategoriesCollection = require("../../DB/Modals/categories");
const getRandomNumber = require("../../shared/functions/getRandomNumber");
const { newsStoragePath } = require("../../shared/constants/variables");
const { downloadImage, saveCategory } = require("./helper/utilize");
const getRandomWord = require("../../shared/utilize/getRandomWord");
const sanitizeFileName = require("../../shared/utilize/sanitizeFileName");
const fs = require("fs");
const path = require("path");
const { default: axios } = require("axios");
const notifyGoogleCrawlRequest = require("../../googleAuth/notifyGoogleCrawlRequest");
const CategoriesMapCollection = require("../../DB/Modals/categoryMap");

router.get("/get-collected-news", async (req, res) => {
  try {
    global.processingNewsList = global.processingNewsList || [];

    const newsCount = await CollectedNewsCollection.countDocuments({});
    if (newsCount === 0) {
      return res.json({
        message: "No news found to modify",
        totalNews: newsCount,
      });
    }
    const avoid = 21;
    let startFrom = newsCount - avoid;
    if (startFrom < 0) {
      startFrom = 0;
    }
    const skip = await getRandomNumber(
      Number(startFrom),
      Number(newsCount - 1)
    );
    const news = await CollectedNewsCollection.findOne({}).skip(skip);

    if (!news || !news._id) {
      return res.json({
        message: "No news found to modify",
      });
    }
    const newsID = news._id.toString();
    if (global.processingNewsList.includes(newsID)) {
      return res.json({
        message: "This news already in processing",
      });
    } else {
      global.processingNewsList.push(newsID);
      setTimeout(() => {
        global.processingNewsList = global.processingNewsList.filter(
          (id) => id !== newsID
        );
      }, 10000);
    }
    res.json({ data: news, totalNews: newsCount });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});

router.get("/delete-collected-news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const news = await CollectedNewsCollection.findOneAndDelete({ _id: id });
    res.json({ data: news });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});
router.post("/send-news", async (req, res) => {
  try {
    const body = req.body;
    const {
      _id,
      title,
      sourceUrl,
      //   category,
      //   categoryLabel,
      //   subcategory,
      //   subcategoryLabel,
      categoryInfo,
      subcategoryInfo,
      modifyTitle,
      modifyHtmlDescription,
      modifyDescription,
      images,
    } = body;
    let category = categoryInfo.route;
    let categoryLabel = categoryInfo.label;
    let subcategory = subcategoryInfo.route;
    let subcategoryLabel = subcategoryInfo.label;
    if (
      !_id ||
      !title ||
      !modifyTitle ||
      !modifyHtmlDescription ||
      !modifyDescription
    ) {
      return res.json({
        message:
          "_id, title, modifyTitle, modifyHtmlDescription, modifyDescription are required",
      });
    }
    if (
      modifyTitle.length < 4 ||
      modifyHtmlDescription.length < 4 ||
      modifyDescription.length < 4
    ) {
      return res.json({
        message:
          "title, modifyTitle, modifyHtmlDescription, modifyDescription length are required",
      });
    }
    console.log("form send new route ==>>", {category, categoryLabel})
    if (category || categoryLabel) {
      const categoryMap = await CategoriesMapCollection.findOne({
        $or: [
          {
            "categoryLabel.label": category,
          },
          {
            "categoryLabel.route": categoryLabel,
          },
        ],
      });
    console.log("form send new route categoryMap ==>> ", categoryMap)

      if(categoryMap){
        category = categoryMap.label;
        categoryLabel = categoryMap.route;
      }
      
    }
    const isExist = await NewsCollection.findOne({
      $or: [
        {
          "source.title": title,
        },
        {
          "source.sourceUrl": sourceUrl,
        },
      ],
    }).select("_id");

    if (isExist) {
      await CollectedNewsCollection.findOneAndDelete({ _id });
      return res.json({
        message: "This news are already exist",
      });
    }

    const checkImagePathExist = async (imgPath, imageUrl) => {
      const sourceImgInfo = await axios.head(imageUrl);
      const imgType = sourceImgInfo.headers["content-type"];
      const imgTypeSplit = imgType.split("/");
      const extension = imgTypeSplit[1] || null;
      if (!extension) {
        return;
      }
      const sanitizeImgPath = sanitizeFileName(imgPath);
      let updatePath = `${sanitizeImgPath}.${extension}`;
      let fullPath = await path.join(newsStoragePath, updatePath);
      if (fs.existsSync(fullPath)) {
        return `${sanitizeImgPath} ${getRandomWord()}.${extension}`;
      }
      // sanitizeFileName
      return updatePath;
    };
    let updateImageList = await Promise.all(
      images.map(async (imgInfo, index) => {
        const { src } = imgInfo;
        let srcInput = index === 0 ? modifyTitle : `${modifyTitle} ${index}`;
        const updatePath = await checkImagePathExist(srcInput, src);
        if (!updatePath) {
          return null;
        }
        return {
          ...imgInfo,
          src: updatePath,
          sourceSrc: src,
        };
      })
    );
    updateImageList = await updateImageList.filter((imgInfo) => imgInfo);
    await saveCategory(category, categoryLabel, subcategory, subcategoryLabel);
    const updateInfo = {
      title: modifyTitle,
      description: modifyDescription,
      htmlDescription: modifyHtmlDescription,
      category: categoryInfo,
      // subcategory,
      images: [...updateImageList],
      source: {
        title: title,
        sourceUrl: sourceUrl,
      },
    };
    if (subcategoryLabel) {
      updateInfo["subcategory"] = subcategoryInfo;
    }
    const data = await NewsCollection.create(updateInfo);
    if (data) {
      await CollectedNewsCollection.findOneAndDelete({ _id });
      await Promise.all(
        updateImageList.map(async (imgInfo) => {
          try {
            const { src, sourceSrc } = imgInfo;
            const imgDestinationPath = path.join(newsStoragePath, src);
            await downloadImage(sourceSrc, imgDestinationPath);
          } catch (error) {}
        })
      );
    }
    const newsDetailsPageUrl = `https://somacharnews.com/news/${data._id}`;
    const notifyResponse = await notifyGoogleCrawlRequest(newsDetailsPageUrl);

    if (notifyResponse) {
      await NewsCollection.findOneAndUpdate(
        { _id: data._id },
        {
          googleIndexInfo: {
            indexed: true,
            date: new Date(),
          },
        }
      );
    }

    res.json({ data: [] });
  } catch (error) {
    res.json({
      message: `Server error:-> ${error.message}`,
    });
  }
});
const of = (async = () => {
  try {
  } catch (error) {}
});

module.exports = router;
