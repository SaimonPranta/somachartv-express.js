const router = require("express").Router();
const NewsCollection = require("../../../DB/Modals/news");
const getDocument = require("../../../shared/utilize/getDocument");
const { createImgFrame } = require("./helper/utilitize");
const getHotNews = require("./helper/functions/getHotNews"); 
const { getNewsOrQueries } = require("../../../shared/utilize/getNewQueries");

router.use("/sitemap", require("./routes/sitemap/index"));

router.post("/", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 40);
    const page = Number(req.query.page || 1) - 1;
    let sort = {
      createdAt: -1
    };
    let query = await getNewsOrQueries(req.body);

    const totalNews = await NewsCollection.countDocuments({ ...query });
    const skip = limit * page;
    if (skip > totalNews) {
      return res.json({
        data: [],
        page: page + 1,
        total: totalNews
      });
    }
    let newList = await NewsCollection.find({ ...query })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    res.json({
      data: newList,
      page: page + 1,
      total: totalNews
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
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
        message: "All news are already loaded"
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
      total: totalNews
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});
router.get("/today-hot-news", async (req, res) => {
  try {
    const currentTime = new Date();
    let newList = await getHotNews(currentTime);
    res.json({
      data: newList
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
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
      data: news
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
