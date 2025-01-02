const CollectedNewsCollection = require("../../DB/Modals/collectedNews");
const NewsCollection = require("../../DB/Modals/news");

const saveToCollectedNews = async (articleInfo) => {
  const { title, htmlDescription, images, category, subcategory, sourceUrl } =
    articleInfo;
  try {
    if (!title || !htmlDescription || !images || !images.length) {
      return;
    }
    const isExist = await CollectedNewsCollection.findOne({
      $or: [{ title }, { sourceUrl }]
    }).select("_id");
    const isExistInNews = await NewsCollection.findOne({
      "source.sourceUrl": sourceUrl
    }).select("_id");
    if (isExist || isExistInNews) {
      return;
    }
    const result = await CollectedNewsCollection.create(articleInfo);
  } catch (error) {}
};

module.exports = saveToCollectedNews;
