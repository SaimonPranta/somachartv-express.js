const router = require("express").Router();
const CategoriesCollection = require("../../../DB/Modals/categories");
const NewsCollection = require("../../../DB/Modals/news");
const getDocument = require("../../../shared/utilize/getDocument");
const { JSDOM } = require("jsdom");
const { createImgFrame } = require("./helper/utilitize");
const getHotNews = require("./helper/functions/getHotNews");
const CategoriesGroupCollection = require("../../../DB/Modals/categoryGroup");



router.get("/sitemap", async (req, res) => {
  try {
    const news = await NewsCollection.find()
      .sort({ createdAt: -1 })
      .select("_id title category createdAt subcategory images updatedAt");

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});
router.get("/", async (req, res) => {
  try {
    const { category, subcategory, categoryGroup, search, sort } =
      req.query; 
    const categoryGroupInfo =  await CategoriesGroupCollection.findOne({groupName: categoryGroup })
    const limit = Number(req.query.limit) || 20;
    const query = {};
    let orQuery = [];
    if (category && category !== "undefined") {
      query["category.label"] = category;
    }
    if (subcategory && subcategory !== "undefined") {
      query["subcategory.label"] = subcategory;
    }
    if (search && search !== "undefined") {
      const searchQuery = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
      orQuery = [...orQuery, ...searchQuery];
    } 
    if (categoryGroupInfo && categoryGroupInfo.categories && categoryGroupInfo.categories.length) {
      await categoryGroupInfo.categories.forEach((currentCategory) => {
        orQuery.push({ "category.label": currentCategory.label });
        orQuery.push({ "category.route": currentCategory.route });
      });
    }
    
    if (orQuery.length) {
      query["$or"] = orQuery;
    }
    const news = await NewsCollection.find({ ...query })
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});

router.get("/sort", async (req, res) => {
  try {
    const { sort } = req.query;

    const limit = 24;
    const page = req.query.page || 1;
    const totalNews = await NewsCollection.countDocuments();
    let newsSlice = totalNews / limit;

    const skip = Number(page - 1) * limit;

    if (skip >= totalNews) {
      return res.json({
        message: "All news are already loaded",
      });
    }

    let newList = [];
    if (sort === "সর্বশেষ") {
      newList = await NewsCollection.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("title images");
    } else if (sort === "জনপ্রিয়") {
      newList = await NewsCollection.find({})
        .skip(skip)
        .limit(limit)
        .sort({ viewCount: -1 })
        .select("title images viewCount");
    }
    res.json({
      data: newList,
      page: page,
      total: totalNews,
    });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});
router.get("/today-hot-news", async (req, res) => {
  try {
    const currentTime = new Date();
    let newList = await getHotNews(currentTime);
    res.json({
      data: newList,
    });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let news = await NewsCollection.findOneAndUpdate(
      { _id: id },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (news.htmlDescription) {
      let updateHtmlDescription = "";

      const document = await getDocument(news.htmlDescription);
      const paragraphs = document.querySelectorAll("p");
      const paragraphImg = news.images.slice(1, news.images.length);
      const images = paragraphImg;
      const result = [];
      let imgIndex = 0;

      const imgPosition = Math.floor(paragraphs.length / images.length);
      await paragraphs.forEach((el, index) => {
        const mainIndex = index + 1;
        updateHtmlDescription += el.outerHTML;
        if (
          imgIndex < images.length &&
          (Number(mainIndex + 1) === paragraphs.length ||
            mainIndex % imgPosition === 0)
        ) {
          const imgInfo = images[imgIndex];
          // const imgEle = document.createElement("img");

          // if (imgInfo.src) {
          //   imgEle.src = `http://localhost:8001/${imgInfo.src}`;
          //   // imgEle.src = imgInfo.src;
          // }
          // imgEle.alt = imgInfo.alt || news;

          updateHtmlDescription += createImgFrame(imgInfo, news);
          imgIndex++;
        }
      });
      news = await { ...news._doc, updateHtmlDescription };
    }
    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
let imgArray = [1, 2, 3];
const result = [];
let imgIndex = 0;

let des = new Array(0).fill("p");
const imgPosition = Math.floor(des.length / imgArray.length);
des.forEach((el, index) => {
  const mainIndex = index + 1;
  result.push(el);
  // Insert an image every two "p" elements
  if (Number(mainIndex + 1) === des.length && imgIndex < imgArray.length) {
    result.push(imgArray[imgIndex]);
    imgIndex++;
  } else if (mainIndex % imgPosition === 0 && imgIndex < imgArray.length) {
    result.push(imgArray[imgIndex]);
    imgIndex++;
  }
});
