const NewsCollection = require("../../../../../DB/Modals/news");

const index = async (dateString = new Date()) => {
  try {
    const limit = 5;
    const twentyFourHourAgo = new Date(dateString);
    twentyFourHourAgo.setHours(twentyFourHourAgo.getHours() - 24);
    const newsList = await NewsCollection.find({
      createdAt: { $gte: twentyFourHourAgo },
    })
      .limit(limit)
      .sort({ viewCount: -1 });
    if (newsList.length < limit) {
      return index(twentyFourHourAgo);
    }

    return newsList;
  } catch (error) {
    return [];
  }
};

module.exports = index;
